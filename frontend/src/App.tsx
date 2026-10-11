import { useEffect, useState } from "react"

function App() {
  const [message, setMessage] = useState('loading...')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message)
      })
  }, [])

  return (
    <main>
      <h1>あきじかん</h1>
      <p>Backend: {message}</p>
    </main>
  )
}

export default App