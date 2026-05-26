import React from "react";
import {
  PasswordReset,
  type PasswordResetProps,
} from "./tamplate/reset-password";

export interface MailSchemaMap {
  PASSWORD_RESET: PasswordResetProps;
}

export type MailSchemaKey = keyof MailSchemaMap;

interface SchemaEntry<P> {
  subject: string;
  component: React.FC<P>;
}

export interface MailSchema {
  key: MailSchemaKey;
  data: MailSchemaMap[MailSchemaKey];
}

export const mailTemplates: Record<MailSchemaKey, SchemaEntry<any>> = {
  PASSWORD_RESET: {
    subject: "Redefinição de senha",
    component: PasswordReset,
  },
};
