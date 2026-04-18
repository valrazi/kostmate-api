import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Rental } from './entities/rental.entity';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { BranchService } from '../branch/branch.service';

@Injectable()
export class RentalService {
  constructor(
    @InjectModel(Rental)
    private readonly rentalModel: typeof Rental,
    private readonly branchService: BranchService,
  ) {}

  async create(createRentalDto: CreateRentalDto): Promise<Rental> {
    await this.branchService.findOne(createRentalDto.branchId);
    return this.rentalModel.create({ ...createRentalDto });
  }

  async findAll(branchId: string): Promise<Rental[]> {
    return this.rentalModel.findAll({
      where: { branchId },
      include: { all: true },
    });
  }

  async findOne(id: string): Promise<Rental> {
    const rental = await this.rentalModel.findByPk(id, { include: { all: true } });
    if (!rental) {
      throw new NotFoundException(`Rental with ID ${id} not found`);
    }
    return rental;
  }

  async update(id: string, updateRentalDto: UpdateRentalDto): Promise<Rental> {
    const rental = await this.findOne(id);
    
    if (updateRentalDto.branchId) {
      await this.branchService.findOne(updateRentalDto.branchId);
    }
    
    return rental.update(updateRentalDto);
  }

  async remove(id: string): Promise<void> {
    const rental = await this.findOne(id);
    await rental.destroy();
  }
}
