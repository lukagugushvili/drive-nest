import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { Car } from './schema/cars.schema';
import { DeletedCarResponse } from './responses/delete-car.response';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserRoles } from 'src/enums/roles-enum';
import { JwtStrategyGuard } from 'src/guards/jwt.guard';
import { UserRolesGuard } from 'src/guards/user-roles.guard';
import { QueryParamsDto } from './dto/query-params.dto';

@UseGuards(JwtStrategyGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @UseGuards(UserRolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async createCar(@Body() createCarDto: CreateCarDto): Promise<Car> {
    return this.carsService.create(createCarDto);
  }

  @Get()
  async findAllCar(@Query() queryParams: QueryParamsDto): Promise<Car[]> {
    return this.carsService.findAll(queryParams);
  }

  @Get(':id')
  async findCarById(@Param('id') id: string): Promise<Car> {
    return this.carsService.findOne(id);
  }

  @UseGuards(UserRolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async removeCar(
    @Param('id') id: string,
    @Body() CreateCarDto: CreateCarDto,
  ): Promise<DeletedCarResponse> {
    return this.carsService.remove(id, CreateCarDto);
  }
}
