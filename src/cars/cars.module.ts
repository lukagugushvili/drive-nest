import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarsSchema } from './schema/cars.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Car.name, schema: CarsSchema }]),
  ],
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}
