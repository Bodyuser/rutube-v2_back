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
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { VideosService } from './videos.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateVideoDto } from './dto/create-video.dto'
import { User } from 'src/users/decorators/user.decorator'
import { UpdateVideoDto } from './dto/update-video.dto'

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
	@Auth()
	async toggleLikeVideo(@Param('id') id: string, @User('id') userId: string) {
		return await this.videosService.toggleLikeVideo(id, userId)
	}

	@Patch('toggle-dislike/:id')
	@Auth()
	async toggleDisLikeVideo(
		@Param('id') id: string,
		@User('id') userId: string
	) {
		return await this.videosService.toggleDisLikeVideo(id, userId)
	}

	@Patch('view-video/:id')
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

	@Get('newest')
	async getNewestVideos() {
		return await this.videosService.getNewestVideos()
	}

	@Get('category/:id')
	async getVideosByCategory(@Param('id') id: string) {
		return await this.videosService.getVideosByCategory(id)
	}

	@Get('recommendation')
	@Auth()
	async getRecommendationVideos(@User('id') id: string) {
		return await this.videosService.getRecommendationVideos(id)
	}

	@Get('category-videos')
	async getCategoryAndVideo() {
		return await this.videosService.getCategoryAndVideo()
	}

	@Get('profile')
	@Auth()
	async getVideosByProfile(@User('id') id: string) {
		return await this.videosService.getVideosByProfile(id)
	}

	@Get('user/:id')
	async getVideosByUser(@Param('id') id: string) {
		return await this.videosService.getVideosByUser(id)
	}

	@Get(':id')
	async getVideoBySlug(@Param('id') id: string) {
		return await this.videosService.getVideoBySlug(id)
	}
}
