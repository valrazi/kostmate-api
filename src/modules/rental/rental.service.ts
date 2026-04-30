import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Rental } from './entities/rental.entity';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { BranchService } from '../branch/branch.service';
import { Room } from '../room/entities/room.entity';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class RentalService {
  constructor(
    @InjectModel(Rental)
    private readonly rentalModel: typeof Rental,
    private readonly branchService: BranchService,
  ) {}

  async create(createRentalDto: CreateRentalDto): Promise<Rental> {
    await this.branchService.findOne(createRentalDto.branchId);
    
    // Fetch target Room and Customer for validation
    const room = await Room.findByPk(createRentalDto.roomId);
    const customer = await Customer.findByPk(createRentalDto.customerId);

    if (!room || !customer) {
      throw new BadRequestException('Room atau Customer tidak ditemukan.');
    }

    if (room.gender !== 'mixed' && room.gender !== customer.gender) {
      const roomGenderName = room.gender === 'male' ? 'Laki-laki' : 'Perempuan';
      const customerGenderName = customer.gender === 'male' ? 'Laki-laki' : 'Perempuan';
      throw new BadRequestException(`Gagal: Kamar ini khusus untuk ${roomGenderName}, sedangkan Customer adalah ${customerGenderName}.`);
    }
    
    const rental = await this.rentalModel.create({ ...createRentalDto });

    // Mark the physical room as filled when assignment is born
    await Room.update(
      { status: 'filled' },
      { where: { id: createRentalDto.roomId } }
    );

    return rental;
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
    
    // Kembalikan status kamar menjadi kosong (available) saat dihapus
    await Room.update(
      { status: 'available' },
      { where: { id: rental.roomId } }
    );
    
    await rental.destroy();
  }
}
