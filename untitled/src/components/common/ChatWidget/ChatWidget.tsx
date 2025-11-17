import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeToSettings } from '../../../firebase/services'

const ChatWidget = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [telegramSupport, setTelegramSupport] = useState('@OneNightSupport')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      text: "Привет! Если есть вопросы, то пиши нашему сутинеру в Telegram",
      time: "14:30"
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Показываем чат сразу
    setIsVisible(true)
    
    // Подписываемся на изменения настроек в реальном времени
    const unsubscribe = subscribeToSettings((settings) => {
      setTelegramSupport(settings.telegramSupport || '@OneNightSupport')
    })

    // Отписка при размонтировании
    return () => unsubscribe()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      // Проверка на admin код
      if (newMessage.trim() === 'admin1236') {
        navigate('/admin')
        return
      }

      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages([...messages, userMessage])
      setNewMessage('')
      
      // Автоответ агента
      setTimeout(() => {
        const agentResponse = {
          id: messages.length + 2,
          type: 'agent',
          text: "Спасибо за сообщение! Наш сутинер свяжется с вами в Telegram для обсуждения деталей.",
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, agentResponse])
      }, 1000)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsOpen(false)
  }

  const handleSupportClick = () => {
    // Убираем @ если есть и открываем Telegram
    const username = telegramSupport.replace('@', '')
    window.open(`https://t.me/${username}`, '_blank')
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1002,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Fixed Button */}
      {!isOpen && !isMinimized && (
        <button 
          onClick={handleOpen}
          title="Открыть чат"
          style={{
            width: '60px',
            height: '60px',
            background: '#2c2c2c',
            border: '2px solid #ff6b9d',
            borderRadius: '50%',
            color: '#ff6b9d',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <button 
          onClick={handleOpen}
          title="Открыть чат"
          style={{
            width: '50px',
            height: '50px',
            background: '#2c2c2c',
            border: '2px solid #ff6b9d',
            borderRadius: '50%',
            color: '#ff6b9d',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>
      )}

      {/* Full Chat Widget */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: '#2c2c2c',
            borderBottom: '2px solid #ff6b9d',
            color: 'white',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '44px', height: '44px' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fb3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 2px 8px rgba(255, 107, 157, 0.3)'
                }}>
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: '24px', height: '24px' }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '14px',
                  height: '14px',
                  background: '#00ff00',
                  border: '2px solid #2c2c2c',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px rgba(0, 255, 0, 0.2)',
                  animation: 'pulse 2s infinite'
                }}></div>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>Поддержка</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Онлайн • Ответим быстро</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleSupportClick}
                title="Настройки"
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.3s ease'
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.95C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                </svg>
              </button>
              <button 
                onClick={handleClose}
                title="Закрыть"
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.3s ease'
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            background: '#f8f9fa',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((message) => (
              <div key={message.id} style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
              }}>
                {message.type === 'agent' && (
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fb3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 107, 157, 0.3)',
                    boxShadow: '0 2px 6px rgba(255, 107, 157, 0.2)'
                  }}>
                    <svg viewBox="0 0 24 24" fill="white" style={{ width: '18px', height: '18px' }}>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    background: message.type === 'agent' ? '#1a1a1a' : '#ff6b9d',
                    color: message.type === 'agent' ? 'white' : 'white',
                    boxShadow: message.type === 'agent' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(255, 107, 157, 0.3)',
                    borderBottomLeftRadius: message.type === 'agent' ? '4px' : '18px',
                    borderBottomRightRadius: message.type === 'user' ? '4px' : '18px'
                  }}>
                    <div style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '4px' }}>
                      {message.text}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      textAlign: message.type === 'user' ? 'left' : 'right'
                    }}>
                      {message.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            background: 'white',
            borderTop: '1px solid #eee',
            padding: '16px'
          }}>
            <form onSubmit={handleSendMessage} style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8f9fa',
                borderRadius: '25px',
                padding: '8px 16px',
                border: '1px solid #e0e0e0'
              }}>
                <button 
                  type="button" 
                  title="Голосовое сообщение"
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'transparent',
                    color: '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите ваше сообщение..."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#333',
                    padding: '8px 0'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid #ff6b9d',
                    background: newMessage.trim() ? '#ff6b9d' : '#2c2c2c',
                    color: newMessage.trim() ? 'white' : '#666',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleSupportClick}
                style={{
                  background: '#2c2c2c',
                  border: '2px solid #ff6b9d',
                  color: '#ff6b9d',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Перейти в Telegram
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget