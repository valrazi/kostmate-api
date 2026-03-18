import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async create(payload: CreateUserDto): Promise<User> {
    const exists = await this.userModel.findOne({ where: { email: payload.email } });
    if (exists) throw new ConflictException('Email already exists');
    return this.userModel.create({ ...payload });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({ include: { all: true } });
  }
}
