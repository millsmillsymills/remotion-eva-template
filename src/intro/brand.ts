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
