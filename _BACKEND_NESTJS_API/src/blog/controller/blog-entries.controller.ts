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
  UseInterceptors,
  UploadedFile,
  Response,
} from '@nestjs/common';
import { BlogEntriesService } from '../service/blog-entries.service';
import { IBlogEntry } from '../model/blog-entry.interface';
import { Observable, of } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { IUserBase, UserRole } from 'src/user/model/user.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserIsUserGuard } from 'src/auth/guards/userIsUser.guard';
import * as path from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { IImage } from '../model/image.interface';
import {
  BlogEntryCreateDto,
  BlogEntryReadWithAuthorDto,
  BlogEntryReadWithoutAuthorDto,
  BlogEntryUpdateDto,
} from '../model/blog-entry.dto';
import { UserReadWithEntriesDto } from 'src/user/model/user.dto';

export const storage = {
  storage: diskStorage({
    destination: './uploads/blogEntriesImages',
    filename: (req, file, cb) => {
      const filename: string =
        file.originalname.replace(/\s/g, '').split('.')[0] + uuidv4();
      const extension: string = path.extname(file.originalname);
      cb(null, `${filename}${extension}`);
    },
  }),
};
@Controller('blog-entries')
export class BlogEntriesController {
  configService: any;
  constructor(private blogService: BlogEntriesService) {}

  @UseGuards(JwtAuthGuard)
  // TODO USERISAUTHORGUARD, AND USER IS EDITORGUARD, the slug will be `unique`
  @Post()
  create(
    @Body() blogEntry: BlogEntryCreateDto,
    @Request() req,
  ): Observable<BlogEntryReadWithoutAuthorDto> {
    console.log('#### Create: ', blogEntry);
    const user = req.user;
    console.log('#### USER: ', user);
    return this.blogService.create(user, blogEntry);
  }

  @Get()
  index(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Observable<Pagination<BlogEntryReadWithAuthorDto>> {
    limit = limit > 100 ? 100 : limit;
    const route = `${process.env.API_URL}:${process.env.API_PORT}/api/blog-entries`;
    return this.blogService.paginateAll({
      limit: Number(limit),
      page: Number(page),
      route: route,
    });
  }
  @Get('user/:authorId')
  indexByAuthor(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Param('authorId') authorId: number,
  ): Observable<Pagination<BlogEntryReadWithoutAuthorDto>> {
    limit = limit > 100 ? 100 : limit;
    const route = `${process.env.API_URL}:${process.env.API_PORT}/api/blog-entries/user/${authorId}`;
    return this.blogService.paginateByUser(
      {
        limit: Number(limit),
        page: Number(page),
        route: route,
      },
      Number(authorId),
    );
  }
  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntryReadWithAuthorDto> {
    return this.blogService.findOne(Number(id)); // si no existen entradas no enviamos nada
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  updateOne(
    @Param('id') id: number,
    @Body() blogEntry: BlogEntryUpdateDto,
  ): Observable<BlogEntryReadWithAuthorDto> {
    return this.blogService.updateOne(Number(id), blogEntry);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  deleteOne(@Param('id') id: number): Observable<string> {
    return this.blogService.deleteOne(Number(id));
  }
  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<any> {
    return of({
      headerImage: file.filename,
      message: 'file uploaded successfully',
    });
  }

  @Get('header-image/:imageName')
  findHeaderImage(
    @Param('imageName') imageName,
    @Response() resp,
  ): Observable<unknown> {
    // console.log(
    //   '#### ruta file',
    //   path.join(process.cwd(), 'uploads/blogEntriesImages/', imageName),
    // );
    return of(
      resp.sendFile(
        path.join(process.cwd(), 'uploads/blogEntriesImages', imageName),
      ),
    );
  }
}
