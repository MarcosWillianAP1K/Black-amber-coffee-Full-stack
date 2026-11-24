import { Resend } from "resend";
import type { IMailProvider, MailPayload } from "./mail.interface.js";
import { env } from "../config/env.js";

export class ResendProvider implements IMailProvider {
  private client: Resend | null = null;

  private getClient(): Resend {
    if (!env.RESEND_API_KEY) {
      throw new Error("MAIL_NOT_CONFIGURED");
    }
    if (!this.client) {
      this.client = new Resend(env.RESEND_API_KEY);
    }
    return this.client;
  }

  async send(options: MailPayload): Promise<void> {
    const client = this.getClient();
    await client.emails.send({
      from: env.SYSTEM_MAIL_ADDR,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
