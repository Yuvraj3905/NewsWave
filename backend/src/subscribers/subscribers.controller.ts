import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriberStatus } from './subscriber.entity';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly service: SubscribersService) {}

  @Post()
  @ApiOperation({
    summary:
      'Public subscribe endpoint (creates subscriber in pending status, awaiting admin approval)',
  })
  subscribe(@Body() dto: CreateSubscriberDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'approved', 'rejected'],
  })
  @ApiOperation({ summary: 'List subscribers, optional ?status filter (manager)' })
  list(@Query('status') status?: SubscriberStatus) {
    return this.service.findAll(status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('count')
  @ApiOperation({
    summary: 'Subscriber counts by status (manager). count = approved.',
  })
  count() {
    return this.service.counts();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve subscriber (manager)' })
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject subscriber (manager)' })
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/revoke')
  @ApiOperation({
    summary: 'Revoke subscription (legacy; maps to reject) (manager)',
  })
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
