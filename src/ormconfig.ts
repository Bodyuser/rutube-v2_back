import { DataSource, DataSourceOptions } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

export const dataSourceOptions: DataSourceOptions = {
	port: +process.env.DB_PORT,
	type: 'postgres',
	url: process.env.DB_URL,
	logging: false,
	synchronize: true,
	entities: ['dist/**/*.entity.{js, ts}'],
	migrations: ['dist/migrations/*.{js, ts}'],
}

const dataSource = new DataSource(dataSourceOptions)

export default dataSource
