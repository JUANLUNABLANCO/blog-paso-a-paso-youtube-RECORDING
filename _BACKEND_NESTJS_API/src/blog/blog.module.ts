import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntryEntity } from './model/blog-entry.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogEntriesController } from './controller/blog-entries.controller';
import { BlogEntriesService } from './service/blog-entries.service';
import { UserIsAuthorGuard } from './guards/user-is-author.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntryEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [BlogEntriesController],
  providers: [BlogEntriesService, UserIsAuthorGuard],
})
export class BlogModule {}
