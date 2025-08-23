import { IsEmail, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @Length(8, 22)
  password: string;
}
