import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { ArticleTranslation } from './article-translation.entity';
import { ArticleImage } from './article-image.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { CategoriesModule } from '../categories/categories.module';
import { LocationsModule } from '../locations/locations.module';
import { MediaModule } from '../media/media.module';
import { WebhookModule } from '../webhook/webhook.module';
import { SocialModule } from '../social/social.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleTranslation, ArticleImage]),
    CategoriesModule,
    LocationsModule,
    MediaModule,
    WebhookModule,
    SocialModule,
    AuthModule,
  ],
  providers: [ArticlesService],
  controllers: [ArticlesController],
  exports: [ArticlesService],
})
export class ArticlesModule {}
