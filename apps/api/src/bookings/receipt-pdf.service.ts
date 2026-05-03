import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

export interface ReceiptResult {
  filename: string;
  buffer: Buffer;
}

@Injectable()
export class ReceiptPdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(bookingId: string, userId: string): Promise<ReceiptResult> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        course: { select: { title: true, isFree: true } },
        session: {
          select: {
            startTime: true,
            endTime: true,
            location: { select: { name: true } },
          },
        },
        payment: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Buchung nicht gefunden.');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException();
    }

    const isFreeConfirmed =
      booking.course.isFree && booking.status === 'CONFIRMED';
    const isPaid = booking.payment?.status === 'PAID';

    if (!isFreeConfirmed && !isPaid) {
      throw new BadRequestException(
        'Eine Quittung steht erst nach abgeschlossener Zahlung zur Verfügung.',
      );
    }

    const buffer = await this.renderPdf({
      bookingId: booking.id,
      customerName: `${booking.user?.firstName ?? ''} ${booking.user?.lastName ?? ''}`.trim(),
      customerEmail: booking.user?.email ?? '',
      courseTitle: booking.course.title,
      sessionStart: booking.session?.startTime ?? null,
      sessionEnd: booking.session?.endTime ?? null,
      location: booking.session?.location.name ?? null,
      amountInCents: booking.payment?.amountInCents ?? 0,
      currency: booking.payment?.currency ?? 'EUR',
      paidAt: booking.payment?.paidAt ?? null,
      stripePaymentId: booking.payment?.stripePaymentId ?? null,
      bookingCreatedAt: booking.createdAt,
    });

    return {
      filename: `quittung-${booking.id}.pdf`,
      buffer,
    };
  }

  private renderPdf(data: {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    courseTitle: string;
    sessionStart: Date | null;
    sessionEnd: Date | null;
    location: string | null;
    amountInCents: number;
    currency: string;
    paidAt: Date | null;
    stripePaymentId: string | null;
    bookingCreatedAt: Date;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 56 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const dateFormatter = new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeFormatter = new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const moneyFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: data.currency,
      });

      doc
        .fontSize(22)
        .fillColor('#2e2a25')
        .text('Tanzmoment', { align: 'left' })
        .fontSize(10)
        .fillColor('#5e5a55')
        .text('Tanzstudio · Mössingen', { align: 'left' })
        .moveDown(2);

      doc
        .fontSize(18)
        .fillColor('#2e2a25')
        .text('Quittung', { align: 'left' })
        .fontSize(10)
        .fillColor('#5e5a55')
        .text(`Buchungs-Nr.: ${data.bookingId}`)
        .text(`Ausgestellt am: ${dateFormatter.format(new Date())}`)
        .moveDown(1.5);

      doc
        .fontSize(11)
        .fillColor('#2e2a25')
        .text('Rechnungsempfänger', { underline: true })
        .moveDown(0.3)
        .fillColor('#5e5a55')
        .text(data.customerName || data.customerEmail)
        .text(data.customerEmail)
        .moveDown(1.5);

      doc
        .fontSize(11)
        .fillColor('#2e2a25')
        .text('Buchungsdetails', { underline: true })
        .moveDown(0.3)
        .fillColor('#5e5a55');

      doc.text(`Kurs: ${data.courseTitle}`);
      if (data.sessionStart) {
        doc.text(
          `Termin: ${dateFormatter.format(data.sessionStart)}, ` +
            `${timeFormatter.format(data.sessionStart)}` +
            (data.sessionEnd
              ? ` – ${timeFormatter.format(data.sessionEnd)} Uhr`
              : ' Uhr'),
        );
      }
      if (data.location) {
        doc.text(`Ort: ${data.location}`);
      }
      doc.text(`Buchung erstellt: ${dateFormatter.format(data.bookingCreatedAt)}`);
      doc.moveDown(1.5);

      doc
        .fontSize(11)
        .fillColor('#2e2a25')
        .text('Zahlung', { underline: true })
        .moveDown(0.3)
        .fillColor('#5e5a55');

      const amount = moneyFormatter.format(data.amountInCents / 100);
      if (data.amountInCents === 0) {
        doc.text('Kostenfreier Kurs');
      } else {
        doc.text(`Betrag: ${amount}`);
      }

      if (data.paidAt) {
        doc.text(`Bezahlt am: ${dateFormatter.format(data.paidAt)}`);
      }
      if (data.stripePaymentId) {
        doc.text(`Zahlungsreferenz: ${data.stripePaymentId}`);
      }

      doc.moveDown(2);
      doc
        .fontSize(9)
        .fillColor('#5e5a55')
        .text(
          'Vielen Dank für deine Buchung. Diese Quittung wurde automatisch ' +
            'erstellt und ist ohne Unterschrift gültig. Bei Fragen wende ' +
            'dich gerne an kontakt@tanzmoment.de.',
          { align: 'left' },
        );

      doc.end();
    });
  }
}
