import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RentalService } from './rental.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';

@ApiTags('Rentals')
@Controller('rentals')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rental' })
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalService.create(createRentalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rentals by branch' })
  @ApiQuery({ name: 'branch_id', required: true })
  findAll(@Query('branch_id') branchId: string) {
    if (!branchId) {
      throw new BadRequestException('branch_id is required');
    }
    return this.rentalService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rental by id' })
  findOne(@Param('id') id: string) {
    return this.rentalService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a rental' })
  update(@Param('id') id: string, @Body() updateRentalDto: UpdateRentalDto) {
    return this.rentalService.update(id, updateRentalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rental' })
  remove(@Param('id') id: string) {
    return this.rentalService.remove(id);
  }
}
