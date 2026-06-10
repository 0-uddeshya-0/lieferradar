import nodemailer from 'nodemailer';
import type { Order, Supplier, Organization, OrderStatus } from '@prisma/client';
import { config } from '../config';
import { STATUS_LABELS } from '@lieferradar/shared';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  cc?: string;
}

export interface DigestData {
  totalActive: number;
  overdue: number;
  silentSuppliers: number;
  criticalOrders: Array<{
    orderNumber: string;
    supplierName: string;
    partDescription: string;
    dueDate: string;
    status: string;
  }>;
  unresponsiveSuppliers: Array<{ name: string; count: number }>;
  deliveredThisWeek: Array<{
    orderNumber: string;
    supplierName: string;
    partDescription: string;
  }>;
}

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
  auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
});

function baseLayout(content: string, footerNote?: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;">
${content}
<p style="font-size:12px;color:#666;margin-top:30px;border-top:1px solid #eee;padding-top:15px;">
${footerNote ?? 'Diese E-Mail wurde von LieferRadar versendet.'}
<br>Bei Fragen wenden Sie sich bitte an den Besteller.
</p>
</body></html>`;
}

function ctaButton(url: string, label: string): string {
  return `<p style="text-align:center;margin:25px 0;">
<a href="${url}" style="background:#364fc7;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">${label}</a>
</p>`;
}

export async function sendEmail(template: EmailTemplate): Promise<void> {
  await transporter.sendMail({
    from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM_ADDRESS}>`,
    to: template.to,
    cc: template.cc,
    subject: template.subject,
    html: template.html,
  });
}

export function buildInitialNotification(
  order: Order & { supplier: Supplier; organization: Organization }
): EmailTemplate {
  const statusUrl = `${config.WEB_URL}/s/${order.magicToken}`;
  const dueDate = order.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
  const greeting = order.supplier.contactName
    ? `Guten Tag ${order.supplier.contactName},`
    : 'Guten Tag,';

  const html = baseLayout(`
<h2>Bestellbestätigung anfragen</h2>
<p>${greeting}</p>
<p>${order.organization.name} bittet Sie um eine Statusaktualisierung für folgende Bestellung:</p>
<table style="width:100%;border-collapse:collapse;margin:15px 0;">
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Bestellnr.</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${order.orderNumber}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Artikel</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${order.partDescription}</td></tr>
${order.quantity ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Menge</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${order.quantity} ${order.unit ?? ''}</td></tr>` : ''}
<tr><td style="padding:8px;"><strong>Liefertermin</strong></td><td style="padding:8px;">${dueDate}</td></tr>
</table>
${ctaButton(statusUrl, 'Status aktualisieren')}
<p style="font-size:13px;color:#666;">Alternativ können Sie auf diese E-Mail antworten. // TODO(phase2): Inbound-E-Mail-Parsing</p>
`, `Kontakt: ${order.organization.email}`);

  return {
    to: order.supplier.contactEmail,
    subject: `Bestellbestätigung anfragen – ${order.orderNumber} von ${order.organization.name}`,
    html,
  };
}

export function buildStatusUpdateAlert(
  order: Order & { supplier: Supplier; organization: Organization },
  newStatus: OrderStatus,
  note?: string | null
): EmailTemplate {
  const orderUrl = `${config.WEB_URL}/orders/${order.id}`;
  const statusLabel = STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] ?? newStatus;

  const html = baseLayout(`
<h2>Status aktualisiert</h2>
<p>Der Lieferant <strong>${order.supplier.name}</strong> hat den Status für Bestellung <strong>${order.orderNumber}</strong> aktualisiert.</p>
<p><strong>Neuer Status:</strong> ${statusLabel}</p>
${note ? `<p><strong>Anmerkung:</strong> ${note}</p>` : ''}
${ctaButton(orderUrl, 'Bestellung ansehen')}
`);

  const managerEmail = order.organization.email;
  return {
    to: managerEmail,
    subject: `Status aktualisiert: ${order.orderNumber} – ${statusLabel}`,
    html,
  };
}

export function buildReminder1(
  order: Order & { supplier: Supplier }
): EmailTemplate {
  const statusUrl = `${config.WEB_URL}/s/${order.magicToken}`;
  const dueDate = order.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });

  const html = baseLayout(`
<h2>Erinnerung: Status ausstehend</h2>
<p>Guten Tag,</p>
<p>wir möchten Sie freundlich daran erinnern, den Status für Bestellung <strong>${order.orderNumber}</strong> zu aktualisieren.</p>
<p>Geplanter Liefertermin: <strong>${dueDate}</strong></p>
${ctaButton(statusUrl, 'Status aktualisieren')}
`, 'Sie erhalten diese Erinnerung, weil noch kein Status gemeldet wurde. Bei Fragen wenden Sie sich bitte an den Besteller.');

  return {
    to: order.supplier.contactEmail,
    subject: `Erinnerung: Bitte Bestellstatus aktualisieren – ${order.orderNumber}`,
    html,
  };
}

export function buildReminder2(
  order: Order & { supplier: Supplier; organization: Organization }
): EmailTemplate {
  const statusUrl = `${config.WEB_URL}/s/${order.magicToken}`;
  const dueDate = order.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });

  const html = baseLayout(`
<h2>Dringende Erinnerung</h2>
<p>Guten Tag,</p>
<p>der Status für Bestellung <strong>${order.orderNumber}</strong> steht weiterhin aus. Bitte aktualisieren Sie den Status umgehend.</p>
<p>Liefertermin: <strong>${dueDate}</strong></p>
${ctaButton(statusUrl, 'Jetzt Status aktualisieren')}
`, 'Diese E-Mail wurde automatisch versendet, da kein Status gemeldet wurde.');

  return {
    to: order.supplier.contactEmail,
    cc: order.organization.email,
    subject: `Dringende Erinnerung: Status ausstehend – ${order.orderNumber}`,
    html,
  };
}

export function buildUnresponsiveAlert(
  supplierName: string,
  orderCount: number,
  managerEmail: string
): EmailTemplate {
  const html = baseLayout(`
<h2>Lieferant antwortet nicht</h2>
<p>Der Lieferant <strong>${supplierName}</strong> hat auf <strong>${orderCount}</strong> Bestellung(en) nicht reagiert, trotz mehrfacher Erinnerungen.</p>
${ctaButton(`${config.WEB_URL}/suppliers`, 'Lieferantenübersicht öffnen')}
`);

  return {
    to: managerEmail,
    subject: `Lieferant antwortet nicht: ${supplierName} – ${orderCount} Bestellungen ausstehend`,
    html,
  };
}

export function buildWeeklyDigest(
  org: Organization,
  digestData: DigestData
): EmailTemplate {
  const criticalRows = digestData.criticalOrders
    .map(
      (o) =>
        `<tr><td style="padding:6px;border-bottom:1px solid #eee;">${o.orderNumber}</td><td style="padding:6px;border-bottom:1px solid #eee;">${o.supplierName}</td><td style="padding:6px;border-bottom:1px solid #eee;">${o.partDescription}</td><td style="padding:6px;border-bottom:1px solid #eee;">${o.dueDate}</td><td style="padding:6px;border-bottom:1px solid #eee;">${o.status}</td></tr>`
    )
    .join('');

  const unresponsiveList = digestData.unresponsiveSuppliers
    .map((s) => `<li>${s.name} (${s.count} Bestellungen)</li>`)
    .join('');

  const deliveredList = digestData.deliveredThisWeek
    .map((o) => `<li>${o.orderNumber} – ${o.supplierName}: ${o.partDescription}</li>`)
    .join('');

  const html = baseLayout(`
<h2>LieferRadar Wochenbericht</h2>
<p>Guten Tag,</p>
<h3>📊 Aktuelle Übersicht</h3>
<ul>
<li>${digestData.totalActive} aktive Bestellungen</li>
<li>${digestData.overdue} überfällig</li>
<li>${digestData.silentSuppliers} Lieferanten still</li>
</ul>
<h3>🔴 Kritische Bestellungen</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<thead><tr style="background:#f5f5f5;"><th style="padding:6px;text-align:left;">Bestellnr.</th><th style="padding:6px;text-align:left;">Lieferant</th><th style="padding:6px;text-align:left;">Artikel</th><th style="padding:6px;text-align:left;">Fällig</th><th style="padding:6px;text-align:left;">Status</th></tr></thead>
<tbody>${criticalRows || '<tr><td colspan="5" style="padding:10px;">Keine kritischen Bestellungen</td></tr>'}</tbody>
</table>
<h3>⚠️ Lieferanten ohne Reaktion</h3>
<ul>${unresponsiveList || '<li>Keine</li>'}</ul>
<h3>🟢 Diese Woche geliefert</h3>
<ul>${deliveredList || '<li>Keine Lieferungen</li>'}</ul>
${ctaButton(`${config.WEB_URL}/dashboard`, 'Dashboard öffnen')}
`);

  return {
    to: org.email,
    subject: `LieferRadar Wochenbericht – ${digestData.overdue} Bestellungen überfällig`,
    html,
  };
}
