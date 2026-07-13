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
