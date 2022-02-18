import jimp from 'jimp';

export async function resizeAvatarImage(image: Buffer) {
	const avatar = await jimp.create(image);
	avatar.resize(256, jimp.AUTO);
	return avatar.getBufferAsync(jimp.MIME_JPEG);
}
