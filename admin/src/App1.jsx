import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/messages");
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete message');
      }

      setMessages(messages.filter(msg => msg._id !== id));
      alert('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message: ' + error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-container">
      <nav className="navbar">
        <div className="nav-content">
          <span className="nav-brand">Dashboard</span>
        </div>
      </nav>
      
      <main className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <p className="empty">No messages yet.</p>
        ) : (
          <div className="messages-grid">
            {messages.map((msg) => (
              <div key={msg._id} className="message-card">
                <div className="message-content">{msg.message}</div>
                <div className="message-footer">
                  <span className="timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(msg._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
