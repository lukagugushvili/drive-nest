import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Car } from './schema/cars.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCarDto } from './dto/create-car.dto';
import { DeletedCarResponse } from './responses/delete-car.response';
import { QueryParamsDto } from './dto/query-params.dto';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private readonly carsModel: Model<Car>) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    try {
      const newCar = await this.carsModel.create(createCarDto);
      return newCar;
    } catch (error) {
      console.error(`Error create car: ${error.message}`);
      throw new BadRequestException(`Could not create user: ${error.message}`);
    }
  }

  async findAll(queryParams: QueryParamsDto): Promise<Car[]> {
    const { take, page, brand, year, price } = queryParams;

    const filter = {
      ...(brand && { brand }),
      ...(year && { year }),
      ...(price && { price }),
    };

    const limit = Number(take) || 10;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * limit;

    const cars = await this.carsModel
      .find(filter)
      .limit(limit)
      .skip(skip)
      .exec();

    if (!cars || cars.length === 0) {
      throw new NotFoundException('Could not found cars!');
    }

    return cars;
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carsModel.findById(id);

    if (!car) throw new NotFoundException('Could not found car!');

    return car;
  }

  async remove(
    id: string,
    createCarDto: CreateCarDto,
  ): Promise<DeletedCarResponse> {
    try {
      const deleteCar = await this.carsModel.findByIdAndDelete(
        id,
        createCarDto,
      );

      if (!deleteCar) throw new NotFoundException('Error find car!');

      return { message: 'Successfully deleted', car: deleteCar };
    } catch (error) {
      console.error(`Error remove car: ${error.message}`);
      throw new BadRequestException(`Could not remove car: ${error.message}`);
    }
  }
}
