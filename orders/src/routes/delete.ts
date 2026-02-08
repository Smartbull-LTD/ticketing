import express, { Request, Response } from 'express'
import {
    requireAuth,
    NotAuthorizedError,
    NotFoundError,
} from '@eyalhtickets/common'
import { Order, OrderStatus } from '../models/order'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId)

        if (!order) {
            throw new NotFoundError()
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError()
        }

        order.status = OrderStatus.Cancelled
        await order.save()

        // publishing an event saying this order was cancelled will go here
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order._id.toString(),
            version: order.version,
            ticket: {
                id: order.ticket._id.toString(),
            },
        })

        res.status(204).send()
    }
)

export { router as deleteOrderRouter }
