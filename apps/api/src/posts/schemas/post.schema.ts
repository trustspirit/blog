import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PostDocument = Post & Document

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string

  @Prop({ required: true, type: String })
  content: string

  @Prop({ required: true })
  summary: string

  @Prop({ default: '' })
  imageUrl: string

  @Prop({ default: false })
  published: boolean

  @Prop({ required: true })
  authorId: string

  createdAt?: Date
  updatedAt?: Date
}

export const PostSchema = SchemaFactory.createForClass(Post)

// Create indexes
PostSchema.index({ createdAt: -1 })
PostSchema.index({ published: 1, createdAt: -1 })
