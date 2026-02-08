import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

const createTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    })
    await ticket.save()
    return ticket
}

it('returns an order if the user owns it', async () => {
    const ticket = await createTicket()
    const user = getCookie()

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket._id })
        .expect(201)

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200)

    expect(fetchedOrder.id).toEqual(order.id)
    expect(fetchedOrder.ticket.id).toEqual(ticket._id.toString())
})

it('returns a 404 if the order does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .get(`/api/orders/${orderId}`)
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
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .expect(401)
})
