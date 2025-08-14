import { Consumer, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { notificationTransportProvider } from "../factories/notification-factory";
import { Order, OrderEvents } from "../types";
import { getSubjectTextAndHtml } from "../handlers";
import config from "config"

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {

    let kafkaConfig: KafkaConfig = {
      clientId,
      brokers
    }

    if (process.env.NODE_ENV === "development") {
      kafkaConfig = {
        ...kafkaConfig,
        ssl: true,
        connectionTimeout: 45000,
        sasl: {
          mechanism: "plain",
          username: config.get("kafka.sasl.username"),
          password: config.get("kafka.sasl.password")
        }
      }
    }

    if (process.env.NODE_ENV === "production") {
      kafkaConfig = {
        ...kafkaConfig,
        ssl: true,
        connectionTimeout: 45000,
        sasl: {
          mechanism: "plain",
          username: config.get("kafka.sasl.username"),
          password: config.get("kafka.sasl.password")
        }
      }
    }
    const kafka = new Kafka(kafkaConfig);

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
        if (!message || !message.value) {
          return
        }

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

          if (!data) {
            return
          }

          console.log("customerId.email", order["message"].customerId.email);

          if (!order["message"].customerId.email) {
            return
          }

          console.log("Mail transport:", mailTransport);

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
