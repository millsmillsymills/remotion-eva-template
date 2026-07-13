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
