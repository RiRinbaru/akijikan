import { useEffect, useState } from 'react'
import WeekCalendar from './components/WeekCalendar'

type EventWindow = {
  id: string
  start_at: string
  end_at: string
}

type Event = {
  id: string
  slug: string
  title: string
  start_date: string
  end_date: string
  required_minutes: number | null
  timezone: string
  windows: EventWindow[]
}

function App() {
  const [event, setEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetch('/api/events/c20ZkgvaakSIo_QE')
      .then((res) => res.json())
      .then((data) => {
        setEvent(data)
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
      />
    </main>
  )
}

export default App