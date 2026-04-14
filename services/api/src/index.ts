import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import shortenRouter from "./routes/shorten.js";
import statsRouter from "./routes/stats.js";
import linksRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// serve the frontend static build
app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/shorten", shortenRouter);
app.use("/api/stats", statsRouter);
app.use("/api/links", linksRouter);

// SPA fallback: if the path looks like a short code, try redirect;
// otherwise serve index.html for client-side routing
app.get("/:code([a-zA-Z0-9_-]{6,12})", redirectRouter);

// catch-all: serve index.html for any other route (SPA)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Link Pulse API listening on port ${PORT}`);
});
