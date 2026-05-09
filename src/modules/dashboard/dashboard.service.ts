import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Room } from '@/modules/room/entities/room.entity';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { Op } from 'sequelize';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Branch) private branchModel: typeof Branch,
    @InjectModel(Room) private roomModel: typeof Room,
    @InjectModel(Customer) private customerModel: typeof Customer,
    @InjectModel(Rental) private rentalModel: typeof Rental,
    @InjectModel(Payment) private paymentModel: typeof Payment,
  ) {}

  async getStats(ownerId?: string) {
    const branchWhere: any = {};
    if (ownerId) {
      branchWhere.ownerId = ownerId;
    }

    const branches = await this.branchModel.findAll({
      where: branchWhere,
      attributes: ['id', 'name', 'roomQuota'],
    });
    
    const branchIds = branches.map(b => b.id);

    if (ownerId && branchIds.length === 0) {
      return {
        totalBranches: 0,
        totalCustomers: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        totalRevenue: 0,
        branchOccupancy: [],
        paymentTrend: []
      };
    }

    const totalBranches = branches.length;

    const totalCustomers = await this.customerModel.count({
      where: branchIds.length > 0 ? { branchId: { [Op.in]: branchIds } } : {},
    });

    const totalRooms = branches.reduce((acc, curr) => acc + (curr.roomQuota || 0), 0);
    
    const occupiedRooms = await this.rentalModel.count({
      where: {
        status: 'active',
        ...(branchIds.length > 0 ? { branchId: { [Op.in]: branchIds } } : {})
      }
    });

    const totalRevenueSum = await this.paymentModel.sum('amount', {
      where: {
        status: 'paid',
        ...(branchIds.length > 0 ? { branchId: { [Op.in]: branchIds } } : {})
      }
    });
    
    const totalRevenue = totalRevenueSum || 0;

    const branchOccupancy = [];
    for (const branch of branches) {
      const terisi = await this.rentalModel.count({
        where: { branchId: branch.id, status: 'active' }
      });
      const roomQuota = branch.roomQuota || 0;
      branchOccupancy.push({
        name: branch.name,
        Terisi: terisi,
        Kosong: Math.max(0, roomQuota - terisi)
      });
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const paymentTrend = [];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const endDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

      const revenueMonth = await this.paymentModel.sum('amount', {
        where: {
          status: 'paid',
          paymentDate: {
            [Op.between]: [startDateStr, endDateStr]
          },
          ...(branchIds.length > 0 ? { branchId: { [Op.in]: branchIds } } : {})
        }
      });

      paymentTrend.push({
        name: months[d.getMonth()],
        Pendapatan: revenueMonth || 0,
      });
    }

    return {
      totalBranches,
      totalCustomers,
      totalRooms,
      occupiedRooms,
      totalRevenue,
      branchOccupancy,
      paymentTrend,
    };
  }
}
