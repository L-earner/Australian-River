import type { IncomingMessage, ServerResponse } from "node:http";
import { getConditionsSnapshot, getLiveDataConfig, getRiverDetail } from "./live-data.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function sendJson(response: ServerResponse, status: number, body: unknown, cacheControl = "no-store") {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cacheControl);
  response.end(JSON.stringify(body));
}

function validDate(value: string | null): value is string {
  if (!value || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  const earliest = new Date("1990-01-01T00:00:00.000Z");
  const latest = new Date(Date.now() + 86_400_000);
  return parsed >= earliest && parsed <= latest;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") return "The upstream water-data service timed out.";
  return "Live water data is temporarily unavailable. Please try again shortly.";
}

export async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith("/api/")) return false;

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return true;
  }

  if (url.pathname === "/api/health") {
    sendJson(response, 200, {
      status: "ok",
      generatedAt: new Date().toISOString(),
      config: getLiveDataConfig(),
    });
    return true;
  }

  const date = url.searchParams.get("date");
  if (!validDate(date)) {
    sendJson(response, 400, { error: "Provide a valid date between 1990-01-01 and today." });
    return true;
  }

  try {
    if (url.pathname === "/api/conditions") {
      const snapshot = await getConditionsSnapshot(date);
      sendJson(response, 200, snapshot, date === new Date().toISOString().slice(0, 10) ? "public, max-age=300" : "public, max-age=3600");
      return true;
    }

    const riverMatch = url.pathname.match(/^\/api\/rivers\/([a-z0-9-]+)$/);
    if (riverMatch) {
      const detail = await getRiverDetail(riverMatch[1]!, date);
      if (!detail) sendJson(response, 404, { error: "River not found" });
      else sendJson(response, 200, detail, "public, max-age=300");
      return true;
    }

    sendJson(response, 404, { error: "API route not found" });
    return true;
  } catch (error) {
    console.error("Live data request failed", error);
    sendJson(response, 503, { error: errorMessage(error) });
    return true;
  }
}
