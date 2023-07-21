import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { UserEntity } from 'src/users/entities/user.entity'

@Module({
	controllers: [SearchController],
	providers: [SearchService],
	imports: [TypeOrmModule.forFeature([VideoEntity, UserEntity])],
})
export class SearchModule {}
