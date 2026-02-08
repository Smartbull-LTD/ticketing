import { PaymentCreatedListener } from '../payment-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'
import mongoose from 'mongoose'
import { PaymentCreatedEvent } from '@eyalhtickets/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
    // create an instance of the listener
    const listener = new PaymentCreatedListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 99,
    })
    await ticket.save()

    // create and save an order
    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'asdf',
        expiresAt: new Date(),
        ticket,
    })
    await order.save()

    // create the fake data event
    const data: PaymentCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        orderId: order.id,
        stripeId: 'stripe12345',
        version: 0,
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, order, ticket, data, msg }
}

it('updates the order status to complete', async () => {
    const { listener, order, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Complete)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})
