export interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface IMailProvider {
  send(payload: MailPayload): Promise<void>;
}
