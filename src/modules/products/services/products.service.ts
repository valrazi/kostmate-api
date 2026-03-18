import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RedisService } from '../../../redis/redis.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly cacheKey = 'products:all';

  constructor(
    @InjectModel(Product) private readonly productModel: typeof Product,
    private readonly redisService: RedisService,
  ) {}

  async create(payload: CreateProductDto): Promise<Product> {
    const created = await this.productModel.create({ ...payload });
    await this.redisService.del(this.cacheKey);
    return created;
  }

  async findAll(): Promise<Product[]> {
    const cached = await this.redisService.get(this.cacheKey);
    if (cached) return JSON.parse(cached) as Product[];

    const products = await this.productModel.findAll({ include: { all: true } });
    await this.redisService.set(this.cacheKey, JSON.stringify(products), 60);
    return products;
  }
}
