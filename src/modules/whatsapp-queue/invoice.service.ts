import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { MediaService } from '@/modules/media/media.service';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id'); // Set locale to Indonesian

@Injectable()
export class InvoiceService {
  constructor(private readonly mediaService: MediaService) { }

  async generateInvoice(
    invoiceNumber: string,
    customerName: string,
    amount: number,
    status: string,
    dueDate: Date | string,
    paymentDate?: Date | string,
    roomNo?: string,
    paymentMethod?: string,
    branchName?: string,
    formattedDueDate?: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const fileName = `INV-${invoiceNumber}.pdf`;

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          try {
            const pdfData = Buffer.concat(buffers);

            const fileMock = {
              originalname: fileName,
              buffer: pdfData,
              mimetype: 'application/pdf',
            } as Express.Multer.File;

            const uploadResult = await this.mediaService.uploadFile(fileMock);
            resolve(uploadResult.url);
          } catch (err) {
            reject(err);
          }
        });

        const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

        const blueColor = '#2563eb';
        const darkGray = '#374151';
        const lightGray = '#6b7280';

        // Header Line
        doc.rect(0, 0, doc.page.width, 10).fill(blueColor);
        doc.moveDown(2);

        // Top Left
        doc.fillColor(blueColor).fontSize(24).text('KOSTMATE', 50, 50);
        doc.fillColor(lightGray).fontSize(10)
          .text('Sistem Manajemen Kos Profesional', 50, 75)
          .text('Jl. Merdeka No. 123, Jakarta', 50, 90)
          .text('Telp: 0812-3456-7890', 50, 105);

        // Top Right
        doc.fillColor(darkGray).fontSize(20).text('INVOICE', 0, 50, { align: 'right', width: doc.page.width - 50 });

        doc.fontSize(10).fillColor(lightGray).text(`No: `, doc.page.width - 200, 75, { continued: true }).fillColor(darkGray).text(invoiceNumber.substring(0, 8).toUpperCase(), { align: 'right' });
        doc.fillColor(lightGray).text(`Tanggal: `, doc.page.width - 200, 90, { continued: true }).fillColor(darkGray).text(paymentDate ? dayjs(paymentDate).format('DD/MM/YYYY') : '-', { align: 'right' });

        // Status Badge
        const isLunas = status.toLowerCase() === 'lunas';
        const badgeColor = isLunas ? '#dcfce7' : '#fee2e2';
        const textColor = isLunas ? '#166534' : '#991b1b';
        const statusText = isLunas ? 'LUNAS' : 'BELUM LUNAS';

        doc.rect(doc.page.width - 130, 110, 80, 20).fill(badgeColor);
        doc.fillColor(textColor).fontSize(10).text(statusText, doc.page.width - 130, 115, { width: 80, align: 'center' });

        // Divider
        doc.rect(50, 150, doc.page.width - 100, 1).fill('#e5e7eb');

        // Customer Info
        doc.fillColor(lightGray).fontSize(10).text('Ditagihkan Kepada:', 50, 170);
        doc.fillColor(darkGray).fontSize(14).text(customerName, 50, 185);
        doc.fillColor(lightGray).fontSize(10).text(`Cabang: ${branchName || '-'}`, 50, 205);
        doc.fillColor(lightGray).fontSize(10).text(`Kamar: ${roomNo || '-'}`, 50, 225);

        // Detail Pembayaran
        doc.fillColor(lightGray).fontSize(10).text('Detail Pembayaran:', 350, 170);
        doc.fillColor(darkGray).text(`Jatuh Tempo: ${dayjs(dueDate).format('DD/MM/YYYY')}`, 350, 185);
        doc.text(`Metode: ${paymentMethod || '-'}`, 350, 200);

        // Table Header
        const tableTop = 250;
        doc.rect(50, tableTop, doc.page.width - 100, 30).fill('#eff6ff'); // blue-50
        doc.fillColor(darkGray).fontSize(10).text('Deskripsi', 60, tableTop + 10);
        doc.text('Total Harga', 0, tableTop + 10, { align: 'right', width: doc.page.width - 60 });

        // Table Row
        const rowTop = tableTop + 40;
        doc.fillColor(lightGray).text(`Biaya Sewa Kamar No ${roomNo || '-'} - ${formattedDueDate}`, 60, rowTop);
        doc.fillColor(darkGray).text(formatRupiah(amount), 0, rowTop, { align: 'right', width: doc.page.width - 60 });

        // Divider
        doc.rect(50, rowTop + 20, doc.page.width - 100, 1).fill('#e5e7eb');

        // Subtotal
        doc.fillColor(darkGray).fontSize(10).text('Subtotal:', 350, rowTop + 40);
        doc.text(formatRupiah(amount), 0, rowTop + 40, { align: 'right', width: doc.page.width - 60 });

        // Total Area
        doc.rect(50, rowTop + 60, doc.page.width - 100, 30).fill('#eff6ff');
        doc.fillColor(blueColor).fontSize(12).text('TOTAL KESELURUHAN:', 300, rowTop + 70);
        doc.text(formatRupiah(amount), 0, rowTop + 69, { align: 'right', width: doc.page.width - 60 });

        // Footer
        doc.fillColor(lightGray).fontSize(10).text('Terima kasih atas pembayaran Anda!', 50, rowTop + 150, { align: 'center', width: doc.page.width - 100 });
        doc.text('Jika ada pertanyaan terkait invoice ini, silakan hubungi owner kos cabang anda.', 50, rowTop + 165, { align: 'center', width: doc.page.width - 100 });

        doc.end();

      } catch (err) {
        reject(err);
      }
    });
  }
}
