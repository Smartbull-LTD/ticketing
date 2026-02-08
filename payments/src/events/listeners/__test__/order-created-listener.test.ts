import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedEvent, OrderStatus } from '@eyalhtickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // Create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: 'fakeDate',
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 100,
        },
    }

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, data, msg }
}

it('creates and saves an order', async () => {
    const { listener, data, msg } = await setup()

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Write assertions to make sure an order was created
    const order = await Order.findById(data.id)

    expect(order).toBeDefined()
    expect(order!.price).toEqual(data.ticket.price)
    expect(order!.status).toEqual(data.status)
    expect(order!.userId).toEqual(data.userId)
    expect(order!.version).toEqual(data.version)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})
