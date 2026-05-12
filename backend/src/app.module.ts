import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { AuthModule } from './auth/auth.module';
import { ManagersModule } from './managers/managers.module';
import { MediaModule } from './media/media.module';
import { WebhookModule } from './webhook/webhook.module';
import { SocialModule } from './social/social.module';
import { HealthController } from './health.controller';
import { Article } from './articles/article.entity';
import { Category } from './categories/category.entity';
import { Location } from './locations/location.entity';
import { Subscriber } from './subscribers/subscriber.entity';
import { Manager } from './managers/manager.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
      entities: [Article, Category, Location, Subscriber, Manager],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    AuthModule,
    ManagersModule,
    ArticlesModule,
    CategoriesModule,
    LocationsModule,
    SubscribersModule,
    MediaModule,
    WebhookModule,
    SocialModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
