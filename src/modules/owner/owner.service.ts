import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Owner } from './entities/owner.entity';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(
    @InjectModel(Owner)
    private readonly ownerModel: typeof Owner,
  ) {}

  async findOne(id: string): Promise<Owner> {
    const owner = await this.ownerModel.findByPk(id);
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }
    return owner;
  }

  async update(id: string, updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    const owner = await this.findOne(id);
    return owner.update(updateOwnerDto);
  }
}
