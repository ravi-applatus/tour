import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { User } from '../../utils/decorators/user.decorator';
import { successfulResult } from '../../utils';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { UserService } from '../user/user.service';
import { AuthForgotByEmailDto } from './dto/auth-forgot-by-email';
import { AuthResetPasswordByTokenDto } from './dto/auth-reset-password-by-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  /**
   * -------------------------------------------------------
   * LOGIN
   */
  @Post('login')
  @ApiOperation({
    description: '<p dir="rtl">ورود به پنل کاربری</p>',
  })
  async login(@Body() dto: AuthLoginDto) {
    const response = await this.authService.login(dto);
    return successfulResult(['با موفقیت لاگین شدید'], response);
  }

  /**
   * -------------------------------------------------------
   * GET /auth/me
   * GET user info
   */
  @Get('me')
  @ApiOperation({
    description: '<p dir="rtl">مشاهده اطلاعات فرد لاگین شده، توسط خودش</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@User('id') userId: number) {
    const userInfo = await this.authService.getById(userId);
    return successfulResult(['اطلاعات یوزر'], userInfo);
  }

  /**
   * -------------------------------------------------------
   * PUT /auth/me
   * PUT user info
   */
  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(@User('id') userId: number, @Body() dto: AuthUpdateDto) {
    delete dto.id;
    await this.userService.updateUser(userId, dto);
    return successfulResult(['پروفایل شما با موفقیت آپدیت شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /auth/me/password
   * change password
   */
  @Put('me/password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @User('id') userId: number,
    @Body() dto: AuthChangePasswordDto,
  ) {
    await this.userService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
    return successfulResult(['کلمه عبور با موفقیت آپدیت شد']);
  }

  /**
   * -------------------------------------------------------
   * POST /auth/password/forgot-by-email
   */
  @Post('password/forgot-by-email')
  async forgotPassword(@Body() dto: AuthForgotByEmailDto) {
    await this.userService.forgotPasswordByEmail(dto.email);
    return successfulResult([
      'لطفا ایمیل خود را برای فراموشی کلمه عبور چک کنید',
    ]);
  }

  /**
   * -------------------------------------------------------
   * POST /auth/password/reset-by-token
   */
  @Post('password/reset-by-token')
  async resetPassword(@Body() dto: AuthResetPasswordByTokenDto) {
    const user = await this.userService.resetPasswordByToken(
      dto.token,
      dto.newPassword,
    );
    const response = await this.authService.prepareUserResponse(user, false);
    return successfulResult(['کلمه عبور شما با موفقیت تغییر یافت'], response);
  }
}
