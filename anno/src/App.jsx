import { useState } from 'react'
import './App.css'

// Set API URL based on environment
const API_URL =
  import.meta.env.PROD
    ? 'https://anno-6dyc.onrender.com/api/messages'
    : 'http://localhost:5000/api/messages';

function App() {
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch(API_URL, {
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
