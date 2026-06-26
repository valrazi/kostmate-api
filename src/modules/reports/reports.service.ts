import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { Room } from '@/modules/room/entities/room.entity';
import { Maintenance } from '@/modules/maintenance/entities/maintenance.entity';
import dayjs from 'dayjs';
import { Sequelize } from 'sequelize';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(Rental) private readonly rentalModel: typeof Rental,
    @InjectModel(Payment) private readonly paymentModel: typeof Payment,
    @InjectModel(Room) private readonly roomModel: typeof Room,
    @InjectModel(Maintenance) private readonly maintenanceModel: typeof Maintenance,
  ) {}

  async getReports(branchId: string, monthStr?: string) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }

    // Parse the target date. Default to current month if not provided
    const targetDate = monthStr ? dayjs(`${monthStr}-01`) : dayjs();
    
    // We want a 6-month window ending on the targetDate month
    const monthsList = [];
    for (let i = 5; i >= 0; i--) {
      monthsList.push(targetDate.subtract(i, 'month'));
    }

    // 1. Fetch all customers for this branch (with rentals to check active status)
    const customers = await this.customerModel.findAll({
      where: { branchId },
      include: [
        {
          model: Rental,
          required: false,
        }
      ],
      paranoid: true,
    });

    const formattedCustomersList = customers.map((c, index) => {
      const activeRental = c.rentals && c.rentals.find(r => r.status === 'active' && !r.deletedAt);
      return {
        key: c.id,
        no: index + 1,
        nama: c.name,
        jk: c.gender === 'male' ? 'Laki-laki' : c.gender === 'female' ? 'Perempuan' : '-',
        wa: c.whatsappNumber || '-',
        darurat: c.emergencyPhoneNumber || '-',
        status: activeRental ? 'Aktif' : 'Nonaktif',
      };
    });

    const totalCustomers = formattedCustomersList.length;
    const totalAktif = formattedCustomersList.filter(c => c.status === 'Aktif').length;
    const totalNonaktif = formattedCustomersList.filter(c => c.status === 'Nonaktif').length;

    // Build customer chart data (active vs inactive customers historical counts at the end of each of the 6 months)
    const customerChart = [];
    for (const m of monthsList) {
      const startOfMonth = m.startOf('month').toDate();
      const endOfMonth = m.endOf('month').toDate();

      let activeCount = 0;
      let inactiveCount = 0;

      for (const c of customers) {
        const hasActiveInMonth = c.rentals && c.rentals.some(r => {
          const rentStart = dayjs(r.startDate);
          const rentEnd = r.deletedAt ? dayjs(r.deletedAt) : null;
          
          const startedBeforeOrDuring = rentStart.isBefore(endOfMonth) || rentStart.isSame(endOfMonth, 'day');
          const endedAfterOrDuring = !rentEnd || rentEnd.isAfter(startOfMonth) || rentEnd.isSame(startOfMonth, 'day');
          
          return startedBeforeOrDuring && endedAfterOrDuring;
        });

        if (hasActiveInMonth) {
          activeCount++;
        } else {
          inactiveCount++;
        }
      }

      customerChart.push({
        name: m.format('MMM'),
        active: activeCount,
        inactive: inactiveCount,
      });
    }

    // 2. Fetch all rentals (including deleted ones) to construct Check-In/Check-Out list (InOut log)
    const allRentals = await this.rentalModel.findAll({
      where: { branchId },
      include: [Customer],
      paranoid: false,
    });

    const inoutList = [];
    for (const r of allRentals) {
      if (r.customer) {
        // Check-in (In)
        inoutList.push({
          key: `${r.id}-in`,
          id: r.id.substring(0, 8).toUpperCase(),
          name: r.customer.name,
          action: 'In',
          date: r.startDate,
        });

        // Check-out (Out) - if rental is finished or deleted
        if (r.status === 'finished' || r.deletedAt) {
          inoutList.push({
            key: `${r.id}-out`,
            id: r.id.substring(0, 8).toUpperCase(),
            name: r.customer.name,
            action: 'Out',
            date: dayjs(r.deletedAt || r.updatedAt).format('YYYY-MM-DD'),
          });
        }
      }
    }
    // Sort inout list by date descending
    inoutList.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

    // InOut chart data (6 months)
    const inoutChart = [];
    for (const m of monthsList) {
      const startOfMonth = m.startOf('month');
      const endOfMonth = m.endOf('month');

      let checkIns = 0;
      let checkOuts = 0;

      for (const item of inoutList) {
        const itemDate = dayjs(item.date);
        if ((itemDate.isAfter(startOfMonth) || itemDate.isSame(startOfMonth, 'day')) && 
            (itemDate.isBefore(endOfMonth) || itemDate.isSame(endOfMonth, 'day'))) {
          if (item.action === 'In') checkIns++;
          else if (item.action === 'Out') checkOuts++;
        }
      }

      inoutChart.push({
        name: m.format('MMM'),
        in: checkIns,
        out: checkOuts,
      });
    }

    // 3. Fetch all payments for this branch
    const payments = await this.paymentModel.findAll({
      where: { branchId },
      include: [Customer, Room],
      order: [['createdAt', 'DESC']],
    });

    // Helper to calculate "Pembayaran Ke-"
    const getPaymentSequence = (payment: Payment) => {
      const customerPayments = payments
        .filter(p => p.customerId === payment.customerId && p.rentalId === payment.rentalId)
        .sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));
      
      const idx = customerPayments.findIndex(p => p.id === payment.id);
      return idx !== -1 ? idx + 1 : 1;
    };

    const incomeList = payments.map((p) => ({
      key: p.id,
      room: p.room?.roomNumber || '-',
      nama: p.customer?.name || '-',
      bayarKe: getPaymentSequence(p),
      tanggal: p.paymentDate || p.dueDate,
      biaya: Number(p.amount),
      status: p.status === 'paid' ? 'Lunas' : p.status === 'pending' ? 'Pending' : p.status,
    }));

    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalBiaya = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Fetch maintenance records to calculate expenses
    const maintenanceRecords = await this.maintenanceModel.findAll({
      where: { branchId },
    });

    const totalMaintenance = maintenanceRecords.reduce(
      (sum, mRec) => sum + Number(mRec.electricBills || 0) + Number(mRec.operationalBills || 0),
      0,
    );

    // Income chart data (6 months)
    const incomeChart = [];
    for (const m of monthsList) {
      const startOfMonth = m.startOf('month');
      const endOfMonth = m.endOf('month');

      const monthlyIncome = payments
        .filter(p => p.status === 'paid' && p.paymentDate)
        .reduce((sum, p) => {
          const payDate = dayjs(p.paymentDate);
          if ((payDate.isAfter(startOfMonth) || payDate.isSame(startOfMonth, 'day')) && 
              (payDate.isBefore(endOfMonth) || payDate.isSame(endOfMonth, 'day'))) {
            return sum + Number(p.amount);
          }
          return sum;
        }, 0);

      const monthlyMaintenance = maintenanceRecords
        .reduce((sum, mRec) => {
          const mDate = dayjs(mRec.date);
          if ((mDate.isAfter(startOfMonth) || mDate.isSame(startOfMonth, 'day')) && 
              (mDate.isBefore(endOfMonth) || mDate.isSame(endOfMonth, 'day'))) {
            return sum + Number(mRec.electricBills || 0) + Number(mRec.operationalBills || 0);
          }
          return sum;
        }, 0);

      incomeChart.push({
        name: m.format('MMM'),
        income: monthlyIncome,
        expense: monthlyMaintenance,
      });
    }

    // 4. Fetch all rooms for this branch
    const rooms = await this.roomModel.findAll({
      where: { branchId },
      order: [
        [Sequelize.literal('CAST(room_number AS SIGNED)'), 'ASC'],
        ['roomNumber', 'ASC']
      ],
    });

    const formattedRoomsList = rooms.map((r, index) => ({
      key: r.id,
      no: index + 1,
      roomNumber: r.roomNumber,
      gender: r.gender === 'male' ? 'Laki-laki' : r.gender === 'female' ? 'Perempuan' : 'Campur',
      status: r.status === 'available' ? 'Tersedia' : r.status === 'filled' ? 'Terisi' : 'Maintenance',
    }));

    const totalRooms = formattedRoomsList.length;
    const roomsTersedia = formattedRoomsList.filter(r => r.status === 'Tersedia').length;
    const roomsTerisi = formattedRoomsList.filter(r => r.status === 'Terisi').length;

    // Room chart data (6 months)
    const roomChart = [];
    for (const m of monthsList) {
      const startOfMonth = m.startOf('month');
      const endOfMonth = m.endOf('month');

      // Rooms created up to endOfMonth
      const totalRoomsAtMonth = rooms.filter(r => dayjs(r.createdAt).isBefore(endOfMonth) || dayjs(r.createdAt).isSame(endOfMonth, 'day')).length;

      // Filled rooms = count of rentals active during that month
      let filledCount = 0;
      for (const rental of allRentals) {
        const rentStart = dayjs(rental.startDate);
        const rentEnd = rental.deletedAt ? dayjs(rental.deletedAt) : null;
        
        const startedBeforeOrDuring = rentStart.isBefore(endOfMonth) || rentStart.isSame(endOfMonth, 'day');
        const endedAfterOrDuring = !rentEnd || rentEnd.isAfter(startOfMonth) || rentEnd.isSame(startOfMonth, 'day');
        
        if (startedBeforeOrDuring && endedAfterOrDuring) {
          filledCount++;
        }
      }

      const availableCount = Math.max(0, totalRoomsAtMonth - filledCount);

      roomChart.push({
        name: m.format('MMM'),
        filled: filledCount,
        available: availableCount,
      });
    }

    return {
      customer: {
        totalCustomers,
        totalAktif,
        totalNonaktif,
        list: formattedCustomersList,
        chart: customerChart,
      },
      inout: {
        list: inoutList,
        chart: inoutChart,
      },
      income: {
        totalRevenue,
        totalBiaya,
        totalPending,
        totalMaintenance,
        list: incomeList,
        chart: incomeChart,
      },
      room: {
        totalRooms,
        roomsTersedia,
        roomsTerisi,
        list: formattedRoomsList,
        chart: roomChart,
      }
    };
  }
}
