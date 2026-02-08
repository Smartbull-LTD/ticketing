import { OrderCancelledEvent } from '@eyalhtickets/common'
import mongoose from 'mongoose'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    })

    await ticket.save()

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket._id.toString(),
        },
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, ticket, data, msg }
}

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('unsets the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup()
    // set orderId of the ticket
    ticket.set({ orderId: data.id })
    await ticket.save()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket._id)

    expect(updatedTicket!.orderId).toBeUndefined()
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup()
    // set orderId of the ticket
    ticket.set({ orderId: data.id })
    await ticket.save()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    )

    expect(ticketUpdatedData.orderId).toBeUndefined()
})
