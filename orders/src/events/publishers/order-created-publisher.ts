import { Publisher, OrderCreatedEvent, Subjects } from '@eyalhtickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
}
