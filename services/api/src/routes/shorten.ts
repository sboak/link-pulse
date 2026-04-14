import { Router, Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { setCachedUrl } from "../lib/cache.js";
import { generateCode } from "../lib/nanoid.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "A valid URL is required" });
    return;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  const code = generateCode();

  const link = await prisma.link.create({
    data: { code, url },
  });

  await setCachedUrl(code, url);

  const host = req.get("host") || "localhost:3000";
  const protocol = req.get("x-forwarded-proto") || req.protocol;
  const shortUrl = `${protocol}://${host}/${code}`;

  res.json({
    id: link.id,
    code: link.code,
    url: link.url,
    shortUrl,
    createdAt: link.createdAt,
  });
});

export default router;
