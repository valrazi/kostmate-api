import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Owner } from '../owner/entities/owner.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectModel(Branch)
    private readonly branchModel: typeof Branch,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    if (createBranchDto.ownerId) {
      const owner = await Owner.findByPk(createBranchDto.ownerId);
      if (owner) {
        // Calculate existing branches for branch quota validation
        const branchCount = await this.branchModel.count({ where: { ownerId: owner.id } });
        if (branchCount >= owner.branchQuota) {
          throw new BadRequestException(`Kuota cabang sudah penuh (maksimal ${owner.branchQuota} cabang).`);
        }

        // Calculate used room quota across all existing branches
        const existingBranches = await this.branchModel.findAll({ where: { ownerId: owner.id } });
        const usedRoomQuota = existingBranches.reduce((sum, b) => sum + (b.roomQuota || 0), 0);
        const newQuota = createBranchDto.roomQuota || 0;

        if (usedRoomQuota + newQuota > owner.roomQuota) {
          throw new BadRequestException(`Kuota kamar tidak mencukupi (tersisa ${owner.roomQuota - usedRoomQuota} ruang kamar).`);
        }
      }
    }
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
    
    if (updateBranchDto.roomQuota !== undefined) {
      const owner = await Owner.findByPk(branch.ownerId);
      if (owner) {
        const existingBranches = await this.branchModel.findAll({ where: { ownerId: owner.id } });
        // Sum quota from all branches EXCEPT the one being updated
        const otherBranchesRoomQuota = existingBranches.reduce((sum, b) => b.id === id ? sum : sum + (b.roomQuota || 0), 0);
        const newQuota = updateBranchDto.roomQuota;

        if (otherBranchesRoomQuota + newQuota > owner.roomQuota) {
          throw new BadRequestException(`Kuota kamar tidak mencukupi (tersisa ${owner.roomQuota - otherBranchesRoomQuota} ruang kamar).`);
        }
      }
    }

    return branch.update(updateBranchDto);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await branch.destroy();
  }
}
