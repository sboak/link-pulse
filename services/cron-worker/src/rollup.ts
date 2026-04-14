import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function startOfHour(date: Date): Date {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function rollup() {
  console.log("Starting click rollup…");

  const clicks = await prisma.click.findMany({
    select: { linkId: true, timestamp: true },
    orderBy: { timestamp: "asc" },
  });

  if (clicks.length === 0) {
    console.log("No clicks to process.");
    return;
  }

  console.log(`Processing ${clicks.length} clicks…`);

  // group by linkId + hourly bucket
  const hourlyBuckets = new Map<string, { linkId: string; bucket: Date; count: number }>();
  const dailyBuckets = new Map<string, { linkId: string; bucket: Date; count: number }>();

  for (const click of clicks) {
    const hourBucket = startOfHour(click.timestamp);
    const dayBucket = startOfDay(click.timestamp);

    const hourKey = `${click.linkId}:${hourBucket.toISOString()}`;
    const dayKey = `${click.linkId}:${dayBucket.toISOString()}`;

    const existing = hourlyBuckets.get(hourKey);
    if (existing) {
      existing.count++;
    } else {
      hourlyBuckets.set(hourKey, { linkId: click.linkId, bucket: hourBucket, count: 1 });
    }

    const existingDay = dailyBuckets.get(dayKey);
    if (existingDay) {
      existingDay.count++;
    } else {
      dailyBuckets.set(dayKey, { linkId: click.linkId, bucket: dayBucket, count: 1 });
    }
  }

  // upsert hourly rollups
  for (const entry of hourlyBuckets.values()) {
    await prisma.clickRollup.upsert({
      where: {
        linkId_bucket_granularity: {
          linkId: entry.linkId,
          bucket: entry.bucket,
          granularity: "hour",
        },
      },
      update: { count: entry.count },
      create: {
        linkId: entry.linkId,
        bucket: entry.bucket,
        granularity: "hour",
        count: entry.count,
      },
    });
  }

  // upsert daily rollups
  for (const entry of dailyBuckets.values()) {
    await prisma.clickRollup.upsert({
      where: {
        linkId_bucket_granularity: {
          linkId: entry.linkId,
          bucket: entry.bucket,
          granularity: "day",
        },
      },
      update: { count: entry.count },
      create: {
        linkId: entry.linkId,
        bucket: entry.bucket,
        granularity: "day",
        count: entry.count,
      },
    });
  }

  console.log(
    `Rolled up into ${hourlyBuckets.size} hourly and ${dailyBuckets.size} daily buckets.`
  );
}

rollup()
  .then(() => {
    console.log("Rollup complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Rollup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
