import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserRole } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAllAuthors(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { role: UserRole.EDITOR },
      select: ['id', 'userName', 'role', 'profileImage'],
    });
  }
  async findOneById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id, role: UserRole.EDITOR },
      select: ['id', 'userName', 'role', 'profileImage'],
    });
  }
}
