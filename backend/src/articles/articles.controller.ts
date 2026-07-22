import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  UpsertTranslationDto,
} from './dto/translation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ArticleLanguage } from './article-translation.entity';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List articles (public, supports ?lang=en|hi|pa)' })
  list(@Query() query: ListArticlesDto) {
    query.includeUnpublished = false;
    return this.service.list(query);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Latest 10 article headings (public)' })
  @ApiQuery({ name: 'lang', enum: SUPPORTED_LANGUAGES, required: false })
  latest(@Query('lang') lang?: SupportedLanguage) {
    return this.service.latest(10, (lang as ArticleLanguage) || 'en');
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Article stats (manager)' })
  stats() {
    return this.service.stats();
  }

  @Get('analytics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Analytics breakdown (manager)' })
  analytics() {
    return this.service.analytics();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get article by slug (public, increments views)' })
  @ApiQuery({ name: 'lang', enum: SUPPORTED_LANGUAGES, required: false })
  bySlug(
    @Param('slug') slug: string,
    @Query('lang') lang?: SupportedLanguage,
  ) {
    return this.service.findBySlug(slug, (lang as ArticleLanguage) || 'en');
  }

  @Get('slug/:slug/related')
  @ApiOperation({ summary: 'Related articles (public)' })
  @ApiQuery({ name: 'lang', enum: SUPPORTED_LANGUAGES, required: false })
  related(
    @Param('slug') slug: string,
    @Query('lang') lang?: SupportedLanguage,
  ) {
    return this.service.related(slug, 5, (lang as ArticleLanguage) || 'en');
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get article by id (manager)' })
  byId(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateArticleDto })
  @ApiOperation({ summary: 'Create article (manager)' })
  create(
    @Body() dto: CreateArticleDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.service.create(dto, image);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Update article (manager)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, image);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiOperation({ summary: 'Delete article (admin/superadmin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiOperation({
    summary:
      'Bulk update display_order for manual section ordering (admin/superadmin)',
  })
  reorder(@Body() body: { items: { id: string; display_order: number | null }[] }) {
    return this.service.reorder(body?.items || []);
  }

  // Translations
  @Get(':id/translations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List translations for article (manager)' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add or update a translation (manager)' })
  upsertTranslation(
    @Param('id') id: string,
    @Body() dto: UpsertTranslationDto,
  ) {
    return this.service.upsertTranslation(id, dto);
  }

  @Delete(':id/translations/:lang')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete translation (manager)' })
  deleteTranslation(
    @Param('id') id: string,
    @Param('lang') lang: SupportedLanguage,
  ) {
    return this.service.deleteTranslation(id, lang as ArticleLanguage);
  }

  // Images
  @Get(':id/images')
  @ApiOperation({ summary: 'List images for article (public)' })
  listImages(@Param('id') id: string) {
    return this.service.listImages(id);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload up to 10 additional images (manager)' })
  addImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.addImages(id, files || []);
  }

  @Post(':id/images/url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add image by URL (manager)' })
  addImageByUrl(
    @Param('id') id: string,
    @Body() body: { url: string; alt?: string },
  ) {
    return this.service.addImageUrl(id, body.url, body.alt);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete image (manager)' })
  deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.deleteImage(id, imageId);
  }
}
