import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { SetActiveStatusDto } from './dto/set-status.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { WorkshopsService } from './workshops.service.js';

@ApiTags('Workshops')
@ApiBearerAuth()
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshopsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Solo ADMIN: incluye talleres inactivos' })
  findAll(@CurrentUser('role') role: Role, @Query('includeInactive') includeInactive?: string) {
    return this.workshopsService.findAll(role === Role.ADMIN && includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workshopsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkshopDto) {
    return this.workshopsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: SetActiveStatusDto) {
    return this.workshopsService.setStatus(id, dto.status);
  }

  /** Eliminación lógica (inactivación). */
  @Delete(':id')
  @Roles(Role.ADMIN)
  inactivate(@Param('id', ParseIntPipe) id: number) {
    return this.workshopsService.inactivate(id);
  }
}
