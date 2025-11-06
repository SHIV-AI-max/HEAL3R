import { useState, useEffect } from 'react'
import './Messages.css'

function Messages() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
    // Fetch messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="messages-wrapper">
      <h2>Messages</h2>
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg._id} className="message-item">
            <p>{msg.message}</p>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Messages