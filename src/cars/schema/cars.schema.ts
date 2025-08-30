import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Car extends Document {
  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  carModel: string;

  @Prop({ required: true })
  year: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  imageUrl: string[];
}

export const CarsSchema = SchemaFactory.createForClass(Car);
