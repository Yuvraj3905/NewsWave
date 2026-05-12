import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly service: SubscribersService) {}

  @Post()
  @ApiOperation({ summary: 'Public subscribe endpoint' })
  subscribe(@Body() dto: CreateSubscriberDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List subscribers (manager)' })
  list() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('count')
  @ApiOperation({ summary: 'Active subscriber count (manager)' })
  count() {
    return this.service.count().then((count) => ({ count }));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke subscription (manager)' })
  revoke(@Param('id') id: string) {
    return this.service.revoke(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove subscriber (manager)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
