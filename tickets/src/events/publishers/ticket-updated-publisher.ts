import { Publisher, Subjects, TicketUpdatedEvent } from '@eyalhtickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
}
