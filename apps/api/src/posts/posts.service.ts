import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
import { Post, PostDocument } from './schemas/post.schema'

export interface BlogPost {
  id: string
  title: string
  content: string
  summary: string
  imageUrl: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreatePostDto {
  title: string
  content: string
  summary: string
  imageUrl?: string
  published?: boolean
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    includeDrafts: boolean = false,
  ) {
    // Validate pagination parameters
    const pageNum = Math.max(1, page)
    const limitNum = Math.min(100, Math.max(1, limit)) // Cap at 100

    const query = includeDrafts ? {} : { published: true }
    const skip = (pageNum - 1) * limitNum

    // Execute queries in parallel for better performance
    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      this.postModel.countDocuments(query).exec(),
    ])

    return {
      posts: posts.map((post) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: _unusedId, __v: _unusedV, ...rest } = post
        return {
          id: post._id.toString(),
          ...rest,
        }
      }) as BlogPost[],
      page: pageNum,
      limit: limitNum,
      hasMore: total > skip + posts.length,
    }
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid post ID format')
    }

    const post = await this.postModel.findById(id).lean().exec()

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (!post.published) {
      throw new NotFoundException('Post not found')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _unusedId, __v: _unusedV, ...rest } = post
    return {
      id: post._id.toString(),
      ...rest,
    }
  }

  async findOneForAdmin(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid post ID format')
    }

    const post = await this.postModel.findById(id).lean().exec()

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _unusedId, __v: _unusedV, ...rest } = post
    return {
      id: post._id.toString(),
      ...rest,
    }
  }

  async create(postData: CreatePostDto, userId: string) {
    const newPost = new this.postModel({
      title: postData.title,
      content: postData.content,
      summary: postData.summary,
      imageUrl: postData.imageUrl || '',
      published: postData.published ?? false,
      authorId: userId,
    })

    const savedPost = await newPost.save()
    const postObj = savedPost.toObject()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _unusedId, __v: _unusedV, ...rest } = postObj
    return {
      id: savedPost._id.toString(),
      ...rest,
    }
  }

  async update(id: string, postData: UpdatePostDto, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid post ID format')
    }

    const post = await this.postModel.findById(id).exec()

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts')
    }

    // Update only provided fields
    if (postData.title !== undefined) post.title = postData.title
    if (postData.content !== undefined) post.content = postData.content
    if (postData.summary !== undefined) post.summary = postData.summary
    if (postData.imageUrl !== undefined) post.imageUrl = postData.imageUrl
    if (postData.published !== undefined) post.published = postData.published

    const updatedPost = await post.save()
    const postObj = updatedPost.toObject()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _unusedId, __v: _unusedV, ...rest } = postObj
    return {
      id: updatedPost._id.toString(),
      ...rest,
    }
  }

  async delete(id: string, userId: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid post ID format')
    }

    const post = await this.postModel.findById(id).exec()

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts')
    }

    await this.postModel.findByIdAndDelete(id).exec()
    return { message: 'Post deleted successfully' }
  }
}
