import React from "react";
import { render } from "@react-email/render";
import type { IMailProvider } from "./mail.interface.js";
import { ResendProvider } from "./mail.provider.js";
import { PasswordReset, type PasswordResetProps } from "./templates/reset-password.js";

export interface MailSchemaMap {
  PASSWORD_RESET: PasswordResetProps;
}

export type MailSchemaKey = keyof MailSchemaMap;

interface SchemaEntry<P> {
  subject: string;
  component: React.FC<P>;
}

const mailTemplates: { [K in MailSchemaKey]: SchemaEntry<MailSchemaMap[K]> } = {
  PASSWORD_RESET: {
    subject: "Redefinição de senha — Black Amber Coffee",
    component: PasswordReset,
  },
};

export interface SendMailOptions<S extends MailSchemaKey> {
  schema: S;
  to: string;
  data: MailSchemaMap[S];
}

export class MailService {
  constructor(private readonly provider: IMailProvider) {}

  async send<S extends MailSchemaKey>(options: SendMailOptions<S>): Promise<void> {
    const entry = mailTemplates[options.schema];
    const html = await render(React.createElement(entry.component, options.data));
    await this.provider.send({
      to: options.to,
      subject: entry.subject,
      html,
    });
  }
}

export const mailService = new MailService(new ResendProvider());
