import type { Event } from "@/contexts/events/domain/event.entity";
import type { Guest } from "@/contexts/events/domain/guest.entity";
import type { Tenant } from "@/contexts/tenants/domain/tenant.entity";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as QRCode from "qrcode";
import { Resend } from "resend";

@Injectable()
export class NotificationService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>("RESEND_API_KEY"));
  }

  async sendGuestTicket(
    guest: Partial<Guest>,
    event: Partial<Event>,
    tenant: Partial<Tenant>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const qrCodeBuffer = await QRCode.toBuffer(guest.id!);
    const emailFrom = this.configService.get<string>(
      "EMAIL_FROM",
      "onboarding@resend.dev",
    );

    const primaryColor = tenant.primaryColor ?? "#4F46E5";
    const guestName = guest.fullName ?? "Invitado";
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString()
      : "A confirmar";
    const eventName = event.honoreeName ?? "Evento Especial";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu Ticket Digital</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f7f9;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .header {
            background-color: ${primaryColor};
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
          }
          .content {
            padding: 40px;
            text-align: center;
          }
          .content h2 {
            margin-top: 0;
            color: #333;
          }
          .qr-wrapper {
            margin: 30px auto;
            padding: 15px;
            border: 2px dashed ${primaryColor};
            display: inline-block;
            border-radius: 12px;
          }
          .event-details {
            margin-top: 30px;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
            text-align: left;
            display: inline-block;
            width: 100%;
            box-sizing: border-box;
          }
          .detail-row {
            margin-bottom: 10px;
            font-size: 16px;
          }
          .detail-label {
            font-weight: bold;
            color: #666;
            width: 80px;
            display: inline-block;
          }
          .footer {
            padding: 20px;
            background-color: #f9fafb;
            color: #999;
            font-size: 13px;
            text-align: center;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket de Acceso</h1>
          </div>
          <div class="content">
            <h2>¡Hola, ${guestName}!</h2>
            <p>Tu entrada para <strong>${eventName}</strong> ya está disponible.</p>
            
            <div class="qr-wrapper">
              <img src="cid:qrcode" alt="QR de Acceso" width="220" height="220" />
            </div>
            
            <p>Presentá este código en la entrada del evento.</p>
            
            <div class="event-details">
              <div class="detail-row">
                <span class="detail-label">Evento:</span>
                <span>${eventName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span>${eventDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invitado:</span>
                <span>${guestName}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Este es un mail automático enviado por ${tenant.name ?? "nuestro servicio de eventos"}.</p>
            <p>&copy; ${new Date().getFullYear()} ${tenant.name ?? "App Eventos"}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.resend.emails.send({
      from: emailFrom,
      to: guest.email!,
      subject: `🎟️ Tu entrada para ${eventName}`,
      html: htmlContent,
      attachments: [
        {
          filename: "access-qr.png",
          content: qrCodeBuffer,
          contentId: "qrcode",
        },
      ],
    });
  }
}
