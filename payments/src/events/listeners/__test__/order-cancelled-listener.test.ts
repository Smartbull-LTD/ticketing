import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledEvent, OrderStatus } from '@eyalhtickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    // Create and save a order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created,
    })
    await order.save()

    // Create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'fakeTicketId',
        },
    }

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, order, data, msg }
}

it('updates the order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup()

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Write assertions to make sure the order status was updated
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})
