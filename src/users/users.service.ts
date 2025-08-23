import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    try {
      const existedUser = await this.userModel.findOne({ email });
      if (existedUser) throw new BadRequestException('User already exist');

      const saltRounds =
        Number(this.configService.get<string>('SALT_ROUNDS')) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return newUser;
    } catch (error) {
      console.error(`Error create user: ${error.message}`);
      throw new BadRequestException(`Could not create user: ${error.message}`);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user)
      throw new NotFoundException(`User with Email: ${email} not found`);

    return user;
  }

  async updateUser(
    userId: string,
    refresh_token: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refresh_token });
  }
}
