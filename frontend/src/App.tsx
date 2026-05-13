import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading from backend...')

  useEffect(() => {
    fetch('http://localhost:3000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error(err)
        setMessage('Error: Could not connect to backend. Is it running?')
      })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h1>{message}</h1>
      <p>Frontend is running perfectly!</p>
    </div>
  )
}

export default App
