import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@ApiTags('Branches')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiQuery({ name: 'owner_id', required: false })
  findAll(@Query('owner_id') ownerId?: string) {
    return this.branchService.findAll(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by id' })
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a branch' })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a branch' })
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}
