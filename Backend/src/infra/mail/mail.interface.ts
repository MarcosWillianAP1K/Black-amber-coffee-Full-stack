import type { MailSchemaMap, MailSchemaKey } from "./mail.schema";

export type SendMailOptions<S extends MailSchemaKey = MailSchemaKey> = {
  schema: S;
  to: string;
  data: MailSchemaMap[S];
};

export interface IMailProvider {
  send(options: { to: string; subject: string; html: string }): Promise<void>;
}