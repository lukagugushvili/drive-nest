import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRoles } from 'src/enums/roles-enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  email: string;

  @Length(8, 22)
  password: string;

  @IsEnum(UserRoles)
  @IsOptional()
  role: string;
}
