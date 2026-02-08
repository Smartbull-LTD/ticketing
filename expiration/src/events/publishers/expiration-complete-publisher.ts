import {
    Subjects,
    Publisher,
    ExpirationCompleteEvent,
} from '@eyalhtickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete
}
