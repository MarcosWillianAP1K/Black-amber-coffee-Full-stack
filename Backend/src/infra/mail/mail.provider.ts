import { Resend } from "resend";
import type { IMailProvider } from "./mail.interface";
import { env } from "../../config/env";

export class ResendProvider implements IMailProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    await this.client.emails.send({
      from: env.SYSTEM_MAIL_ADDR,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}