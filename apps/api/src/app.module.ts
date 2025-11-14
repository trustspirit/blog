import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { AboutModule } from './about/about.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    FirebaseModule,
    AuthModule,
    PostsModule,
    AboutModule,
  ],
})
export class AppModule {}
