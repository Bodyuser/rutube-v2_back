import * as Ffmpeg from 'fluent-ffmpeg'
import { Transcoder } from 'simple-hls'

// export const createVideo = async (inputPath, outputPath, filename, folder) => {
// 	return new Promise(async (resolve, reject) => {
// 		return Ffmpeg()
// 			.input(inputPath)
// 			.videoCodec('libx264')
// 			.size('1280x720')
// 			.output(`${outputPath}/${filename}-720.mp4`)
// 			.input(inputPath)
// 			.size('1920x1080')
// 			.videoCodec('libx264')
// 			.output(`${outputPath}/${filename}-1080.mp4`)
// 			.input(inputPath)
// 			.videoCodec('libx264')
// 			.size('426x240')
// 			.output(`${outputPath}/${filename}-240.mp4`)
// 			.on('end', resolve)
// 			.on('error', reject)
// 			.run()
// 	})
// }

export const createVideo = async (
	path: string,
	outputPath: string,
	duration: string,
	height: string,
	width: string,
	server: any,
	id: string
) => {
	const renditions: any[] = [
		{
			width: 640,
			height: 360,
			profile: 'main',
			hlsTime: duration,
			bv: '800k',
			maxrate: '856k',
			bufsize: '1200k',
			ba: '96k',
			ts_title: '360p',
			master_title: '360p',
		},
		{
			width: 842,
			height: 480,
			profile: 'main',
			hlsTime: duration,
			bv: '1400k',
			maxrate: '1498',
			bufsize: '2100k',
			ba: '128k',
			ts_title: '480p',
			master_title: '480p',
		},
		{
			width: 1280,
			height: 720,
			profile: 'main',
			hlsTime: duration,
			bv: '2800k',
			maxrate: '2996k',
			bufsize: '4200k',
			ba: '128k',
			ts_title: '720p',
			master_title: '720p',
		},
		{
			width: 1920,
			height: 1080,
			profile: 'main',
			hlsTime: duration,
			bv: '5000k',
			maxrate: '5350k',
			bufsize: '7500k',
			ba: '192k',
			ts_title: '1080p',
			master_title: '1080p',
		},
	]

	const filteredRenditions = renditions.filter(r => r.height <= height)

	let arr: any[] = []
	let arrTime: any[] = []

	const setValue = (data: any) => {
		if (data.includes('time')) {
			arrTime.push(
				data
					.split(' ')
					.find(i => i.includes('time'))
					.split('=')[1]
			)
		}
		arr.push(data)

		if (arrTime.length) {
			arrTime.forEach((i: string) => {
				if (typeof i === 'string') {
					const a = i.split(':')

					const seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2]

					const percent = Number(((seconds / +duration) * 100).toFixed(1))

					server.to(id).emit('upload', {
						percent,
					})
				}
			})
		}
	}

	const t = new Transcoder(path, outputPath, setValue, {
		showLogs: false,
		renditions: filteredRenditions,
	})
	try {
		Ffmpeg()
			.input(path)
			.size(`${width}x${height}`)
			.fps(40)
			.setStartTime(0)
			.setDuration(8)
			.output(`${outputPath}/preview.gif`)
			.run()
		const hlsPath = await t.transcode()
	} catch (e) {}
}
