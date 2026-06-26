import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance)
    private readonly maintenanceModel: typeof Maintenance,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const branch = await Branch.findByPk(createMaintenanceDto.branchId);
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${createMaintenanceDto.branchId} not found`);
    }
    return this.maintenanceModel.create({ ...createMaintenanceDto });
  }

  async findAll(branchId?: string): Promise<Maintenance[]> {
    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }
    return this.maintenanceModel.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceModel.findByPk(id);
    if (!maintenance) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }
    return maintenance;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenance = await this.findOne(id);
    if (updateMaintenanceDto.branchId) {
      const branch = await Branch.findByPk(updateMaintenanceDto.branchId);
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${updateMaintenanceDto.branchId} not found`);
      }
    }
    return maintenance.update(updateMaintenanceDto);
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);
    await maintenance.destroy();
  }
}
