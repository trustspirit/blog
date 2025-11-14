import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { AboutModule } from './about/about.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MongoDBModule } from './mongodb/mongodb.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    MongoDBModule,
    FirebaseModule,
    AuthModule,
    PostsModule,
    AboutModule,
    UploadsModule,
  ],
})
export class AppModule {}
