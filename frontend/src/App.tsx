import CreateEventPage from './components/CreateEventPage'
import EventPage from './components/EventPage'

function App() {
  const match =
    window.location.pathname.match(
      /^\/events\/([^/]+)$/
    )

  if (match != null) {
    const slug = match[1]

    return <EventPage slug={slug} />
  }

  return <CreateEventPage />
}

export default App