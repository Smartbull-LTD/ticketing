import { Listener, Subjects, OrderCreatedEvent } from '@eyalhtickets/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const {
            id,
            version,
            userId,
            status,
            ticket: { price },
        } = data

        const order = Order.build({
            id,
            version,
            userId,
            price,
            status,
        })

        await order.save()

        msg.ack()
    }
}
