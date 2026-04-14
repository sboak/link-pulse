import { Router, Request, Response } from "express";
import { prisma } from "../lib/db.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const links = await prisma.link.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clicks: true } },
    },
  });

  res.json({
    links: links.map((l) => ({
      id: l.id,
      code: l.code,
      url: l.url,
      totalClicks: l._count.clicks,
      createdAt: l.createdAt,
    })),
  });
});

export default router;
