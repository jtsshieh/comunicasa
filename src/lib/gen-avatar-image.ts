import jimp from 'jimp';
export async function genAvatarImage(name: string) {
	let initials = name.split(' ');
	if (initials.length > 3) initials = initials.slice(2);
	initials = initials.map((i) => i[0].toUpperCase());

	const avatar = await jimp.create(256, 256, '#ffffff');

	const font = await jimp.loadFont(jimp.FONT_SANS_128_BLACK);

	avatar.print(
		font,
		0,
		0,
		{
			text: initials.join(''),
			alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
			alignmentY: jimp.VERTICAL_ALIGN_MIDDLE,
		},
		256,
		256
	);

	return avatar.getBufferAsync(jimp.MIME_JPEG);
}
