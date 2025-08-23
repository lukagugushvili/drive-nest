import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoles } from 'src/enums/roles-enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRoles, default: UserRoles.USER })
  role: string;

  @Prop({ default: null })
  refresh_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
