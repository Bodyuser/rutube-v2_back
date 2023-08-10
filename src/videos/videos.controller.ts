import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	Req,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { VideosService } from './videos.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateVideoDto } from './dto/create-video.dto'
import { User } from 'src/users/decorators/user.decorator'
import { UpdateVideoDto } from './dto/update-video.dto'
import { Request } from 'express'

@Controller('videos')
export class VideosController {
	constructor(private readonly videosService: VideosService) {}

	@Post('')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	async createVideo(
		@Body() createVideoDto: CreateVideoDto,
		@User('id') id: string
	) {
		return await this.videosService.createVideo(createVideoDto, id)
	}

	@Put(':id')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	async updateVideo(
		@Body() updateVideoDto: UpdateVideoDto,
		@Param('id') id: string,
		@User('id') userId: string
	) {
		return await this.videosService.updateVideo(updateVideoDto, id, userId)
	}

	@Delete(':id')
	@Auth()
	async deleteVideo(@Param('id') id: string, @User('id') userId: string) {
		return await this.videosService.deleteVideo(id, userId)
	}

	@Patch('toggle-like/:id')
	@HttpCode(200)
	@Auth()
	async toggleLikeVideo(@Param('id') id: string, @User('id') userId: string) {
		return await this.videosService.toggleLikeVideo(id, userId)
	}

	@Patch('toggle-dislike/:id')
	@HttpCode(200)
	@Auth()
	async toggleDisLikeVideo(
		@Param('id') id: string,
		@User('id') userId: string
	) {
		return await this.videosService.toggleDisLikeVideo(id, userId)
	}

	@Patch('view-video/:id')
	@HttpCode(200)
	async viewVideo(@Param('id') id: string) {
		return await this.videosService.viewVideo(id)
	}

	@Get('existing-slug/:slug')
	@Auth()
	async checkExistingSlug(@Param('slug') slug: string) {
		return await this.videosService.checkExistingSlug(slug)
	}

	@Get('top')
	async getTopVideos() {
		return await this.videosService.getTopVideos()
	}

	@Get('full-top')
	async getFullTopVideos() {
		return await this.videosService.getFullTopVideos()
	}

	@Get('newest')
	async getNewestVideos() {
		return await this.videosService.getNewestVideos()
	}

	@Get('category/:slug')
	async getVideosByCategorySlug(@Param('slug') slug: string) {
		return await this.videosService.getVideosByCategorySlug(slug)
	}

	@Get('recommendation')
	@Auth()
	async getRecommendationVideos(@User('id') id: string) {
		return await this.videosService.getRecommendationVideos(id)
	}

	@Get('category-videos')
	async getCategoryAndVideos() {
		return await this.videosService.getCategoryAndVideos()
	}

	@Get('profile')
	@Auth()
	async getVideosByProfile(@User('id') id: string) {
		return await this.videosService.getVideosByProfile(id)
	}

	@Get('similar/:id')
	async getSimilarVideos(@Param('id') id: string) {
		return await this.videosService.getSimilarVideos(id)
	}

	@Get('user/:id')
	async getVideosByUserId(@Param('id') id: string) {
		return await this.videosService.getVideosByUserId(id)
	}

	@Get('profile/likes')
	async getLikeVideos(@User('id') id: string) {
		return await this.videosService.getLikeVideos(id)
	}

	@Get(':slug')
	async getVideoBySlug(@Param('slug') slug: string, @Req() req: Request) {
		return await this.videosService.getVideoBySlug(
			slug,
			req.headers.authorization,
			req.cookies.refreshToken
		)
	}
}
