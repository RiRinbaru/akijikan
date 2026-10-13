import { useEffect, useState } from 'react'
import WeekCalendar from './WeekCalendar'
import type {
    ApiEventWindow,
    EventWindow,
} from '../types/calendar'

type EventResponse = {
    id: string
    slug: string
    title: string
    start_date: string
    end_date: string
    required_minutes: number | null
    timezone: string
    windows: ApiEventWindow[]
}

type Event = Omit<EventResponse, 'windows'> & {
    windows: EventWindow[]
}

type EventPageProps = {
    slug: string
}

function EventPage({ slug }: EventPageProps) {
    const [event, setEvent] = useState<Event | null>(null)

    useEffect(() => {
        fetch(`/api/events/${slug}`)
            .then((response) => response.json())
            .then((data: EventResponse) => {
                const convertedEvent: Event = {
                    ...data,
                    windows: data.windows.map((window) => ({
                        id: window.id,
                        startAt: new Date(window.start_at),
                        endAt: new Date(window.end_at),
                    })),
                }

                setEvent(convertedEvent)
            })
    }, [slug])

    if (event === null) {
        return <p>Loading...</p>
    }

    return (
        <main>
            <h1>{event.title}</h1>

            {event.required_minutes !== null && (
                <p>必要時間: {event.required_minutes}分</p>
            )}

            <WeekCalendar
                startDate={event.start_date}
                endDate={event.end_date}
                windows={event.windows}
            />
        </main>
    )
}

export default EventPage