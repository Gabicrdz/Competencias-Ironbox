import { Test, TestingModule } from '@nestjs/testing';
import { WodsService } from './wods.service';

describe('WodsService', () => {
  let service: WodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WodsService],
    }).compile();

    service = module.get<WodsService>(WodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
