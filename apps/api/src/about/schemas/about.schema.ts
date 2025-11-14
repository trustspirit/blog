import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AboutDocument = About & Document

@Schema({ timestamps: true })
export class About {
  @Prop({ required: true, unique: true, default: 'main', index: true })
  slug: string

  @Prop({ required: true, type: String })
  content: string

  updatedAt?: Date
}

export const AboutSchema = SchemaFactory.createForClass(About)
