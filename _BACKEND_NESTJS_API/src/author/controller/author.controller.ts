import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AuthorService } from '../service/author.service';
import { AuthorReadDto } from '../model/authorDto';

@Controller('authors')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Get()
  async findAllAuthors(): Promise<AuthorReadDto[]> {
    console.log('####### findAllAuthors');
    return this.authorService.findAllAuthors();
  }
  @Get(':id')
  async getAuthorById(@Param('id') id: string): Promise<AuthorReadDto> {
    const author = this.authorService.findOneById(parseInt(id, 10));
    if (!author) {
      throw new NotFoundException(`Author with id ${id} not found`);
    }
    return author;
  }
}
