import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RedisService } from '../../../redis/redis.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(payload: LoginDto & { name: string }): Promise<User> {
    return this.usersService.create(payload);
  }

  async login(payload: LoginDto) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(payload.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refreshToken(token: string) {
    const decoded = await this.jwtService.verifyAsync<{ sub: string; email: string; role: string }>(token, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });

    const key = this.getRefreshTokenKey(decoded.sub);
    const stored = await this.redisService.get(key);
    if (!stored || stored !== token) {
      throw new UnauthorizedException('Refresh token invalidated');
    }

    await this.redisService.del(key);
    return this.issueTokens(decoded.sub, decoded.email, decoded.role);
  }

  async logout(userId: string): Promise<void> {
    await this.redisService.del(this.getRefreshTokenKey(userId));
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      },
    );

    const ttl = 60 * 60 * 24 * 7;
    await this.redisService.set(this.getRefreshTokenKey(userId), refreshToken, ttl);

    return { accessToken, refreshToken };
  }

  private getRefreshTokenKey(userId: string): string {
    return `refresh_token:${userId}`;
  }
}
