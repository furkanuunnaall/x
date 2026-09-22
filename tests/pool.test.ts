import { test } from "node:test";
import assert from "node:assert/strict";
import { poolTiles } from "../src/poolTiles";
test("pool preserves Turkish letters and repeated answer letters, with three decoys", () => {
  const tiles = poolTiles("ZİLYETLİK", "q", []);
  assert.equal(tiles.length, 12);
  for (const c of [..."ZİLYETLİK"])
    assert.ok(tiles.some((t) => t.letter === c));
  assert.equal(tiles.filter((t) => t.letter === "İ").length, 2);
  assert.deepEqual(tiles, poolTiles("ZİLYETLİK", "q", []));
  assert.notEqual(tiles.map((t) => t.letter).join(""), "ZİLYETLİK");
});
test("each repeated letter consumes only one tile; deletion returns it", () => {
  const filled = poolTiles("İBRA", "q", ["İ"]);
  assert.equal(filled.filter((t) => t.used).length, 1);
  assert.equal(poolTiles("İBRA", "q", []).filter((t) => t.used).length, 0);
  assert.deepEqual(
    filled.map((t) => t.letter),
    poolTiles("İBRA", "q", []).map((t) => t.letter),
  );
});
test("hint positions never consume selected tiles, old keyboard drafts remain supported", () => {
  assert.equal(
    poolTiles("İBRA", "q", ["İ", "B"], { 0: "İ" }).filter((t) => t.used).length,
    1,
  );
  assert.doesNotThrow(() => poolTiles("İBRA", "q", ["Z", "Z", "Z"]));
});
