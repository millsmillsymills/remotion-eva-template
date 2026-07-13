import assert from 'node:assert/strict';
import test from 'node:test';

import { duotone, parseHex } from './duotone.mjs';

test('parseHex parses #rrggbb', () => {
	assert.deepEqual(parseHex('#00f0ff'), [0, 240, 255]);
});

test('parseHex rejects non-hex input', () => {
	assert.throws(() => parseHex('cyan'), /expected #rrggbb/);
});

test('duotone maps black to shadow, white to highlight, preserves alpha', () => {
	const px = Uint8Array.from([0, 0, 0, 200, 255, 255, 255, 90]);
	duotone(px, [3, 3, 8], [0, 240, 255]);
	assert.deepEqual([...px], [3, 3, 8, 200, 0, 240, 255, 90]);
});

test('duotone maps mid gray to the ramp midpoint', () => {
	const px = Uint8Array.from([128, 128, 128, 255]);
	duotone(px, [0, 0, 0], [255, 255, 255]);
	assert.deepEqual([...px], [128, 128, 128, 255]);
});
