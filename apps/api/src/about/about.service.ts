import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { About, AboutDocument } from './schemas/about.schema'

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(About.name) private aboutModel: Model<AboutDocument>,
  ) {}

  async getAbout() {
    let about = await this.aboutModel.findOne({ slug: 'main' }).exec()

    if (!about) {
      // Create default about if it doesn't exist
      about = new this.aboutModel({
        slug: 'main',
        content: '<p>No information available.</p>',
      })
      await about.save()
    }

    return {
      id: about._id.toString(),
      content: about.content,
      updatedAt: about.updatedAt,
    }
  }

  async updateAbout(content: string) {
    const about = await this.aboutModel
      .findOneAndUpdate(
        { slug: 'main' },
        { content },
        { upsert: true, new: true },
      )
      .exec()

    return {
      id: about._id.toString(),
      content: about.content,
      updatedAt: about.updatedAt,
    }
  }
}
