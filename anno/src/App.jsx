import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      setMessage('')
      alert('Message sent successfully!')
    } catch (error) {
      alert('Error sending message')
    }
  }

  return (
        <div className="app-wrapper">
      
      <div className="msg-box">
        <form onSubmit={handleSubmit} className="form">
          <textarea
            className="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            required
          />
          <button type="submit" className="button">
            send..
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
