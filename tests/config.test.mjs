import assert from "node:assert/strict";
import test from "node:test";

import { getLiveDataConfig, parseWaterDataNumber } from "../dist-server/server/live-data.js";

test("live data configuration stays within supported bounds", () => {
  const config = getLiveDataConfig();
  assert.ok(config.rivers > 50, "expected national river coverage");
  assert.ok(config.dams > 20, "expected major storage coverage");
  assert.ok(config.baselineYears >= 3 && config.baselineYears <= 30);
  assert.ok(config.upstreamTimeoutMs >= 5_000);
});

test("missing Water Data Online values are never coerced to zero", () => {
  assert.equal(parseWaterDataNumber(null), null);
  assert.equal(parseWaterDataNumber(undefined), null);
  assert.equal(parseWaterDataNumber(""), null);
  assert.equal(parseWaterDataNumber("not-a-number"), null);
  assert.equal(parseWaterDataNumber("0"), 0);
  assert.equal(parseWaterDataNumber(12.5), 12.5);
});
