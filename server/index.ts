import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiRequest } from "./api.js";

const port = Number(process.env.PORT ?? 3000);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../dist");

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function readableFile(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

const server = createServer(async (request, response) => {
  if (await handleApiRequest(request, response)) return;

  const requestPath = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  let filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, "index.html")) {
    response.statusCode = 403;
    response.end("Forbidden");
    return;
  }
  if (!(await readableFile(filePath))) filePath = path.join(root, "index.html");
  if (!(await readableFile(filePath))) {
    response.statusCode = 503;
    response.end("Application has not been built. Run npm run build first.");
    return;
  }

  response.statusCode = 200;
  response.setHeader("Content-Type", contentTypes[path.extname(filePath)] ?? "application/octet-stream");
  if (path.basename(filePath) !== "index.html") response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  createReadStream(filePath).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Australian River Conditions listening on http://0.0.0.0:${port}`);
});
