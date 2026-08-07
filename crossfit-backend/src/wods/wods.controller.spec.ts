import { Test, TestingModule } from '@nestjs/testing';
import { WodsController } from './wods.controller';
import { WodsService } from './wods.service';

describe('WodsController', () => {
  let controller: WodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WodsController],
      providers: [WodsService],
    }).compile();

    controller = module.get<WodsController>(WodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
