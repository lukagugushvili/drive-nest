import { Car } from '../schema/cars.schema';

export class DeletedCarResponse {
  message: string;
  car: Car;
}
