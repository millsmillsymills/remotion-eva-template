# remotion-eva-template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish `millsmillsymills/remotion-eva-template` — a public GitHub template repo of the eva-style Remotion intro with placeholder assets users replace with their own.

**Architecture:** Direct port of `millsymills.com/video/` (beat-driven storyboard, five beat components, CRT helpers) with all personal content extracted into `brand.ts` + `sequence.ts`, OFL-only fonts, script-generated duotone placeholder images, and optional drop-in audio.

**Tech Stack:** Remotion 4.0.486, React 19.2.7, TypeScript 6.0.3, sharp 0.35.3 (dev, placeholder generation), node:test, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-07-13-remotion-eva-template-design.md`

**One approved deviation from spec:** `BRAND.bootText` is dropped — the boot beat's text lives in the storyboard and reads `BRAND.tagline`, so the field would have been redundant.

## Global Constraints

- Repo root: `/Users/mills/Desktop/Projects/remotion-eva-template` (git already initialized on `main`, spec committed).
- Exact version pins, no `^`/`~`: `remotion@4.0.486`, `@remotion/cli@4.0.486`, `react@19.2.7`, `react-dom@19.2.7`, `@types/react@19.2.17`, `typescript@6.0.3`, `sharp@0.35.3`.
- Ship only OFL fonts (Press Start 2P, VT323, Orbitron) with their OFL license text. Never commit Tr2n, VCR OSD Mono, or any audio.
- No personal content anywhere: no "mills", "millsymills", UNIFI/Protonmail/Unraid/Gandi copy, or personal image assets.
- README must NOT claim `npx create-video --template` support (it doesn't exist for community repos).
- "Evangelion-inspired" in prose only; no NGE assets.
- Composition: id `intro`, 1920×1080 @ 30fps, duration derived via `totalFrames()`.
- Code style: tabs (match source project), 100-char lines, comments only for non-obvious constraints.
- Source files to port live at `/Users/mills/Desktop/Projects/millsymills.com/video/` (read-only — never modify that repo).
- Commit after every task; commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Project scaffold, textures, fonts

**Files:**
- Create: `package.json`, `tsconfig.json`, `remotion.config.ts`, `.gitignore`
- Create: `assets/textures/{scanlines,grain,grid-floor,rays}.svg` (copied from source project)
- Create: `assets/fonts/{PressStart2P.ttf,VT323.ttf,Orbitron.ttf}` + per-font OFL txt

**Interfaces:**
- Produces: npm scripts `studio` / `render` / `poster` / `check` / `test`; `assets/` as Remotion public dir; font files at `fonts/<Name>.ttf` paths consumed by Task 3's `fonts.ts`; texture files at `textures/<name>.svg` consumed by Task 4's `Overlays.tsx` and `Lockup.tsx`.

- [ ] **Step 1: Write config files**

`package.json`:

```json
{
	"name": "remotion-eva-template",
	"private": true,
	"type": "module",
	"scripts": {
		"studio": "remotion studio",
		"render": "remotion render src/index.ts intro out/intro.mp4 --crf 26",
		"poster": "remotion still src/index.ts intro out/poster.jpg --frame 780",
		"check": "tsc --noEmit",
		"test": "node --test scripts/"
	},
	"dependencies": {
		"@remotion/cli": "4.0.486",
		"react": "19.2.7",
		"react-dom": "19.2.7",
		"remotion": "4.0.486"
	},
	"devDependencies": {
		"@types/react": "19.2.17",
		"sharp": "0.35.3",
		"typescript": "6.0.3"
	}
}
```

`tsconfig.json`:

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "ESNext",
		"moduleResolution": "Bundler",
		"jsx": "react-jsx",
		"strict": true,
		"noEmit": true,
		"skipLibCheck": true,
		"noUncheckedIndexedAccess": true,
		"exactOptionalPropertyTypes": true,
		"verbatimModuleSyntax": true,
		"isolatedModules": true
	},
	"include": ["src", "remotion.config.ts"]
}
```

`remotion.config.ts`:

```ts
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// staticFile() resolves against assets/, not the Remotion default of public/.
Config.setPublicDir('assets');
```

`.gitignore`:

```
node_modules/
out/
# a drop-in soundtrack is usually not yours to redistribute; remove this rule
# only if your track is
assets/track.mp3
```

- [ ] **Step 2: Copy textures from the source project**

```bash
mkdir -p assets/textures assets/fonts assets/cutouts assets/stills assets/logos
cp /Users/mills/Desktop/Projects/millsymills.com/video/assets/textures/*.svg assets/textures/
ls assets/textures
```

Expected: `grain.svg  grid-floor.svg  rays.svg  scanlines.svg`

- [ ] **Step 3: Download OFL fonts + licenses**

```bash
base="https://github.com/google/fonts/raw/main/ofl"
curl -fsSL -o assets/fonts/PressStart2P.ttf "$base/pressstart2p/PressStart2P-Regular.ttf"
curl -fsSL -o assets/fonts/PressStart2P-OFL.txt "$base/pressstart2p/OFL.txt"
curl -fsSL -o assets/fonts/VT323.ttf "$base/vt323/VT323-Regular.ttf"
curl -fsSL -o assets/fonts/VT323-OFL.txt "$base/vt323/OFL.txt"
curl -fsSL -o assets/fonts/Orbitron.ttf "$base/orbitron/Orbitron%5Bwght%5D.ttf"
curl -fsSL -o assets/fonts/Orbitron-OFL.txt "$base/orbitron/OFL.txt"
file assets/fonts/*.ttf
```

Expected: each `.ttf` reported as `TrueType Font data`. If a URL 404s, find the current path with `gh api repos/google/fonts/contents/ofl/<family>` and use that file name.

- [ ] **Step 4: Install and verify**

```bash
npm install
npm run check
```

Expected: install completes; `check` exits 0 (no src yet — tsc checks `remotion.config.ts` only).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold remotion workspace with textures and OFL fonts"
```

---

### Task 2: Duotone script (TDD) + placeholder assets

**Files:**
- Create: `scripts/duotone.mjs`
- Test: `scripts/duotone.test.mjs`
- Create (generated): `assets/cutouts/placeholder-{cyan,magenta,red,amber,purple,phosphor}.png`, `assets/stills/placeholder-fullframe.png`
- Create: `assets/logos/placeholder-logo.svg`

**Interfaces:**
- Produces: CLI `node scripts/duotone.mjs <input.png> <accent|#shadow,#highlight> <output.png>` and `node scripts/duotone.mjs --placeholders`; exports `parseHex(hex): [r,g,b]` and `duotone(rgba, shadow, highlight): Uint8Array` for tests; the seven generated PNGs at the exact paths Task 3's `STILLS` map references.

- [ ] **Step 1: Write the failing test**

`scripts/duotone.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./duotone.mjs`

- [ ] **Step 3: Write the implementation**

`scripts/duotone.mjs`:

```js
// Duotone treatment: maps pixel luminance onto a shadow→highlight color ramp,
// preserving alpha. Treatment only — background removal (the cutout) is up to
// you: Preview, rembg, remove.bg, etc.
//
//   node scripts/duotone.mjs input.png cyan out.png
//   node scripts/duotone.mjs input.png "#030308,#00f0ff" out.png
//   node scripts/duotone.mjs --placeholders   (regenerate the committed set)
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ACCENTS = {
	cyan: '#00f0ff',
	magenta: '#ff2bd6',
	phosphor: '#39ff14',
	amber: '#ffb000',
	purple: '#b066ff',
	red: '#ff3344',
};
const SHADOW = '#030308';

export function parseHex(hex) {
	const m = /^#([0-9a-f]{6})$/i.exec(hex);
	if (!m) throw new Error(`bad color: ${hex} (expected #rrggbb)`);
	const n = Number.parseInt(m[1], 16);
	return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function duotone(rgba, shadow, highlight) {
	for (let i = 0; i < rgba.length; i += 4) {
		const luma = (0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]) / 255;
		rgba[i] = Math.round(shadow[0] + (highlight[0] - shadow[0]) * luma);
		rgba[i + 1] = Math.round(shadow[1] + (highlight[1] - shadow[1]) * luma);
		rgba[i + 2] = Math.round(shadow[2] + (highlight[2] - shadow[2]) * luma);
	}
	return rgba;
}

async function treat(input, shadow, highlight, output) {
	const { data, info } = await sharp(input)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	duotone(data, shadow, highlight);
	await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
		.png()
		.toFile(output);
	console.log(`wrote ${output} (${info.width}x${info.height})`);
}

// Abstract "unit" silhouette, portrait with alpha; grayscale gradients so the
// duotone ramp reads. Geometry varies per index.
function cutoutSvg(i) {
	const sway = (i - 2.5) * 30;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
	<defs>
		<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#ffffff"/>
			<stop offset="1" stop-color="#555555"/>
		</linearGradient>
	</defs>
	<g transform="translate(${540 + sway} 0)">
		<circle cx="0" cy="230" r="130" fill="url(#g)"/>
		<polygon points="-40,${90 - i * 8} 40,${70 + i * 8} 10,210 -10,210" fill="#ffffff"/>
		<polygon points="-260,470 260,470 ${180 - i * 20},1350 ${-180 + i * 20},1350" fill="url(#g)"/>
		<rect x="-320" y="500" width="90" height="${420 + i * 60}"
			transform="rotate(${8 + i * 2} -275 500)" fill="url(#g)"/>
		<rect x="230" y="500" width="90" height="${420 + (5 - i) * 60}"
			transform="rotate(${-8 - i * 2} 275 500)" fill="url(#g)"/>
	</g>
</svg>`;
}

const FULLFRAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
	<defs>
		<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#e8e8e8"/>
			<stop offset="1" stop-color="#1a1a1a"/>
		</linearGradient>
	</defs>
	<rect width="1920" height="1080" fill="url(#sky)"/>
	<circle cx="960" cy="430" r="260" fill="#ffffff"/>
	<polygon points="0,1080 480,560 830,1080" fill="#333333"/>
	<polygon points="700,1080 1220,480 1920,1080" fill="#444444"/>
	<rect y="900" width="1920" height="180" fill="#111111"/>
</svg>`;

async function generatePlaceholders() {
	const shadow = parseHex(SHADOW);
	const order = ['cyan', 'magenta', 'red', 'amber', 'purple', 'phosphor'];
	for (const [i, accent] of order.entries()) {
		const png = await sharp(Buffer.from(cutoutSvg(i))).png().toBuffer();
		await treat(png, shadow, parseHex(ACCENTS[accent]), `assets/cutouts/placeholder-${accent}.png`);
	}
	const still = await sharp(Buffer.from(FULLFRAME_SVG)).png().toBuffer();
	await treat(still, shadow, parseHex(ACCENTS.cyan), 'assets/stills/placeholder-fullframe.png');
}

async function main(argv) {
	if (argv[0] === '--placeholders') {
		await generatePlaceholders();
		return;
	}
	const [input, color, output] = argv;
	if (!input || !color || !output) {
		console.error(
			'usage: node scripts/duotone.mjs <input> <accent|#shadow,#highlight> <output>\n' +
				`       accents: ${Object.keys(ACCENTS).join(', ')}\n` +
				'       node scripts/duotone.mjs --placeholders',
		);
		process.exit(1);
	}
	let shadow = parseHex(SHADOW);
	let highlight;
	if (color.includes(',')) {
		const [s, h] = color.split(',');
		shadow = parseHex(s);
		highlight = parseHex(h);
	} else {
		highlight = parseHex(ACCENTS[color] ?? color);
	}
	await treat(input, shadow, highlight, output);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	await main(process.argv.slice(2));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: 4 passing tests.

- [ ] **Step 5: Generate the placeholders and verify alpha**

```bash
node scripts/duotone.mjs --placeholders
node -e "
const sharp = require('sharp');
(async () => {
  for (const f of ['assets/cutouts/placeholder-cyan.png', 'assets/stills/placeholder-fullframe.png']) {
    const m = await sharp(f).metadata();
    console.log(f, m.width + 'x' + m.height, 'alpha:', m.hasAlpha);
  }
})();
"
```

Expected: seven PNGs written; cutout is `1080x1350 alpha: true`, still is `1920x1080 alpha: true`. Open one cutout to eyeball: silhouette in accent color on transparency.

- [ ] **Step 6: Author the placeholder logo**

`assets/logos/placeholder-logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
	<polygon points="160,16 288,88 288,232 160,304 32,232 32,88"
		fill="none" stroke="#00f0ff" stroke-width="10"/>
	<polygon points="160,84 232,124 232,196 160,236 88,196 88,124"
		fill="none" stroke="#ff2bd6" stroke-width="8"/>
	<circle cx="160" cy="160" r="26" fill="#e8f6ff"/>
</svg>
```

- [ ] **Step 7: Commit**

```bash
git add scripts assets/cutouts assets/stills assets/logos
git commit -m "feat: duotone treatment script and generated placeholder assets"
```

---

### Task 3: Core modules (palette, timing, crt, brand, fonts, sequence)

**Files:**
- Create: `src/intro/palette.ts`, `src/intro/timing.ts`, `src/intro/crt.ts`, `src/intro/brand.ts`, `src/intro/fonts.ts`, `src/intro/sequence.ts`

**Interfaces:**
- Consumes: font/asset paths from Tasks 1–2.
- Produces: `PALETTE` + `Accent` type; `FPS`; `steps(value, n?)`, `flicker(frame, seed?)`; `BRAND: Brand` (`wordmark`, `tagline`, `logo`, `track: {file, offsetSec} | null`); `STILLS` map + `StillId`; `BEATS: readonly Beat[]` + `Beat` union (`boot`/`card`/`still`/`strobe`/`lockup`); `totalFrames(): number`. Importing `./fonts` for side effects loads the three faces under families `Orbitron`, `Press Start 2P`, `VT323`.

- [ ] **Step 1: Port the verbatim modules**

`src/intro/palette.ts` (verbatim from source):

```ts
// Storyboard palette — the intro deliberately grades hotter than typical site
// chrome.
export const PALETTE = {
	void: '#030308',
	cyan: '#00f0ff',
	magenta: '#ff2bd6',
	phosphor: '#39ff14',
	amber: '#ffb000',
	purple: '#b066ff',
	red: '#ff3344',
	fg: '#e8f6ff',
} as const;

export type Accent = 'cyan' | 'magenta' | 'phosphor' | 'amber' | 'purple' | 'red';
```

`src/intro/timing.ts`:

```ts
export const FPS = 30;
```

`src/intro/crt.ts` (verbatim from source):

```ts
// Everything in this system moves in steps, never smooth — CRT grammar.
export function steps(value: number, n = 8): number {
	return Math.floor(value * n) / n;
}

// Per-frame flicker; sin-hash keeps it deterministic so renders reproduce.
export function flicker(frame: number, seed = 0): number {
	const x = Math.sin((frame + seed) * 12.9898) * 43758.5453;
	const r = x - Math.floor(x);
	return r < 0.12 ? 0.82 : 1;
}
```

- [ ] **Step 2: Write brand.ts**

`src/intro/brand.ts`:

```ts
// Your identity — edit this file first. Everything else that needs changing
// lives in sequence.ts (the storyboard) and palette.ts (the colors).
export interface Brand {
	readonly wordmark: string;
	readonly tagline: string;
	readonly logo: string;
	// To add a soundtrack: drop assets/track.mp3 in place and set
	// { file: 'track.mp3', offsetSec: 0 }. offsetSec is where in the track
	// frame 0 lands; renders are silent while this is null.
	readonly track: { readonly file: string; readonly offsetSec: number } | null;
}

export const BRAND: Brand = {
	wordmark: 'ACME',
	tagline: '> example.com',
	logo: 'logos/placeholder-logo.svg',
	track: null,
};
```

- [ ] **Step 3: Write fonts.ts**

`src/intro/fonts.ts` (Orbitron is a variable font — the weight range descriptor
lets components pick weights):

```ts
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

const FACES = [
	{ family: 'Orbitron', file: 'fonts/Orbitron.ttf', weight: '400 900' },
	{ family: 'Press Start 2P', file: 'fonts/PressStart2P.ttf', weight: '400' },
	{ family: 'VT323', file: 'fonts/VT323.ttf', weight: '400' },
] as const;

const handle = delayRender('intro fonts');

Promise.all(
	FACES.map(async ({ family, file, weight }) => {
		const face = new FontFace(family, `url('${staticFile(file)}') format('truetype')`, {
			weight,
		});
		await face.load();
		document.fonts.add(face);
	}),
).then(
	() => continueRender(handle),
	(err: unknown) => cancelRender(err),
);
```

- [ ] **Step 4: Write sequence.ts with generic storyboard**

`src/intro/sequence.ts`:

```ts
import { BRAND } from './brand';
import type { Accent } from './palette';

// `cutout` stills are alpha PNGs floated on the void + grid; the rest are
// full-frame treatments. Point these at your own images (see
// scripts/duotone.mjs for the treatment).
export const STILLS = {
	cutMagenta: { src: 'cutouts/placeholder-magenta.png', cutout: true },
	cutRed: { src: 'cutouts/placeholder-red.png', cutout: true },
	cutAmber: { src: 'cutouts/placeholder-amber.png', cutout: true },
	cutPurple: { src: 'cutouts/placeholder-purple.png', cutout: true },
	cutPhosphor: { src: 'cutouts/placeholder-phosphor.png', cutout: true },
	cutCyan: { src: 'cutouts/placeholder-cyan.png', cutout: true },
	fullFrame: { src: 'stills/placeholder-fullframe.png', cutout: false },
} as const;

export type StillId = keyof typeof STILLS;

export type Beat =
	| { readonly from: number; readonly dur: number; readonly kind: 'boot'; readonly text: string }
	| {
			readonly from: number;
			readonly dur: number;
			readonly kind: 'card';
			readonly eyebrow: string;
			readonly text: string;
			readonly accent: Accent;
	  }
	| {
			readonly from: number;
			readonly dur: number;
			readonly kind: 'still';
			readonly still: StillId;
			readonly zoom?: number;
			readonly flash?: boolean;
	  }
	| {
			readonly from: number;
			readonly dur: number;
			readonly kind: 'strobe';
			readonly stills: readonly StillId[];
			readonly framesPer: number;
	  }
	| { readonly from: number; readonly dur: number; readonly kind: 'lockup' };

// The cut, in frames @ 30fps: boot → flash/card pairs → strobe → notice →
// lockup. Rewrite the copy, keep (or retime) the rhythm.
export const BEATS: readonly Beat[] = [
	{ from: 0, dur: 75, kind: 'boot', text: BRAND.tagline },
	{ from: 75, dur: 15, kind: 'still', still: 'cutMagenta', flash: true },
	{ from: 90, dur: 60, kind: 'card', eyebrow: 'TRANSMISSION 01', text: 'YOUR OPENING LINE HERE', accent: 'cyan' },
	{ from: 150, dur: 15, kind: 'still', still: 'cutRed' },
	{ from: 165, dur: 60, kind: 'card', eyebrow: 'TRANSMISSION 02', text: 'A SECOND LINE OF INTENT', accent: 'magenta' },
	{ from: 225, dur: 15, kind: 'still', still: 'fullFrame' },
	{ from: 240, dur: 60, kind: 'card', eyebrow: 'UNIT-01 · FIRST PROJECT', text: 'WHAT IT DOES · IN CAPS', accent: 'cyan' },
	{ from: 300, dur: 15, kind: 'still', still: 'cutAmber', zoom: 1.4 },
	{ from: 315, dur: 60, kind: 'card', eyebrow: 'UNIT-02 · SECOND PROJECT', text: 'ANOTHER CAPABILITY LINE', accent: 'magenta' },
	{ from: 375, dur: 15, kind: 'still', still: 'cutPurple', zoom: 1.4 },
	{ from: 390, dur: 60, kind: 'card', eyebrow: 'UNIT-03 · THIRD PROJECT', text: 'STATUS LINE · ALL CLEAR', accent: 'phosphor' },
	{ from: 450, dur: 15, kind: 'still', still: 'cutPhosphor' },
	{ from: 465, dur: 60, kind: 'card', eyebrow: 'UNIT-04 · FOURTH PROJECT', text: 'ONE MORE CAPABILITY', accent: 'amber' },
	{ from: 525, dur: 15, kind: 'strobe', stills: ['cutMagenta', 'cutRed', 'cutCyan', 'cutPhosphor'], framesPer: 3 },
	{ from: 540, dur: 90, kind: 'card', eyebrow: 'NOTICE', text: 'YOUR DISCLAIMER LINE HERE.', accent: 'red' },
	{ from: 630, dur: 60, kind: 'card', eyebrow: 'ALL UNITS', text: 'STATUS: ONLINE', accent: 'phosphor' },
	{ from: 690, dur: 210, kind: 'lockup' },
];

export function totalFrames(): number {
	let end = 0;
	for (const beat of BEATS) end = Math.max(end, beat.from + beat.dur);
	return end;
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: core intro modules — palette, crt grammar, brand config, storyboard"
```

---

### Task 4: Components, Root, entry — renderable composition

**Files:**
- Create: `src/intro/Overlays.tsx`, `src/intro/Boot.tsx`, `src/intro/TitleCard.tsx`, `src/intro/StillCut.tsx`, `src/intro/Lockup.tsx`, `src/intro/Intro.tsx`, `src/Root.tsx`, `src/index.ts`

**Interfaces:**
- Consumes: everything from Task 3 (`BRAND`, `BEATS`, `STILLS`, `PALETTE`, `FPS`, `steps`, `flicker`, `totalFrames`).
- Produces: registered composition `intro` renderable by the CLI.

- [ ] **Step 1: Port the verbatim components**

`src/intro/Overlays.tsx`, `src/intro/TitleCard.tsx`, `src/intro/StillCut.tsx` are byte-identical ports of the source files at
`/Users/mills/Desktop/Projects/millsymills.com/video/src/intro/` — copy them:

```bash
src="/Users/mills/Desktop/Projects/millsymills.com/video/src"
cp "$src/intro/Overlays.tsx" "$src/intro/TitleCard.tsx" "$src/intro/StillCut.tsx" src/intro/
cp "$src/Root.tsx" src/
cp "$src/index.ts" src/
```

- [ ] **Step 2: Write Boot.tsx (VT323 swap)**

`src/intro/Boot.tsx` — as source but `fontFamily: "'VT323', monospace"`:

```tsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { GridFloor, Scanlines } from './Overlays';
import { PALETTE } from './palette';

export const Boot: React.FC<{ text: string }> = ({ text }) => {
	const frame = useCurrentFrame();
	const chars = Math.min(text.length, Math.floor(frame / 3));
	const cursorOn = Math.floor(frame / 8) % 2 === 0;
	return (
		<AbsoluteFill
			style={{ backgroundColor: PALETTE.void, alignItems: 'center', justifyContent: 'center' }}
		>
			<GridFloor />
			<div
				style={{
					fontFamily: "'VT323', monospace",
					fontSize: 72,
					color: PALETTE.phosphor,
					textShadow: `0 0 12px ${PALETTE.phosphor}`,
					whiteSpace: 'pre',
				}}
			>
				{text.slice(0, chars)}
				<span style={{ opacity: cursorOn ? 1 : 0 }}>█</span>
			</div>
			<Scanlines />
		</AbsoluteFill>
	);
};
```

- [ ] **Step 3: Write Lockup.tsx (brand-driven, Orbitron)**

`src/intro/Lockup.tsx`:

```tsx
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

import { BRAND } from './brand';
import { flicker, steps } from './crt';
import { Grain, GridFloor, Scanlines } from './Overlays';
import { PALETTE } from './palette';

export const Lockup: React.FC = () => {
	const frame = useCurrentFrame();
	const rotation = steps(frame / 240, 8) * 45;
	const visible = frame > 10;
	const cursorOn = Math.floor(frame / 8) % 2 === 0;
	return (
		<AbsoluteFill
			style={{ backgroundColor: PALETTE.void, alignItems: 'center', justifyContent: 'center' }}
		>
			<GridFloor />
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('textures/rays.svg')})`,
					backgroundPosition: 'center',
					transform: `rotate(${rotation}deg) scale(1.6)`,
					opacity: 0.7,
				}}
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 48,
					opacity: visible ? flicker(frame, 7) : 0,
				}}
			>
				<Img src={staticFile(BRAND.logo)} style={{ width: 320, height: 320 }} />
				<div
					style={{
						fontFamily: "'Orbitron', 'Press Start 2P', monospace",
						fontWeight: 700,
						fontSize: 160,
						color: PALETTE.cyan,
						textShadow: `0 0 24px ${PALETTE.cyan}, 6px 0 ${PALETTE.magenta}, -6px 0 ${PALETTE.cyan}`,
						letterSpacing: '0.08em',
					}}
				>
					{BRAND.wordmark}
				</div>
				<div style={{ fontFamily: "'VT323', monospace", fontSize: 40, color: PALETTE.fg }}>
					{BRAND.tagline}
					<span style={{ opacity: cursorOn ? 1 : 0, color: PALETTE.phosphor }}>█</span>
				</div>
			</div>
			<Scanlines />
			<Grain />
		</AbsoluteFill>
	);
};
```

- [ ] **Step 4: Write Intro.tsx (conditional audio)**

`src/intro/Intro.tsx`:

```tsx
import {
	AbsoluteFill,
	Html5Audio,
	interpolate,
	Sequence,
	staticFile,
	useVideoConfig,
} from 'remotion';

import './fonts';
import { Boot } from './Boot';
import { BRAND } from './brand';
import { Lockup } from './Lockup';
import { PALETTE } from './palette';
import { BEATS, type Beat } from './sequence';
import { StillCut, Strobe } from './StillCut';
import { TitleCard } from './TitleCard';

function beatElement(beat: Beat): React.ReactElement {
	switch (beat.kind) {
		case 'boot':
			return <Boot text={beat.text} />;
		case 'card':
			return <TitleCard eyebrow={beat.eyebrow} text={beat.text} accent={beat.accent} />;
		case 'still':
			return <StillCut still={beat.still} zoom={beat.zoom} flash={beat.flash} />;
		case 'strobe':
			return <Strobe stills={beat.stills} framesPer={beat.framesPer} />;
		case 'lockup':
			return <Lockup />;
	}
}

export const Intro: React.FC = () => {
	const { durationInFrames, fps } = useVideoConfig();
	return (
		<AbsoluteFill style={{ backgroundColor: PALETTE.void }}>
			{BEATS.map((beat, i) => (
				<Sequence key={i} from={beat.from} durationInFrames={beat.dur}>
					{beatElement(beat)}
				</Sequence>
			))}
			{BRAND.track ? (
				<Html5Audio
					src={staticFile(BRAND.track.file)}
					trimBefore={Math.round(BRAND.track.offsetSec * fps)}
					volume={(f) =>
						interpolate(f, [durationInFrames - 20, durationInFrames - 2], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			) : null}
		</AbsoluteFill>
	);
};
```

- [ ] **Step 5: Typecheck, render smoke, poster frame**

```bash
npm run check
npx remotion render src/index.ts intro out/smoke.mp4 --frames=0-9
npx remotion still src/index.ts intro out/lockup-check.jpg --frame 780
```

Expected: check exits 0; both renders succeed. Open `out/lockup-check.jpg` and confirm: logo, `ACME` wordmark in Orbitron with cyan glow, `> example.com` tagline, rays + grid visible. Open `out/smoke.mp4` and confirm the boot typewriter renders in VT323.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: beat components and renderable intro composition"
```

---

### Task 5: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `check` / `test` npm scripts, composition `intro`.
- Produces: CI gate for the published repo.

- [ ] **Step 1: Resolve current action SHAs**

```bash
gh api repos/actions/checkout/git/ref/tags/v4.2.2 --jq .object.sha
gh api repos/actions/setup-node/git/ref/tags/v4.4.0 --jq .object.sha
```

Use the returned SHAs below (values shown are correct as of writing — trust the command output over the plan). If a tag is missing, list tags with `gh api repos/actions/<repo>/tags --jq '.[].name'` and pin the latest v4 patch.

- [ ] **Step 2: Write the workflow**

`.github/workflows/ci.yml` (substitute resolved SHAs):

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          persist-credentials: false
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npx remotion render src/index.ts intro out/smoke.mp4 --frames=0-9
```

- [ ] **Step 3: Lint the workflow**

```bash
actionlint .github/workflows/ci.yml
zizmor .github/workflows/ci.yml
```

Expected: both clean (zizmor may note `cache: npm` cache poisoning as informational on public repos — acceptable for a read-only-permissions workflow; fix anything above informational).

- [ ] **Step 4: Commit**

```bash
git add .github
git commit -m "ci: typecheck, script tests, render smoke on SHA-pinned actions"
```

---

### Task 6: README, LICENSE, hero poster

**Files:**
- Create: `README.md`, `LICENSE`, `docs/poster.jpg` (rendered)

**Interfaces:**
- Consumes: the finished composition; `npm run poster`.
- Produces: the public face of the template.

- [ ] **Step 1: Full render + poster**

```bash
npm run render
npm run poster
mkdir -p docs
cp out/poster.jpg docs/poster.jpg
```

Expected: `out/intro.mp4` (30s, 900 frames, silent) renders without error; poster copied. Watch the mp4 once end-to-end: boot → cards/stills alternation → strobe → notice → lockup, no missing images, no font fallbacks (Orbitron wordmark must not look like Press Start 2P).

- [ ] **Step 2: Write LICENSE**

`LICENSE` — MIT, standard text:

```
MIT License

Copyright (c) 2026 millsmillsymills

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Write README.md**

```markdown
# remotion-eva-template

An Evangelion-inspired title sequence as a [Remotion](https://www.remotion.dev/)
template: hard-cut title cards, duotone photo cutouts over a grid floor, strobe
cuts, CRT flicker and scanlines, a typewriter boot, and a logo lockup. 30
seconds, 1920×1080 @ 30fps.

![Lockup frame from the template render](docs/poster.jpg)

## Quickstart

Click **Use this template** on GitHub (or `npx degit millsmillsymills/remotion-eva-template my-intro`), then:

```bash
npm install
npm run studio   # live preview
npm run render   # out/intro.mp4
```

## Make it yours

Three files to edit, in order:

1. **`src/intro/brand.ts`** — wordmark, tagline, logo path, optional soundtrack.
2. **`src/intro/sequence.ts`** — the storyboard. A typed array of beats
   (`boot`, `card`, `still`, `strobe`, `lockup`) with frame timings. Rewrite
   the copy; retime or reorder beats freely — the composition duration is
   derived from the array.
3. **`src/intro/palette.ts`** — the accent colors, if cyan/magenta isn't you.

### Replace the images

Placeholder art lives in `assets/cutouts/` (portrait alpha PNGs, floated over
the grid floor) and `assets/stills/` (full-frame). Point the `STILLS` map in
`sequence.ts` at your files.

To give your own photos the duotone treatment:

```bash
node scripts/duotone.mjs your-cutout.png cyan assets/cutouts/your-cutout-cyan.png
node scripts/duotone.mjs photo.png "#030308,#ff2bd6" assets/stills/photo-magenta.png
```

Accents: `cyan`, `magenta`, `phosphor`, `amber`, `purple`, `red` — or pass an
explicit `#shadow,#highlight` pair. The script treats colors only; it does
**not** remove backgrounds. Make cutouts first with whatever you have (macOS
Preview's Remove Background, [rembg](https://github.com/danielgatis/rembg),
remove.bg), then treat them.

Regenerate the stock placeholders any time with
`node scripts/duotone.mjs --placeholders`.

### Add a soundtrack

Renders are silent by default. Drop your track at `assets/track.mp3` and set in
`brand.ts`:

```ts
track: { file: 'track.mp3', offsetSec: 0 },
```

`offsetSec` is where in the track frame 0 lands — nudge it until a downbeat
hits the first flash cut (frame 75, t=2.5s). The track fades out over the
final frames automatically.

`assets/track.mp3` is gitignored on the assumption the audio isn't yours to
redistribute; if it is, delete that line from `.gitignore`.

### Fonts

| Role | Face | License |
|------|------|---------|
| Boot / tagline | VT323 | OFL |
| Cards | Press Start 2P | OFL |
| Lockup wordmark | Orbitron | OFL |

All bundled in `assets/fonts/` with their OFL texts. To swap a face: add the
ttf to `assets/fonts/`, register it in `src/intro/fonts.ts`, reference the
family in the component.

## License

Code, textures, and placeholder images: [MIT](LICENSE). Fonts: SIL Open Font
License (see `assets/fonts/*-OFL.txt`).
```

- [ ] **Step 4: Commit**

```bash
git add README.md LICENSE docs/poster.jpg
git commit -m "docs: README, MIT license, hero poster"
```

---

### Task 7: Publish and verify from a fresh clone

**Files:** none (GitHub operations + temp-dir verification)

**Interfaces:**
- Consumes: the complete repo on local `main`.
- Produces: public template repo at `github.com/millsmillsymills/remotion-eva-template`, CI green.

- [ ] **Step 1: Create the repo and push**

```bash
gh repo create millsmillsymills/remotion-eva-template --public \
  --description "Evangelion-inspired Remotion intro template — swap in your own images, copy, and soundtrack" \
  --source . --push
```

Expected: repo created, `main` pushed. (Initial push to main is the repo bootstrap; subsequent work uses PRs.)

- [ ] **Step 2: Flag as template, add topics**

```bash
gh repo edit millsmillsymills/remotion-eva-template --template \
  --add-topic remotion --add-topic template --add-topic video --add-topic evangelion --add-topic typescript
gh api repos/millsmillsymills/remotion-eva-template --jq '{is_template, topics}'
```

Expected: `is_template: true` with the topics listed. If `--template` isn't a valid flag on the installed gh version, use: `gh api -X PATCH repos/millsmillsymills/remotion-eva-template -F is_template=true`.

- [ ] **Step 3: Confirm CI is green**

```bash
gh run watch --repo millsmillsymills/remotion-eva-template --exit-status
```

Expected: the push-triggered CI run passes. If it fails, fix locally, commit, push, re-watch — do not proceed until green.

- [ ] **Step 4: Fresh-clone dry run**

In the session scratchpad directory (not /tmp):

```bash
cd "$SCRATCHPAD"
git clone --depth 1 https://github.com/millsmillsymills/remotion-eva-template fresh-clone
cd fresh-clone
npm install
npm run check
npx remotion render src/index.ts intro out/smoke.mp4 --frames=0-9
```

Expected: all succeed with no `track.mp3` present (silent render path) and no reliance on anything outside the repo.

- [ ] **Step 5: Verify no personal/licensed content leaked**

```bash
rg -i "mills|unifi|protonmail|unraid|gandi|tr2n|vcr" --hidden -g '!.git' .
```

Run from the fresh clone. Expected: no matches (the GitHub org name in README clone URLs and LICENSE copyright is the only acceptable `millsmillsymills` hit — confirm each match is one of those).
