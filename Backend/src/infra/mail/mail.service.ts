import React from "react";

import {render} from "@react-email/render";
import {IMailProvider, SendMailOptions} from "./mail.interface";
import {mailTemplates, type MailSchemaKey} from "./mail.schema";

export class MailService {
    constructor(private provider: IMailProvider) {}

    async send<S extends MailSchemaKey>(options: SendMailOptions<S>): Promise<void> {
        const entry = mailTemplates[options.schema]; ///puxo o template do email a partir do schema
        const html = await render(React.createElement(entry.component, options.data)); ///renderizo o template do email para html
        await this.provider.send({
            to: options.to,
            subject: entry.subject,
            html,
        });
    }
}