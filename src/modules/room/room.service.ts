import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { BranchService } from '../branch/branch.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room)
    private readonly roomModel: typeof Room,
    private readonly branchService: BranchService,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // Validate that the branch exists
    await this.branchService.findOne(createRoomDto.branchId);
    
    return this.roomModel.create({ ...createRoomDto });
  }

  async findAll(branchId: string): Promise<Room[]> {
    return this.roomModel.findAll({
      where: { branchId },
      include: { all: true },
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
    
    if (updateRoomDto.branchId) {
      await this.branchService.findOne(updateRoomDto.branchId);
    }
    
    return room.update(updateRoomDto);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await room.destroy();
  }
}
