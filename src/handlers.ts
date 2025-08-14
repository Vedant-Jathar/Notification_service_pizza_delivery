import { Order, OrderEvents, PaymentMode, PaymentStatus } from "./types";
import config from "config"

export const getSubjectTextAndHtml = (order: { "event-type": OrderEvents, "message": Order }) => {
    if ((order["event-type"] === OrderEvents.ORDER_CREATE && order["message"].paymentMode === PaymentMode.CASH) || (order["event-type"] === OrderEvents.PAYMENT_STATUS_UPDATE && order["message"].paymentStatus === PaymentStatus.PAID)) {
        return {
            subject: "Order Placed",
            text: `Thank you for the order!.Your order will be delivered within 45 mins.Your order id is ${order["message"]._id}`,
            html:
                `
            <div>
            <h2>Thank you for the order!.</h2>
            <h2>Your order will be delivered within 45 mins.</h2>
            <h2>Your order id is ${order["message"]._id}</h2>
            <h2>You can see the status of your order here:<a href="${config.get("clientUI.url")}/order/${order["message"]._id}">${order["message"]._id}</a></h2>
            </div>
                `
        }
    }

    else if (order["event-type"] === OrderEvents.ORDER_STATUS_UPDATE) {
        return {
            subject: `Order ${order["message"].orderStatus}`,
            text: `Your order is ${order["message"].orderStatus}`,
            html:
                `
            <div>
            <h2>Your order is ${order["message"].orderStatus}</h2>
            <h2>You can see the status of your order here:<a href="${config.get("clientUI.url")}/order/${order["message"]._id}">${order["message"]._id}</a></h2>
            </div>
                `
        }
    }
}