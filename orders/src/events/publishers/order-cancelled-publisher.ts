import { OrderCancelledEvent, Publisher, Subjects } from '@eyalhtickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
}
