import { useEffect, useRef, useState } from 'react';

const OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');
  const conversationRef = useRef(null);

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    return () => {
      document.body.classList.remove('light', 'dark');
    };
  }, [theme]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const sendPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Please enter a prompt');
      return;
    }

    setError('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setPrompt('');

    try {
      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3:latest',
          messages: [...messages.map(m => ({ role: m.role, content: m.text })), { role: 'user', content: trimmed }],
          stream: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      const raw = data?.response ?? data?.choices?.[0]?.message?.content ?? data?.output?.[0]?.content?.[0]?.text ?? data;
      const formatted = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);

      setMessages((prev) => [...prev, { role: 'assistant', text: formatted }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendPrompt();
  };

  return (
    <main className={`app ${theme}`}>
      <div className="topbar">
        <h1>Ollama Web Client</h1>
        <button
          className="theme-switch"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 4.5V2m0 20v-2.5M4.5 12H2m20 0h-2.5M6.34 6.34l-1.77-1.77m14.86 14.86l-1.77-1.77M17.66 6.34l1.77-1.77M3.87 17.66l1.77-1.77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
      </div>

      <section className="conversation" ref={conversationRef}>
        <h2>Conversation</h2>
        {messages.length === 0 ? (
          <p className="note">No messages yet. Enter a prompt below to start the chat.</p>
        ) : (
          messages.map((msg, index) => (
            <article className={`message ${msg.role}`} key={`${msg.role}-${index}`}>
              <div className="message-role">{msg.role === 'user' ? 'You' : 'Ollama'}</div>
              <pre>{msg.text}</pre>
            </article>
          ))
        )}
      </section>

      {loading && (
        <section className="thinking" aria-live="polite">
          <div className="thinking-text">Thinking</div>
          <div className="dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      )}

      {error && (
        <section className="feedback error">
          <h2>Error</h2>
          <pre>{error}</pre>
        </section>
      )}

      <section className="control">
        <label htmlFor="prompt">Prompt</label>
        <form onSubmit={handleSubmit}>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt..."
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send to Ollama'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
