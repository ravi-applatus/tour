import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '../../config/configuration.service';
import { ErrorService } from '../../error/error.service';
import { UserEntity, UserStatus } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthLoginDto } from './dto/auth-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private error: ErrorService,
    private config: ConfigurationService,
    private jwtService: JwtService,
  ) {}

  async login(dto: AuthLoginDto) {
    const user = await this.userService.getByEmailOrMobile(dto.emailOrMobile);

    if (!user) {
      this.error.unprocessableEntity(['نام کاربری یا کلمه عبور اشتباه است']);
    }

    if (user.status === UserStatus.inactive) {
      this.error.methodNotAllowed([
        'حساب شما توسط واحد مربوطه در حال بررسی می باشد',
      ]);
    }

    if (user.status === UserStatus.banned) {
      this.error.methodNotAllowed([
        'حساب شما مسدود شده است، با تیم پشتیبانی تماس حاصل فرمایید',
      ]);
    }

    if (!(await user.isCorrectSaltPassword(dto.password))) {
      this.error.unprocessableEntity(['نام کاربری یا کلمه عبور اشتباه است']);
    }

    return await this.prepareUserResponse(user, dto.rememberMe);
  }

  /**
   * Preparing the user info and an access token for responding to login requests
   * Generating the JWT access token, if the user is verified
   */
  async prepareUserResponse(user: UserEntity, rememberMe = false) {
    const accessToken = await this._generateAccessToken(user, rememberMe);

    return {
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        roleId: user.roleId,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        wallet: user.wallet,
      },
      accessToken,
    };
  }

  /**
   * Generating the JWT access token based on the user's ID and email
   */
  private async _generateAccessToken(user: UserEntity, rememberMe = false) {
    return await this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
      },
      {
        expiresIn: rememberMe
          ? this.config.auth.expiresLifetime
          : this.config.auth.expires,
      },
    );
  }

  /**
   * -------------------------------------------------------
   * GET /auth/1
   * GET user info
   */
  async getById(userId: number) {
    return await this.userService.getById(userId);
  }
}
