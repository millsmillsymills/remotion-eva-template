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
		const luma =
			(0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]) /
			255;
		rgba[i] = Math.round(shadow[0] + (highlight[0] - shadow[0]) * luma);
		rgba[i + 1] = Math.round(
			shadow[1] + (highlight[1] - shadow[1]) * luma
		);
		rgba[i + 2] = Math.round(
			shadow[2] + (highlight[2] - shadow[2]) * luma
		);
	}
	return rgba;
}

async function treat(input, shadow, highlight, output) {
	const { data, info } = await sharp(input)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	duotone(data, shadow, highlight);
	await sharp(data, {
		raw: { width: info.width, height: info.height, channels: 4 },
	})
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
		<polygon points="-40,${90 - i * 8} 40,${70 + i * 8} 10,210 -10,210"
			fill="#ffffff"/>
		<polygon points="-260,470 260,470 ${180 - i * 20},1350 ${-180 + i * 20},1350"
			fill="url(#g)"/>
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
		const png = await sharp(Buffer.from(cutoutSvg(i)))
			.png()
			.toBuffer();
		await treat(
			png,
			shadow,
			parseHex(ACCENTS[accent]),
			`assets/cutouts/placeholder-${accent}.png`
		);
	}
	const still = await sharp(Buffer.from(FULLFRAME_SVG))
		.png()
		.toBuffer();
	await treat(
		still,
		shadow,
		parseHex(ACCENTS.cyan),
		'assets/stills/placeholder-fullframe.png'
	);
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
				'       node scripts/duotone.mjs --placeholders'
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
