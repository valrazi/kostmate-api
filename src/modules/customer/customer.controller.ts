import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers by branch' })
  @ApiQuery({ name: 'branch_id', required: true })
  findAll(@Query('branch_id') branchId: string) {
    if (!branchId) {
      throw new BadRequestException('branch_id is required');
    }
    return this.customerService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
