import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { path } from 'app-root-path'

@Module({
	controllers: [FilesController],
	providers: [FilesService],
	imports: [
		ServeStaticModule.forRoot({
			rootPath: `${path}/uploads`,
			serveRoot: '/uploads',
		}),
	],
})
export class FilesModule {}
