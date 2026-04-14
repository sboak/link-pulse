import { Router, Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { getCachedUrl, setCachedUrl } from "../lib/cache.js";

const router = Router();

router.get("/:code", async (req: Request, res: Response) => {
  const code = req.params.code as string;

  let url = await getCachedUrl(code);

  if (!url) {
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) {
      res.status(404).json({ error: "Short link not found" });
      return;
    }
    url = link.url;
    await setCachedUrl(code, url);
  }

  const linkRecord = await prisma.link.findUnique({
    where: { code },
    select: { id: true },
  });

  if (linkRecord) {
    prisma.click
      .create({
        data: {
          linkId: linkRecord.id,
          referrer: (req.get("referer") as string) || null,
        },
      })
      .catch((err: Error) => console.error("Click tracking failed:", err.message));
  }

  res.redirect(302, url);
});

export default router;
