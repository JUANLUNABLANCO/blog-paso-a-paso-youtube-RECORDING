import { Test, TestingModule } from '@nestjs/testing';
import { BlogEntriesController } from './blog-entries.controller';

describe('BlogController', () => {
  let controller: BlogEntriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogEntriesController],
    }).compile();

    controller = module.get<BlogEntriesController>(BlogEntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
