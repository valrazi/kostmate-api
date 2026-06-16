import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { BranchService } from '../branch/branch.service';
import { Rental } from '../rental/entities/rental.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room)
    private readonly roomModel: typeof Room,
    private readonly branchService: BranchService,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // Validate that the branch exists
    const branch = await this.branchService.findOne(createRoomDto.branchId);
    
    // Check if branch room quota is reached
    const roomCount = await this.roomModel.count({
      where: { branchId: createRoomDto.branchId },
    });

    if (roomCount >= (branch.roomQuota || 0)) {
      throw new BadRequestException(
        `Gagal menambah kamar: Cabang ${branch.name} sudah mencapai batas kuota maksimal (${branch.roomQuota} kamar).`
      );
    }

    // Check if room gender matches branch gender preference
    if (branch.genderPreference !== 'mixed' && createRoomDto.gender !== branch.genderPreference) {
      const branchGenderName = branch.genderPreference === 'male' ? 'Laki-laki' : 'Perempuan';
      throw new BadRequestException(
        `Gagal: Cabang ini dikhususkan untuk ${branchGenderName}, sehingga gender kamar harus sesuai.`
      );
    }

    // Check for duplicate room number in the same branch
    const existingRoom = await this.roomModel.findOne({
      where: {
        branchId: createRoomDto.branchId,
        roomNumber: createRoomDto.roomNumber,
      },
    });

    if (existingRoom) {
      throw new BadRequestException(
        `Kamar dengan nomor ${createRoomDto.roomNumber} sudah terdaftar di cabang ini.`
      );
    }
    
    return this.roomModel.create({ ...createRoomDto });
  }

  async findAll(branchId: string): Promise<Room[]> {
    return this.roomModel.findAll({
      where: { branchId },
      include: [
        {
          model: Rental,
          where: { status: 'active' }, // Only get active rentals
          required: false, // LEFT OUTER JOIN
          include: [
            {
              model: Customer,
            }
          ]
        }
      ],
      order: [
        [Sequelize.literal('CAST(room_number AS SIGNED)'), 'ASC'],
        ['roomNumber', 'ASC']
      ]
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomModel.findByPk(id, { include: { all: true } });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    
    if (room.status === 'filled') {
      throw new BadRequestException('Kamar sedang ditempati, tidak dapat diubah.');
    }

    if (updateRoomDto.gender || updateRoomDto.branchId) {
      const targetBranchId = updateRoomDto.branchId || room.branchId;
      const targetGender = updateRoomDto.gender || room.gender;
      
      const targetBranch = await this.branchService.findOne(targetBranchId);
      if (targetBranch.genderPreference !== 'mixed' && targetGender !== targetBranch.genderPreference) {
        const branchGenderName = targetBranch.genderPreference === 'male' ? 'Laki-laki' : 'Perempuan';
        throw new BadRequestException(
          `Gagal: Cabang ini dikhususkan untuk ${branchGenderName}, sehingga gender kamar harus sesuai.`
        );
      }
    }

    if (updateRoomDto.roomNumber || updateRoomDto.branchId) {
      const targetBranchId = updateRoomDto.branchId || room.branchId;
      const targetRoomNumber = updateRoomDto.roomNumber || room.roomNumber;

      const duplicateRoom = await this.roomModel.findOne({
        where: {
          id: { [Op.ne]: id },
          branchId: targetBranchId,
          roomNumber: targetRoomNumber,
        },
      });

      if (duplicateRoom) {
        throw new BadRequestException(
          `Kamar dengan nomor ${targetRoomNumber} sudah terdaftar di cabang ini.`
        );
      }
    }

    if (updateRoomDto.branchId && updateRoomDto.branchId !== room.branchId) {
      const targetBranch = await this.branchService.findOne(updateRoomDto.branchId);
      
      const targetRoomCount = await this.roomModel.count({
        where: { branchId: updateRoomDto.branchId },
      });

      if (targetRoomCount >= (targetBranch.roomQuota || 0)) {
        throw new BadRequestException(
          `Gagal memindahkan kamar: Cabang tujuan (${targetBranch.name}) sudah mencapai batas kuota maksimal (${targetBranch.roomQuota} kamar).`
        );
      }
    } else if (updateRoomDto.branchId) {
      await this.branchService.findOne(updateRoomDto.branchId);
    }
    
    return room.update(updateRoomDto);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    
    if (room.status === 'filled') {
      throw new BadRequestException('Kamar sedang ditempati, tidak dapat dihapus.');
    }

    await room.destroy();
  }
}
