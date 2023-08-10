import { IsString } from 'class-validator'

export class UpdateBannerPathDto {
	@IsString({ message: 'Баннер должен быть строкой' })
	bannerPath: string
}
