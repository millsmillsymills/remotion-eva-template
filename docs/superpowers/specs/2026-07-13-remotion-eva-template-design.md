# remotion-eva-template — Design

**Date:** 2026-07-13
**Repo:** `millsmillsymills/remotion-eva-template` (public, GitHub template repository)
**Source material:** the Evangelion-style intro built in `millsymills.com/video/` (Remotion 4
workspace, ~400 lines, beat-driven storyboard).

## Goal

A reusable Remotion template of the eva-style intro: hard-cut title cards, duotone photo
cutouts over a grid floor, strobe cuts, CRT grammar (stepped motion, flicker, scanlines,
grain), typewriter boot, and a logo lockup. Users clone it via GitHub's "Use this template",
replace placeholder images and copy with their own, and render.

Distribution is the GitHub template flag plus `git clone`/`degit`. `npx create-video` only
accepts official Remotion template flags, so the README must not claim support for it.

## Repo layout

```
remotion-eva-template/
├── package.json          # studio / render / poster / check scripts; exact version pins
├── remotion.config.ts    # publicDir → assets/, jpeg image format, overwrite output
├── tsconfig.json         # strict flags per Remotion template conventions
├── README.md             # hero poster still, quickstart, customization guide, licensing
├── LICENSE               # MIT (code, textures, generated placeholder images)
├── .gitignore            # node_modules/, out/, assets/track.mp3
├── .github/workflows/ci.yml
├── assets/
│   ├── cutouts/          # 6 generated duotone silhouette PNGs, one per accent color
│   ├── stills/           # 1 full-frame placeholder still
│   ├── fonts/            # PressStart2P.ttf, VT323.ttf, Orbitron.ttf + OFL.txt per font
│   ├── textures/         # scanlines.svg, grain.svg, grid-floor.svg, rays.svg (ported)
│   └── logos/            # placeholder-logo.svg
├── scripts/duotone.mjs   # sharp-based image treatment + placeholder generation
└── src/
    ├── index.ts          # registerRoot
    ├── Root.tsx          # <Composition id="intro"> 1920×1080 @ 30fps
    └── intro/
        ├── brand.ts      # NEW: wordmark, tagline, bootText, logo path, track config
        ├── sequence.ts   # STILLS map + Beat[] storyboard (the main editing surface)
        ├── palette.ts    # void/cyan/magenta/phosphor/amber/purple/red/fg + Accent type
        ├── timing.ts     # FPS = 30
        ├── crt.ts        # steps(), flicker() — ported verbatim
        ├── fonts.ts      # FontFace loader with delayRender; VT323/PressStart2P/Orbitron
        ├── Intro.tsx     # beat dispatcher + optional audio layer
        ├── Boot.tsx      # typewriter terminal beat
        ├── TitleCard.tsx # hard-slam card with RGB split
        ├── StillCut.tsx  # StillCut + Strobe
        ├── Lockup.tsx    # logo + wordmark + rays finale
        └── Overlays.tsx  # Scanlines, Grain, GridFloor
```

## Changes from the original

### brand.ts (new)

Everything personal moves out of components into one typed config:

```ts
export const BRAND = {
  wordmark: 'ACME',            // Lockup display text (Orbitron)
  tagline: '> example.com',    // Lockup terminal line
  bootText: '> example.com',   // Boot beat typewriter text
  logo: 'logos/placeholder-logo.svg',
  track: null as { file: string; offsetSec: number } | null,
} as const;
```

- `Boot` and `Lockup` read from `BRAND` instead of hardcoding "mills".
- `track: null` (default) renders silent: `Intro.tsx` renders the `Html5Audio` layer only
  when `track` is non-null. To add audio: drop `assets/track.mp3`, set
  `track: { file: 'track.mp3', offsetSec: 0 }`. `trimBefore` is computed from `offsetSec`.
  The end-of-video volume fade ports as-is.

### sequence.ts

- Same `Beat` union (boot / card / still / strobe / lockup) and same 17-beat, 900-frame,
  30-second rhythm so the default render demos the full grammar.
- `STILLS` ids renamed to accent-based generic names (`cutCyan`, `cutMagenta`, `cutRed`,
  `cutAmber`, `cutPurple`, `cutPhosphor`, `fullFrame`), pointing at placeholder files.
- Copy genericized to placeholder text that teaches the format, e.g.
  `eyebrow: 'TRANSMISSION 01', text: 'YOUR HEADLINE HERE'`,
  `eyebrow: 'UNIT-01 · YOUR PROJECT', text: 'WHAT IT DOES · IN CAPS'`.
- `totalFrames()` ports verbatim (duration stays derived, safe to edit beats).

### Fonts

All-OFL swap; ship the ttf files with each font's `OFL.txt`:

| Role | Original | Template |
|------|----------|----------|
| Terminal / boot / tagline | VCR OSD Mono (freeware, unclear license) | VT323 (OFL) |
| Cards / eyebrows | Press Start 2P (OFL) | Press Start 2P (unchanged) |
| Lockup wordmark | Tr2n (personal-use only, was gitignored) | Orbitron (OFL) |

`fonts.ts` keeps the local `FontFace` + `delayRender` loader — offline-deterministic renders
and a natural drop-in path for users' own faces (add ttf, edit one array entry).

### Placeholder images

- Six cutout placeholders: authored abstract silhouette SVGs rasterized to alpha PNGs and
  duotone-treated in each accent color; plus one full-frame placeholder still. Committed, so
  the default render looks like a finished demo, not a wireframe.
- `scripts/duotone.mjs` (sharp, devDependency) does the treatment: raw RGBA pass mapping
  luminance to a shadow→highlight color ramp, preserving alpha. sharp's built-in `tint()` is
  single-tone and insufficient. The same script both generates the committed placeholders and
  serves as the user's tool for treating their own photos. CLI:
  `node scripts/duotone.mjs <input.png> <accent|#shadow,#highlight> <output.png>` for
  treatment, `node scripts/duotone.mjs --placeholders` to regenerate the committed set.
- README states plainly: the script treats images; it does not remove backgrounds. Cutout
  creation (alpha matte) is on the user (Preview, rembg, remove.bg).

### Scripts and CI

- `render` outputs to `out/intro.mp4` (not the site path); `poster` to `out/poster.jpg`;
  `studio` and `check` (tsc --noEmit) as in the original.
- `.github/workflows/ci.yml`: typecheck + render smoke test
  (`remotion render src/index.ts intro out/smoke.mp4 --frames=0-9`) on ubuntu-latest.
  Remotion self-downloads headless Chrome. Actions pinned to full SHAs with version
  comments, `persist-credentials: false`.

## Licensing

- **Code, textures, placeholder images:** MIT (`LICENSE`).
- **Fonts:** OFL, license text committed alongside each ttf.
- **Audio:** none shipped. `assets/track.mp3` is gitignored by default so template users
  don't accidentally commit copyrighted audio; README notes how to remove the ignore rule
  when the track is theirs to distribute.
- **Naming:** "Evangelion-inspired" in prose only; no NGE assets, imagery, or fonts.

## README contents

1. Hero poster still (rendered locally, committed) — optionally a short GIF later.
2. Quickstart: Use this template → `npm i` → `npm run studio`.
3. Replace the images: file locations, dimensions, cutout-vs-full-frame distinction,
   duotone script usage, background-removal caveat.
4. Edit the storyboard: `sequence.ts` beat reference (all five beat kinds), `brand.ts`.
5. Add a soundtrack: drop-in, `offsetSec` tuning, gitignore note.
6. Fonts: what ships, licenses, how to swap in your own face.
7. License section.

## Testing / verification

- `npm run check` (tsc) clean.
- Full local render of the placeholder cut — visually verified in studio, poster committed.
- CI green on the initial push (typecheck + 10-frame render smoke).
- Fresh-clone dry run: clone to a temp dir, `npm i`, `npm run render` succeeds silent
  (no track.mp3 present).

## Out of scope

- Zod schema / input-props parameterization (the beat array is the editing surface).
- Submission to remotion.dev community templates list (possible follow-up).
- Background removal tooling.
- Shipping any audio.
