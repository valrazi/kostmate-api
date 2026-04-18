import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms by branch' })
  @ApiQuery({ name: 'branch_id', required: true })
  findAll(@Query('branch_id') branchId: string) {
    if (!branchId) {
      throw new BadRequestException('branch_id is required');
    }
    return this.roomService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by id' })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}
