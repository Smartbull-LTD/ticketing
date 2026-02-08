import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.getCookie())
        .send({
            title: 'some title',
            price: 20,
        })
        .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'some title',
            price: 20,
        })
        .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
    const createResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getCookie())
        .send({
            title: 'original title',
            price: 100,
        })
        .expect(201)

    await request(app)
        .put(`/api/tickets/${createResponse.body.id}`)
        .set('Cookie', global.getCookie()) // different user
        .send({
            title: 'new title',
            price: 200,
        })
        .expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.getCookie()

    const createResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'original title',
            price: 100,
        })
        .expect(201)

    await request(app)
        .put(`/api/tickets/${createResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 200,
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${createResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid title',
            price: -10,
        })
        .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.getCookie()

    const createResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'original title',
            price: 100,
        })
        .expect(201)

    const newTitle = 'updated title'
    const newPrice = 300

    const updateResponse = await request(app)
        .put(`/api/tickets/${createResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: newTitle,
            price: newPrice,
        })
        .expect(200)

    expect(updateResponse.body.title).toEqual(newTitle)
    expect(updateResponse.body.price).toEqual(newPrice)
})

it('publishes an event', async () => {
    const cookie = global.getCookie()

    const createResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'original title',
            price: 100,
        })
        .expect(201)

    const newTitle = 'updated title'
    const newPrice = 300

    await request(app)
        .put(`/api/tickets/${createResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: newTitle,
            price: newPrice,
        })
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.getCookie()

    // Create a ticket
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'original title',
            price: 100,
        })
        .expect(201)

    // Mark the ticket as reserved by setting an orderId
    const ticket = await Ticket.findById(response.body.id)
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    await ticket!.save()

    // Attempt to update the ticket
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 200,
        })
        .expect(400)
})
