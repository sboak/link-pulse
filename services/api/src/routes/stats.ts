import { Router, Request, Response } from "express";
import { prisma } from "../lib/db.js";

const router = Router();

router.get("/:code", async (req: Request, res: Response) => {
  const code = req.params.code as string;

  const link = await prisma.link.findUnique({
    where: { code },
    select: { id: true, code: true, url: true, createdAt: true },
  });

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const totalClicks = await prisma.click.count({
    where: { linkId: link.id },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyRollups = await prisma.clickRollup.findMany({
    where: {
      linkId: link.id,
      granularity: "day",
      bucket: { gte: sevenDaysAgo },
    },
    orderBy: { bucket: "asc" },
  });

  // fill in missing days with zero counts
  const clicksByDay: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const rollup = dailyRollups.find(
      (r) => r.bucket.toISOString().split("T")[0] === dateStr
    );
    clicksByDay.push({ date: dateStr, count: rollup?.count ?? 0 });
  }

  res.json({
    code: link.code,
    url: link.url,
    createdAt: link.createdAt,
    totalClicks,
    clicksByDay,
  });
});

export default router;
