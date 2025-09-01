import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { RegisterUserRes } from './responses/register-user';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserRes } from './responses/login-user';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IGenerateTokens } from 'src/interface/generate-tokens';
import { IPayload } from 'src/interface/payload';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from 'src/users/schema/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Create user and register him
  async register(registerUserDto: CreateUserDto): Promise<RegisterUserRes> {
    try {
      await this.usersService.create(registerUserDto);

      return { message: 'Successful registration' };
    } catch (error) {
      console.error(`Error register user: ${error.message}`);
      throw new BadRequestException('Unable to register');
    }
  }

  // Create login user logic and give him access_token and refresh_token
  async login(
    loginUserDto: LoginUserDto,
    res: Response,
  ): Promise<LoginUserRes> {
    const { email, password } = loginUserDto;
    try {
      const user = await this.usersService.findUserByEmail(email);
      if (!user) throw new UnauthorizedException('Invalid credentials!');

      const equalPasswords = await bcrypt.compare(password, user.password);
      if (!equalPasswords)
        throw new UnauthorizedException('Invalid credentials!');

      const payload = { sub: user.id, email, role: user.role };

      const tokens = await this.generateTokens(payload);
      const { access_token, refresh_token } = tokens;

      await this.saveCookies(res, tokens);

      return { message: 'Successful login', access_token, refresh_token };
    } catch (error) {
      console.error(`Error log in: ${error.message}`);
      throw new BadRequestException(`Could not log in: ${error.message}`);
    }
  }

  // Create refresh logic to update access_token
  async refresh(
    email: string,
    refresh_token: string,
  ): Promise<IGenerateTokens> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user || !user.refresh_token)
      throw new UnauthorizedException('user not found');

    const isValid = await bcrypt.compare(refresh_token, user.refresh_token);
    if (!isValid) throw new UnauthorizedException();

    const payload = { sub: user.id, email, role: user.role };
    return this.generateTokens(payload);
  }

  // Create exit logic and clear cookies
  async logout(userId: string, res: Response): Promise<void> {
    await this.usersService.updateUser(userId, null);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  // Find validate user for local strategy
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findUserByEmail(email);
    const equalPasswords = await bcrypt.compare(pass, user.password);

    if (user && equalPasswords) {
      const { password, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  // Create tokens and move them in login function, also hash refresh_token and stored it in mongoDB
  private async generateTokens(payload: IPayload): Promise<IGenerateTokens> {
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });

    const saltRounds =
      Number(this.configService.get<string>('SALT_ROUNDS')) || 10;
    const hashedRefreshToken = await bcrypt.hash(refresh_token, saltRounds);

    await this.usersService.updateUser(payload.sub, hashedRefreshToken);

    return { access_token, refresh_token };
  }

  // Save tokens in cookies
  private async saveCookies(
    res: Response,
    tokens: IGenerateTokens,
  ): Promise<void> {
    const { access_token, refresh_token } = tokens;

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
  }
}
