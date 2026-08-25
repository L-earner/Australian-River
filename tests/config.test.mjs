import assert from "node:assert/strict";
import test from "node:test";

import { getLiveDataConfig } from "../dist-server/server/live-data.js";

test("live data configuration stays within supported bounds", () => {
  const config = getLiveDataConfig();
  assert.ok(config.rivers > 50, "expected national river coverage");
  assert.ok(config.dams > 20, "expected major storage coverage");
  assert.ok(config.baselineYears >= 3 && config.baselineYears <= 30);
  assert.ok(config.upstreamTimeoutMs >= 5_000);
});
