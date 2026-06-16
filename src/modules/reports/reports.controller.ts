import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reports for a specific branch and month' })
  @ApiQuery({ name: 'branch_id', required: true })
  @ApiQuery({ name: 'month', required: false, description: 'YYYY-MM format' })
  getReports(
    @Query('branch_id') branchId: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.getReports(branchId, month);
  }
}
