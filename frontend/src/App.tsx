import { useEffect, useState } from 'react'
import WeekCalendar from './components/WeekCalendar'
import type {
  ApiEventWindow,
  EventWindow,
  DraftWindow,
} from './types/calendar'

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

function App() {
  const [event, setEvent] = useState<Event | null>(null)

  // 区間作成
  function handleWindowCreate(window: DraftWindow) {
    if (event === null) {
      return
    }

    const newWindow: EventWindow = {
      id: crypto.randomUUID(),
      startAt: window.startAt,
      endAt: window.endAt,
    }

    setEvent({
      ...event,
      windows: [
        ...event.windows,
        newWindow,
      ],
    })
  }

  // 区間消去
  function handleWindowDelete(id: string) {
    if (event === null) {
      return
    }

    setEvent({
      ...event,
      windows: event.windows.filter(
        (window) => window.id !== id
      ),
    })
  }


  useEffect(() => {
    fetch('/api/events/c20ZkgvaakSIo_QE')
      .then((res) => res.json())
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
  }, [])

  if (event === null) {
    return <p>Loading...</p>
  }

  return (
    <main>
      <h1>{event.title}</h1>

      <WeekCalendar
        startDate={event.start_date}
        endDate={event.end_date}
        windows={event.windows}
        onWindowCreate={handleWindowCreate}
        onWindowDelete={handleWindowDelete}
      />
    </main>
  )
}

export default App