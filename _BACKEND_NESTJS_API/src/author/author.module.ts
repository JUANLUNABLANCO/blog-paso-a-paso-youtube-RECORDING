import { Module } from '@nestjs/common';
import { AuthorService } from './service/author.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { AuthorController } from './controller/author.controller';

@Module({
  providers: [AuthorService],
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthorController],
  exports: [AuthorService],
})
export class AuthorModule {}
