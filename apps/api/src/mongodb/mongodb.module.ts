import { Module, Global } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://admin:password@localhost:27017/blog?authSource=admin',
    ),
  ],
  exports: [MongooseModule],
})
export class MongoDBModule {}
