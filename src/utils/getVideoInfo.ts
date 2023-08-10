import * as ffmpeg from 'fluent-ffmpeg'

export const getVideoInfo = (inputPath: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		return ffmpeg.ffprobe(inputPath, (error, videoInfo) => {
			if (error) {
				return reject(error)
			}

			const { duration } = videoInfo.format
			const { height, width } = videoInfo.streams[0]

			return resolve({
				height,
				duration,
				width,
			})
		})
	})
}
