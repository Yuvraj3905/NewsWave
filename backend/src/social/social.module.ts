import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { XService } from './x.service';
import { FacebookService } from './facebook.service';
import { InstagramService } from './instagram.service';

@Module({
  providers: [SocialService, XService, FacebookService, InstagramService],
  exports: [SocialService],
})
export class SocialModule {}
