import nodemailer from "nodemailer";

const isEmailConfigured = 
  !!process.env.SMTP_HOST && 
  !!process.env.SMTP_USER && 
  !!process.env.SMTP_PASSWORD;

// Create transporter if SMTP configuration is present
const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

/**
 * General send email utility
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    console.log("----------------------------------------");
    console.log(`[SMTP MOCK] Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.slice(0, 300)}...`);
    console.log("----------------------------------------");
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Fokus Studio" <no-reply@fokus.id>',
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

/**
 * Send order invoice/confirmation email
 */
export async function sendOrderNotificationEmail(order: any, userEmail: string) {
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          ${item.equipment?.name || item.service?.name || "Layanan/Alat"}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">
          Rp ${item.price.toLocaleString("id-ID")}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">
          Rp ${item.subtotal.toLocaleString("id-ID")}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #c2410c; border-bottom: 2px solid #c2410c; padding-bottom: 10px;">
        Fokus Studio & Rental
      </h2>
      <p>Halo,</p>
      <p>Terima kasih atas pesanan Anda. Berikut adalah detail transaksi untuk pesanan Anda <strong>#${order.orderNumber}</strong> dengan status <strong>${order.status}</strong>:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Jumlah</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Harga</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; color: #c2410c;">
              Rp ${order.totalAmount.toLocaleString("id-ID")}
            </td>
          </tr>
        </tfoot>
      </table>

      <p>Untuk melengkapi pembayaran, silakan buka dasbor Anda dan pilih metode pembayaran Virtual Account atau QRIS simulator.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
        Ini adalah email otomatis, mohon tidak membalas email ini secara langsung.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `[Fokus Studio] Invoice Pesanan #${order.orderNumber}`,
    html,
  });
}

/**
 * Send studio booking notification email
 */
export async function sendBookingNotificationEmail(booking: any, userEmail: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #c2410c; border-bottom: 2px solid #c2410c; padding-bottom: 10px;">
        Fokus Studio & Rental
      </h2>
      <p>Halo,</p>
      <p>Pemesanan studio foto Anda telah kami terima.</p>
      
      <div style="background-color: #fff7ed; padding: 15px; border-left: 4px solid #c2410c; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #9a3412;">Detail Pemesanan Studio</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; width: 120px;">Studio:</td>
            <td>${booking.studio?.name || booking.studioId}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Tanggal:</td>
            <td>${new Date(booking.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Jam Sewa:</td>
            <td>${booking.startTime} - ${booking.endTime} (${booking.duration} jam)</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Status:</td>
            <td style="color: #c2410c; font-weight: bold;">${booking.status}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Total Biaya:</td>
            <td style="font-weight: bold;">Rp ${booking.totalPrice.toLocaleString("id-ID")}</td>
          </tr>
        </table>
      </div>

      <p>Silakan selesaikan pembayaran di dasbor Anda jika statusnya masih <strong>PENDING</strong>.</p>
      <p>Kami menantikan kehadiran Anda di studio kami!</p>

      <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
        Ini adalah email otomatis, mohon tidak membalas email ini secara langsung.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `[Fokus Studio] Konfirmasi Pemesanan Studio - ${booking.studio?.name || "Booking Studio"}`,
    html,
  });
}
