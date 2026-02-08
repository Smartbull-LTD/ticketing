import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

const createTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    })
    await ticket.save()
    return ticket
}

it('marks an order as cancelled', async () => {
    const ticket = await createTicket()
    const user = getCookie()

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket._id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(204)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('returns a 404 if the order does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', getCookie())
        .expect(404)
})

it('returns a 401 if the user does not own the order', async () => {
    const ticket = await createTicket()
    const userOne = getCookie()
    const userTwo = getCookie()

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket._id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .expect(401)
})

it('emits an order cancelled event', async () => {
    const ticket = await createTicket()
    const user = getCookie()

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket._id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(204)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
