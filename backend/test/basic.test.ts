/// <reference types="node" />
import { test } from "node:test";
import assert from "node:assert/strict";

test("Always passing CI test", () => {
  assert.equal(true, true);
});