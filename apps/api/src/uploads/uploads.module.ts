import { Module } from '@nestjs/common'
import { UploadsController } from './uploads.controller'
import { FirebaseModule } from '../firebase/firebase.module'

@Module({
  imports: [FirebaseModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
