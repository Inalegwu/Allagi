export const convertHexToRGB = (hex: string) => {
	const first = hex.substring(1, 3);
	const second = hex.substring(3, 5);
	const third = hex.substring(5, 7);

	const r = Number.parseInt(first, 16);
	const g = Number.parseInt(second, 16);
	const b = Number.parseInt(third, 16);

	return {
		r,
		g,
		b,
	};
};

export const determineColorSpace = ({
	r,
	g,
	b,
}: { r: number; b: number; g: number }) => {
	return r > g && r > b
		? "red"
		: g > r && g > b
			? "green"
			: b > r && b > g
				? "blue"
				: ("gray" as const);
};
