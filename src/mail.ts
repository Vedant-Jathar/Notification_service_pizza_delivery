import { Transporter } from "nodemailer";
import { Message, NotificationTransport } from "./types/notification-types";
import nodemailer from "nodemailer"
import config from "config"

export class MailTransport implements NotificationTransport {
    private transporter: Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.get("mail.host"),
            port: config.get("mail.port"),
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.get("mail.auth.user"),
                pass: config.get("mail.auth.password"),
            },
        });
    }

    async send(message: Message) {

        const info = await this.transporter.sendMail({
            from: config.get("mail.from"),
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
        });

        console.log("Message sent:", info.messageId);
    }
}

const mailTransport = new MailTransport()

mailTransport.send({
    to: "ram@gmail.com",
    subject: "Order placed",
    html: "<h1>Hey thanks for the order</h1>",
    text: "Hey thanks for the order"
})

