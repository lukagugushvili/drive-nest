import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Favorite } from './schema/favorite.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CarsService } from 'src/cars/cars.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoritesModel: Model<Favorite>,
    private readonly carsService: CarsService,
  ) {}

  async addFav(carId: string, userId: string): Promise<Favorite> {
    try {
      await this.carsService.findOne(carId);

      const existing = await this.favoritesModel.findOne({
        carId: new Types.ObjectId(carId),
        userId: new Types.ObjectId(userId),
      });

      if (!existing) {
        throw new BadRequestException('Car is already in favorite');
      }

      const favorite = await this.favoritesModel.create({
        carId: new Types.ObjectId(carId),
        userId: new Types.ObjectId(userId),
      });

      if (!favorite) throw new BadRequestException('Could not create favorite');

      return existing;
    } catch (error) {
      console.error(`Error add in favorites: ${error.message}`);
      throw new BadRequestException(
        `Could not add in favorites: ${error.message}`,
      );
    }
  }

  async getFavCars(userId: string): Promise<Favorite[]> {
    try {
      const favCars = await this.favoritesModel
        .find({
          userId: new Types.ObjectId(userId),
        })
        .populate('carId')
        .exec();

      if (favCars.length === 0) {
        throw new NotFoundException('Could not found favorites!');
      }

      return favCars;
    } catch (error) {
      console.error(`Error get favorites: ${error.message}`);
      throw new BadRequestException(
        `Could not found favorites: ${error.message}`,
      );
    }
  }

  async removeCarFromFav(favId: string): Promise<{ message: string }> {
    try {
      const fav = await this.favoritesModel.findByIdAndDelete(favId);

      if (!fav) {
        throw new NotFoundException(
          `Could not found favorite car with this ID: ${favId}`,
        );
      }

      return { message: 'Successfully deleted' };
    } catch (error) {
      console.error(`Error delete favorite car: ${error.message}`);
      throw new BadRequestException(
        `Could not remove favorite car: ${error.message}`,
      );
    }
  }
}
