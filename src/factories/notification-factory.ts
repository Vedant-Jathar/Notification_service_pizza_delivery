import { MailTransport } from "../mail";
import { NotificationTransport } from "../types/notification-types";

export function notificationTransportProvider(type: "mail" | "sms"): NotificationTransport {
    const transporterCache: NotificationTransport[] = []

    switch (type) {
        case "mail": {
            let instance = transporterCache.find(transport => transport instanceof MailTransport)
            if (!instance) {
                instance = new MailTransport()
                transporterCache.push(instance)
                return instance
            }
            break
        }

        case "sms": {
            throw Error("sms notification is not supported")
        }

        default: {
            throw Error(`${type} is not supported`)
        }
    }
}