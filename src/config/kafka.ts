import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { notificationTransportProvider } from "../factories/notification-factory";
import { Order, OrderEvents } from "../types";
import { getSubjectTextAndHtml } from "../handlers";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });

    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        // Logic to handle incoming messages.
        console.log({
          value: message.value.toString(),
          topic,
          partition,
        });

        if (topic === "order") {
          const order: { "event-type": OrderEvents, "message": Order } = JSON.parse(message.value.toString())
          console.log("order", order);
          const mailTransport = notificationTransportProvider("mail")
          const data = getSubjectTextAndHtml(order)
          console.log("data", data);
          console.log("customerId.email", order["message"].customerId.email);

          if (!order["message"].customerId.email) {
            return
          }
          await mailTransport.send({
            to: order["message"].customerId.email,
            subject: data.subject,
            text: data.text,
            html: data.html
          })
        }
      },
    });
  }
}
