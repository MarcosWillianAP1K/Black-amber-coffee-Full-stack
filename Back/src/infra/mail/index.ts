import { ResendProvider } from "./mail.provider";
import { MailService } from "./mail.service";

export type { SendMailOptions } from "./mail.interface";
export type { MailSchemaKey, MailSchemaMap } from "./mail.schema";

const resendProvider = new ResendProvider();
export const mailService = new MailService(resendProvider);