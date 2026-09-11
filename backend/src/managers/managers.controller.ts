import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto, UpdateManagerDto } from './dto/manager.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Managers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@Controller('managers')
export class ManagersController {
  constructor(private readonly service: ManagersService) {}

  @Get()
  @ApiOperation({ summary: 'List managers (superadmin)' })
  list() {
    return this.service.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create manager (superadmin)' })
  create(@Body() dto: CreateManagerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update manager role/password (superadmin)' })
  update(@Param('id') id: string, @Body() dto: UpdateManagerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete manager (superadmin)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user?.id);
  }
}
