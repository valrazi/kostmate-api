import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectModel(Branch)
    private readonly branchModel: typeof Branch,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    return this.branchModel.create({ ...createBranchDto });
  }

  async findAll(ownerId?: string): Promise<Branch[]> {
    const where = ownerId ? { ownerId } : {};
    return this.branchModel.findAll({ where, include: { all: true } });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchModel.findByPk(id, { include: { all: true } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    return branch.update(updateBranchDto);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await branch.destroy();
  }
}
