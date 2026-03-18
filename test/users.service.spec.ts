import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersService } from '../src/modules/users/services/users.service';
import { User } from '../src/modules/users/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((payload) => Promise.resolve(payload)),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('creates a user when email is unique', async () => {
    const result = await service.create({ name: 'John', email: 'john@example.com', password: 'Password1' });
    expect(result.email).toBe('john@example.com');
  });
});
