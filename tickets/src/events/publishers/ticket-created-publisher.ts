import { Publisher, Subjects, TicketCreatedEvent } from '@eyalhtickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
}
