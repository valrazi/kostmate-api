import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BranchService } from '../branch/branch.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer)
    private readonly customerModel: typeof Customer,
    private readonly branchService: BranchService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    await this.branchService.findOne(createCustomerDto.branchId);
    return this.customerModel.create({ ...createCustomerDto });
  }

  async findAll(branchId: string): Promise<Customer[]> {
    return this.customerModel.findAll({
      where: { branchId },
      include: { all: true },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel.findByPk(id, { include: { all: true } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    if (updateCustomerDto.branchId) {
      await this.branchService.findOne(updateCustomerDto.branchId);
    }
    
    return customer.update(updateCustomerDto);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await customer.destroy();
  }
}
