import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtStrategyGuard } from 'src/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ICurrentUser } from 'src/interface/current-user';
import { Comment } from './schema/comment.schema';

@Controller('cars/:carId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtStrategyGuard)
  @Post()
  async createComment(
    @Body() commentDto: CreateCommentDto,
    @Param('carId') carId: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<Comment> {
    return this.commentsService.create(commentDto, carId, user.sub);
  }

  @UseGuards(JwtStrategyGuard)
  @Get()
  async getAllComment(@Param('carId') carId: string): Promise<Comment[]> {
    return this.commentsService.getAll(carId);
  }

  @UseGuards(JwtStrategyGuard)
  @Delete(':commentId')
  async removeComment(
    @Param('commentId') commentId: string,
  ): Promise<{ message: string }> {
    return this.commentsService.delete(commentId);
  }
}
