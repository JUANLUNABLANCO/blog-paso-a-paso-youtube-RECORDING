import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BlogService } from '../service/blog.service';
import { BlogEntry } from '../model/blog-entry.interface';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/model/user.interface';

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  // TODO USERISAUTHORGUARD
  @Post()
  create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user = req.user;
    return this.blogService.create(user, blogEntry);
  }

  @Get()
  findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]> {
    if (userId === null) {
      return this.blogService.findAll();
    } else {
      return this.blogService.findByUser(userId);
    }
  }
  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(Number(id));
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  updateOne(
    @Param('id') id: number,
    @Body() blogEntry: BlogEntry,
  ): Observable<BlogEntry> {
    return this.blogService.updateOne(Number(id), blogEntry);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.blogService.deleteOne(Number(id));
  }
}
