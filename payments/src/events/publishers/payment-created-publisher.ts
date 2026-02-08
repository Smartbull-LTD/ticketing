import { Publisher, PaymentCreatedEvent, Subjects } from '@eyalhtickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
}
