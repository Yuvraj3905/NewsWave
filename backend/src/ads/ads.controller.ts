import {
  BadRequestException,
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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { AD_SLOTS, AdSlot } from './ad.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly service: AdsService) {}

  @Get()
  @ApiQuery({ name: 'slot', enum: AD_SLOTS })
  @ApiOperation({ summary: 'Active ads for a slot (public)' })
  active(@Query('slot') slot?: string) {
    if (!slot || !AD_SLOTS.includes(slot as AdSlot)) {
      throw new BadRequestException('Valid ?slot is required');
    }
    return this.service.findActive(slot as AdSlot);
  }

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all ads (manager)' })
  adminList() {
    return this.service.adminList();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get ad by id (manager)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create ad (manager)' })
  create(@Body() dto: CreateAdDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update ad (manager)' })
  update(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete ad (manager)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
