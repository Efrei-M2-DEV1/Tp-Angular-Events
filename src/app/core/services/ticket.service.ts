import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';
import { Event } from '../models/event.model';
import { Registration } from '../models/registration.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private appName = 'Events Manager';

  async generateTicket(event: Event, user: User, registration: Registration, categoryName?: string): Promise<void> {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(102, 126, 234); // dark blue-gray
    doc.rect(0, 0, pageWidth, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(this.appName, margin, 55);

    // Title
    doc.setTextColor(33, 33, 33);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Billet d\'entrée', margin, 140);

    // Event info (no description)
    const yStart = 170;
    let y = yStart;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const categoryDisplay = categoryName || (event as any).categoryName || (event.categoryId ? String(event.categoryId) : '—');
    const rows: Array<[string, string]> = [
      ['Événement', String(event.title)],
      ['Date', this.formatDate(event.date)],
      ['Lieu', String(event.location || 'Non précisé')],
      ['Catégorie', categoryDisplay],
      // ['Places (actuelles / max)', `${event.currentParticipants || 0} / ${event.maxParticipants || '—'}`],
    ];

    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label} :`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 160, y);
      y += 22;
    });

    // User info
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Participant', margin, y);
    y += 18;
    doc.setFontSize(12);
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const userRows: Array<[string, string]> = [
      ['Nom', fullName],
      ['Email', user.email],
      ['ID Inscription', String(registration.id)],
    ];
    userRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label} :`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), margin + 160, y);
      y += 22;
    });

    // QR code - encode minimal payload
    const qrPayload = JSON.stringify({
      t: 'ticket',
      v: 1,
      ticketId: String(registration.id || ''),
      eventId: String(event.id || ''),
      userId: String(user.id || ''),
      ts: new Date().toISOString()
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 1 });
      // Place QR on the right
      const qrSize = 160;
      const qrX = pageWidth - qrSize - margin;
      const qrY = yStart;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // Label under QR
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Scannez pour valider', qrX, qrY + qrSize + 16);
    } catch (err) {
      // Soft-fail QR generation
      console.warn('QR generation failed', err);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(200, 0, 0);
      doc.text('QR non disponible', pageWidth - 160 - margin, yStart + 20);
    }

    // Footer
    const footerY = 780;
    doc.setDrawColor(220);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Généré le ${this.formatDate(new Date().toISOString())} — ${this.appName}`, margin, footerY);

    // Save
    const safeTitle = String(event.title || 'evenement').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();
    const safeName = fullName.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();
    doc.save(`billet_${safeTitle}_${safeName}.pdf`);
  }

  private formatDate(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
