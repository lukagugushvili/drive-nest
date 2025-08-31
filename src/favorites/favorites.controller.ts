import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Favorite } from './schema/favorite.schema';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ICurrentUser } from 'src/interface/current-user';
import { JwtStrategyGuard } from 'src/guards/jwt.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtStrategyGuard)
  @Post(':carId')
  async addFav(
    @Param('carId') carId: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<Favorite> {
    return this.favoritesService.addFav(carId, user.sub);
  }

  @UseGuards(JwtStrategyGuard)
  @Get()
  async getFavCars(@CurrentUser() user: ICurrentUser): Promise<Favorite[]> {
    return this.favoritesService.getFavCars(user.sub);
  }

  @UseGuards(JwtStrategyGuard)
  @Delete(':id')
  async removeCarFromFav(
    @Param('id') favId: string,
  ): Promise<{ message: string }> {
    return this.favoritesService.removeCarFromFav(favId);
  }
}
