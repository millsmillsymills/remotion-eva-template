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
