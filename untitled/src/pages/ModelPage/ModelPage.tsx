import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Model } from '../../types/Model'
import Footer from '../../components/common/Footer/Footer'
import ChatWidget from '../../components/common/ChatWidget/ChatWidget'
import './ModelPage.module.css'

const ModelPage = () => {
  const { id } = useParams<{ id: string }>()
  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [otherModels, setOtherModels] = useState<Model[]>([])
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set([0]))
  const [telegramSupport, setTelegramSupport] = useState('@OneNightSupport')

  useEffect(() => {
    // Загружаем Telegram из localStorage
    const savedTelegram = localStorage.getItem('telegram_support')
    if (savedTelegram) {
      setTelegramSupport(savedTelegram)
    }
  }, [])

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Загружаем стоковые модели
        const response = await fetch('/data/models.json')
        const stockModels = await response.json()
        
        // Загружаем пользовательские модели из localStorage
        const savedCustomModels = localStorage.getItem('custom_models')
        const customModels = savedCustomModels ? JSON.parse(savedCustomModels) : []
        
        // Объединяем все модели
        const allModels = [...stockModels, ...customModels]
        
        const foundModel = allModels.find((m: Model) => m.id === parseInt(id || '0'))
        setModel(foundModel || null)
        
        // Загружаем другие модели из того же города (до 4 штук)
        if (foundModel) {
          const sameCityModels = allModels
            .filter((m: Model) => m.id !== foundModel.id && m.location === foundModel.location)
            .slice(0, 4)
          setOtherModels(sameCityModels)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading model:', error)
        setError('Ошибка загрузки профиля. Попробуйте обновить страницу.')
        setLoading(false)
      }
    }

    loadModel()
  }, [id])

  // Preload adjacent images for smooth transitions
  useEffect(() => {
    if (model) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < model.photos.length && !preloadedImages.has(index)) {
          const img = new Image()
          img.src = model.photos[index]
          img.onload = () => {
            setPreloadedImages(prev => new Set([...prev, index]))
          }
        }
      }

      // Preload previous and next images
      preloadImage(selectedPhoto - 1)
      preloadImage(selectedPhoto + 1)
    }
  }, [model, selectedPhoto, preloadedImages])

  // Touch handlers for swipe with 60fps optimization
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !model) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    // Use requestAnimationFrame for smooth 60fps transitions
    requestAnimationFrame(() => {
      if (isLeftSwipe) {
        setSelectedPhoto(selectedPhoto < model.photos.length - 1 ? selectedPhoto + 1 : 0)
      }
      if (isRightSwipe) {
        setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : model.photos.length - 1)
      }
    })
  }

  // Обработчики кнопок
  const handleSendMessage = () => {
    setShowSendModal(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${model?.name}, ${model?.age} лет`,
          text: `Посмотрите профиль ${model?.name} на ONENIGHT`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Поделиться отменено')
      }
    } else {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Ссылка скопирована в буфер обмена!')
    }
  }

  const handleDownloadPhoto = () => {
    if (model && model.photos[selectedPhoto]) {
      const link = document.createElement('a')
      link.href = model.photos[selectedPhoto]
      link.download = `${model.name}_photo_${selectedPhoto + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }


  if (loading) {
    return (
      <div className="model-page">
        <div className="header-dark">
          <div className="header-dark-content">
            <Link to="/" className="logo-dark">
              <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              ONENIGHT
            </Link>
            <div className="header-actions-dark">
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <h2>Загрузка профиля...</h2>
            <p>Пожалуйста, подождите</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="model-page">
        <div className="header-dark">
          <div className="header-dark-content">
            <Link to="/" className="logo-dark">
              <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              ONENIGHT
            </Link>
            <div className="header-actions-dark">
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="error">
            <h2>Ошибка загрузки</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn">
              Попробовать снова
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!model) {
    return (
      <div className="model-page">
        <div className="header-dark">
          <div className="header-dark-content">
            <Link to="/" className="logo-dark">
              <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              ONENIGHT
            </Link>
            <div className="header-actions-dark">
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="not-found">
            <h2>Модель не найдена</h2>
            <Link to="/" className="btn">Вернуться на главную</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="model-page">
      {/* Dark Header */}
      <div className="header-dark">
        <div className="header-dark-content">
          <Link to="/" className="logo-dark">
            <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            ONENIGHT
          </Link>
          <div className="header-actions-dark">
            <Link to="/" className="header-search-btn">
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - Full Screen Photo */}
      <div className="model-hero-fullscreen">
        <div className="model-hero-photo-container">
          <div className="model-hero-image-wrapper">
            <img 
              src={model.photos[selectedPhoto]} 
              alt={`${model.name}, ${model.age} лет - фото ${selectedPhoto + 1} из ${model.photos.length}`}
              className="model-hero-main-photo"
              loading="lazy"
              onTouchStart={(e) => handleTouchStart(e)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
              role="img"
              aria-label={`Фотография ${model.name}`}
            />
          </div>
          
          {/* Navigation Arrows */}
          <button 
            className="model-hero-nav model-hero-nav-left"
            onClick={() => setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : model.photos.length - 1)}
            aria-label="Предыдущее фото"
            title="Предыдущее фото"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <button 
            className="model-hero-nav model-hero-nav-right"
            onClick={() => setSelectedPhoto(selectedPhoto < model.photos.length - 1 ? selectedPhoto + 1 : 0)}
            aria-label="Следующее фото"
            title="Следующее фото"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
          
          
          {/* Overlay Content */}
          <div className="model-hero-overlay">
            <h1 className="model-hero-name">{model.name}, {model.age} лет</h1>
            <p className="model-hero-location">{model.location}</p>
          </div>
          
          {/* Badges */}
          <div className="model-hero-badges">
            {model.newThisWeek && <span className="model-hero-badge new">NEW</span>}
            {model.vip && <span className="model-hero-badge vip">VIP</span>}
            {model.verified && <span className="model-hero-badge real">REAL PHOTOS</span>}
            {model.withVideo && (
              <span className="model-hero-badge video">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/>
                </svg>
              </span>
            )}
          </div>
        </div>

      </div>

{/* Stats Row - moved after photo section */}
<div className="model-hero-stats">
        <div className="model-hero-stat">
          <div className="model-hero-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div className="model-hero-stat-content">
            <div className="model-hero-stat-value">{model.views || 280}</div>
            <div className="model-hero-stat-label">Просмотров</div>
          </div>
        </div>
        <div className="model-hero-stat">
          <div className="model-hero-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          <div className="model-hero-stat-content">
            <div className="model-hero-stat-value">{model.addedDate || '12.09.2025'}</div>
            <div className="model-hero-stat-label">Опубликована</div>
          </div>
        </div>
        <div className="model-hero-stat">
          <div className="model-hero-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="model-hero-stat-content">
            <div className="model-hero-stat-value">17 часов назад</div>
            <div className="model-hero-stat-label">Была на сайте</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="model-actions-dark">
        <button className="model-action-btn-primary" onClick={handleSendMessage}>
          Отправить сообщение
        </button>
        <button className="model-action-btn-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Показать интерес
        </button>
        <div className="model-action-buttons">
          <button className="model-action-btn-small" onClick={handleShare}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16,6 12,2 8,6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span className="text">Поделиться</span>
          </button>
          <button className="model-action-btn-small">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="text">В избранное</span>
          </button>
          <button className="model-action-btn-small" onClick={handleDownloadPhoto}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1m4 0h1m-6 4h1m-6 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <span className="text">Скачать фото</span>
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="model-content-dark">
        {/* About Section */}
        <div className="model-section">
          <div className="model-about">
            <h2>О себе</h2>
            <p>
              Привет! Меня зовут {model.name} ❤️ 😉 😎 💚<br/>
              {model.description}<br/>
              Я очень общительная и веселая девушка, которая любит проводить время в хорошей компании. 
              Готова составить вам компанию на любом мероприятии - от романтического ужина до деловой встречи.
              Владею несколькими языками и имею хорошие манеры. Всегда слежу за своей внешностью и 
              поддерживаю себя в отличной форме. Готова к новым знакомствам и интересным встречам!
            </p>
            </div>
          </div>

            {/* Parameters Section */}
            <div className="model-section">
              <div className="model-details-table">
                <h2>Параметры</h2>
                <div className="model-details-row">
                  <div className="model-details-label">Возраст</div>
                  <div className="model-details-value">{model.age} год</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Рост</div>
                  <div className="model-details-value">{model.height} см</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Вес</div>
                  <div className="model-details-value">{model.weight} кг</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Размер груди</div>
                  <div className="model-details-value">{model.bust}</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Тип груди</div>
                  <div className="model-details-value">Натуральная</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Пропорции</div>
                  <div className="model-details-value">90-63-93</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Цвет волос</div>
                  <div className="model-details-value">{model.hair}</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Цвет глаз</div>
                  <div className="model-details-value">{model.eyes}</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Национальность</div>
                  <div className="model-details-value">{model.nationality}</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Разговорный язык</div>
                  <div className="model-details-value">{model.languages?.join(', ') || 'Русский'}</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Встречается с</div>
                  <div className="model-details-value">Мужчины, Женщины, Пары</div>
                </div>
                <div className="model-details-row">
                  <div className="model-details-label">Место встречи</div>
                  <div className="model-details-value">{model.meetingPlace || 'Выезд'}</div>
                </div>
              </div>
            </div>

            {/* Prices Section */}
            <div className="model-section">
              <div className="model-prices-table">
                <h2>Цены</h2>
                <div className="model-prices-header">
                  <div>Цены</div>
                  <div>У меня</div>
                  <div>Выезд</div>
                </div>
                <div className="model-prices-row">
                  <div className="model-prices-cell">1 час</div>
                  <div className="model-prices-cell">{model.prices?.apartment?.oneHour ? `${model.prices.apartment.oneHour} Р.` : 'X'}</div>
                  <div className="model-prices-price">{model.prices?.outcall?.oneHour ? `${model.prices.outcall.oneHour} Р.` : 'X'}</div>
                </div>
                <div className="model-prices-row">
                  <div className="model-prices-cell">2 часа</div>
                  <div className="model-prices-cell">{model.prices?.apartment?.twoHours ? `${model.prices.apartment.twoHours} Р.` : 'X'}</div>
                  <div className="model-prices-price">{model.prices?.outcall?.twoHours ? `${model.prices.outcall.twoHours} Р.` : 'X'}</div>
                </div>
                <div className="model-prices-row">
                  <div className="model-prices-cell">6 часов</div>
                  <div className="model-prices-cell">{model.prices?.apartment?.night ? `${model.prices.apartment.night} Р.` : 'X'}</div>
                  <div className="model-prices-price">{model.prices?.outcall?.night ? `${model.prices.outcall.night} Р.` : 'X'}</div>
                </div>
                {model.prices?.outcall?.anal && (
                  <div className="model-prices-row anal-service">
                    <div className="model-prices-cell">Анал</div>
                    <div className="model-prices-cell">-</div>
                    <div className="model-prices-price">+{model.prices.outcall.anal} Р.</div>
                  </div>
                )}
              </div>
            </div>

        

            {/* Detailed Services Section */}
            <div className="model-section">
              <div className="model-services-detailed">
                <h2>Услуги</h2>
                
                {/* Sex Services */}
                {model.detailedServices?.sex && model.detailedServices.sex.length > 0 && (
                  <div className="service-category">
                    <h3>Секс</h3>
                    <div className="service-list">
                      {model.detailedServices.sex.map((service, index) => (
                        <span key={index} className="service-item">{service}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Striptease Services */}
                {model.detailedServices?.striptease && model.detailedServices.striptease.length > 0 && (
                  <div className="service-category">
                    <h3>Стриптиз</h3>
                    <div className="service-list">
                      {model.detailedServices.striptease.map((service, index) => (
                        <span key={index} className="service-item">{service}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Massage Services */}
                {model.detailedServices?.massage && model.detailedServices.massage.length > 0 && (
                  <div className="service-category">
                    <h3>Массаж</h3>
                    <div className="service-list">
                      {model.detailedServices.massage.map((service, index) => (
                        <span key={index} className="service-item">{service}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Services */}
                <div className="service-category">
                  <h3>Дополнительно</h3>
                  <div className="service-list">
                    {model.detailedServices?.toys && <span className="service-item">Игрушки</span>}
                    {model.detailedServices?.sadoMaso && <span className="service-item">Садо-мазо</span>}
                    {model.detailedServices?.mistress && <span className="service-item">Госпожа</span>}
                    {model.detailedServices?.slave && <span className="service-item">Рабыня</span>}
                    {model.detailedServices?.games && <span className="service-item">Игры</span>}
                    {model.detailedServices?.lightDomination && <span className="service-item">Легкая доминация</span>}
                    {model.detailedServices?.roleplay && model.detailedServices.roleplay.length > 0 && (
                      <>
                        {model.detailedServices.roleplay.map((service, index) => (
                          <span key={index} className="service-item">{service}</span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="model-section">
              <div className="model-reviews">
                <h2>Отзывы</h2>
                <button className="model-review-btn">Оставить отзыв</button>
              </div>
            </div>
            </div>

      {/* Other Girls Section */}
      <div className="other-girls-section">
        <h2 className="other-girls-title">Другие девушки в {model.location}</h2>
        <div className="other-girls-grid">
          {/* Other Girls from same city */}
          {otherModels.map((otherModel) => (
            <Link key={otherModel.id} to={`/model/${otherModel.id}`} className="other-girl-card">
              <img 
                src={otherModel.photos[0]} 
                alt={`${otherModel.name}, ${otherModel.age} лет`}
                className="other-girl-image"
              />
              <div className="other-girl-badges">
                {otherModel.vip && <span className="other-girl-badge vip">VIP</span>}
                {otherModel.newThisWeek && <span className="other-girl-badge new">NEW</span>}
                {otherModel.verified && <span className="other-girl-badge real">REAL</span>}
                {otherModel.withVideo && (
                  <span className="other-girl-badge video">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/>
                    </svg>
                  </span>
                )}
              </div>
              <div className="other-girl-info">
                <div className="other-girl-name">{otherModel.name}, {otherModel.age} лет</div>
                <div className="other-girl-location">{otherModel.location}</div>
              </div>
              <svg className="other-girl-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>
          ))}
        </div>
        
        {otherModels.length > 0 && (
          <div className="other-girls-show-more">
            <Link to={`/?location=${model.location}`} className="other-girls-btn">
              Показать еще в {model.location}
            </Link>
          </div>
        )}
      </div>

        <Footer />
        <ChatWidget />
        
        {/* Send Message Modal */}
        {showSendModal && (
          <div className="send-modal-overlay" onClick={() => setShowSendModal(false)}>
            <div className="send-modal" onClick={(e) => e.stopPropagation()}>
              <div className="send-modal-header">
                <h3>Отправить сообщение</h3>
                <button 
                  className="send-modal-close"
                  onClick={() => setShowSendModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="send-modal-content">
                <p>Для связи с {model.name} перейдите к нашему сутинеру в Telegram:</p>
                <div className="send-modal-contact">
                  <div className="send-modal-telegram">{telegramSupport}</div>
                </div>
                <div className="send-modal-actions">
                  <button 
                    className="send-modal-btn-primary"
                    onClick={() => {
                      const username = telegramSupport.replace('@', '')
                      window.open(`https://t.me/${username}`, '_blank')
                    }}
                  >
                    Перейти в Telegram
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  export default ModelPage