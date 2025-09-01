import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schema/comment.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentsModel: Model<Comment>,
  ) {}

  async create(
    comment: CreateCommentDto,
    carId: string,
    userId: string,
  ): Promise<Comment> {
    const { content } = comment;
    try {
      const comments = new this.commentsModel({
        content: content,
        author: new Types.ObjectId(userId),
        carId: new Types.ObjectId(carId),
      });

      if (!comments) throw new BadRequestException(``);

      return comments.save();
    } catch (error) {
      console.error(`Error adding comment: ${error.message}`);
      throw new BadRequestException(
        `Could not added comment: ${error.message}`,
      );
    }
  }

  async getAll(carId: string): Promise<Comment[]> {
    try {
      const comments = await this.commentsModel
        .find({ carId: new Types.ObjectId(carId) })
        .populate('carId')
        .exec();

      if (comments.length === 0) {
        throw new NotFoundException('Could not found comments!');
      }

      return comments;
    } catch (error) {
      console.error(`Error get comments: ${error.message}`);
      throw new BadRequestException(`Could not get comments: ${error.message}`);
    }
  }

  async delete(commentId: string): Promise<{ message: string }> {
    try {
      const removeComment =
        await this.commentsModel.findByIdAndDelete(commentId);

      if (!removeComment) throw new NotFoundException('Comment not found!');

      return { message: 'Successfully deleted' };
    } catch (error) {
      console.error(`Error delete comment: ${error.message}`);
      throw new BadRequestException(
        `Could not deleted comment: ${error.message}`,
      );
    }
  }
}
