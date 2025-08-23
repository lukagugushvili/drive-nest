import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserRes } from './responses/login-user';
import { RegisterUserRes } from './responses/register-user';
import { Response } from 'express';
import { LocalStrategyGuard } from 'src/guards/local.guard';
import { JwtStrategyGuard } from 'src/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ICurrentUser, ICurrentUserRes } from 'src/interface/current-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerUserDto: CreateUserDto,
  ): Promise<RegisterUserRes> {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(LocalStrategyGuard)
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserRes> {
    return this.authService.login(loginUserDto, res);
  }

  @Post('refresh')
  async refresh(
    @Body('refresh_token') refresh_token: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.authService.refresh(user.email, refresh_token);
  }

  @UseGuards(JwtStrategyGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(user.sub, res);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtStrategyGuard)
  @Get('profile')
  async me(@CurrentUser() user: ICurrentUser): Promise<ICurrentUserRes> {
    return {
      ID: user.sub,
      Email: user.email,
      Role: user.role,
    };
  }
}
