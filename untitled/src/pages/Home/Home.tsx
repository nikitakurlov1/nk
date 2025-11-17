import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Model } from '../../types/Model'
import Footer from '../../components/common/Footer/Footer'
import FilterModal from '../../components/filters/FilterModal/FilterModal'
import ModelCard from '../../components/model/ModelCard/ModelCard'
import ChatWidget from '../../components/common/ChatWidget/ChatWidget'
import './Home.module.css'

const Home = () => {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Загружаем стоковые модели
        const response = await fetch('/data/models.json')
        const stockData = await response.json()
        
        // Загружаем пользовательские модели из localStorage
        const savedCustomModels = localStorage.getItem('custom_models')
        const customData = savedCustomModels ? JSON.parse(savedCustomModels) : []
        
        // Объединяем стоковые и пользовательские модели
        const allModels = [...stockData, ...customData]
        
        setModels(allModels)
        setFilteredModels(allModels)
        setLoading(false)
      } catch (error) {
        console.error('Error loading models:', error)
        setLoading(false)
      }
    }

    loadModels()
  }, [])

  const handleFilterChange = (newFilters: any) => {
    let filtered = [...models]

    // Apply status filters
    if (newFilters.verified) {
      filtered = filtered.filter(model => model.verified)
    }
    if (newFilters.vip) {
      filtered = filtered.filter(model => model.vip)
    }
    if (newFilters.online) {
      filtered = filtered.filter(model => model.online)
    }
    if (newFilters.newThisWeek) {
      filtered = filtered.filter(model => model.newThisWeek)
    }
    if (newFilters.withVideo) {
      filtered = filtered.filter(model => model.withVideo)
    }

    // Apply parameter filters
    if (newFilters.heightFrom) {
      filtered = filtered.filter(model => model.height && model.height >= parseInt(newFilters.heightFrom))
    }
    if (newFilters.heightTo) {
      filtered = filtered.filter(model => model.height && model.height <= parseInt(newFilters.heightTo))
    }
    if (newFilters.ageFrom) {
      filtered = filtered.filter(model => model.age >= parseInt(newFilters.ageFrom))
    }
    if (newFilters.ageTo) {
      filtered = filtered.filter(model => model.age <= parseInt(newFilters.ageTo))
    }
    if (newFilters.weightFrom) {
      filtered = filtered.filter(model => model.weight && model.weight >= parseInt(newFilters.weightFrom))
    }
    if (newFilters.weightTo) {
      filtered = filtered.filter(model => model.weight && model.weight <= parseInt(newFilters.weightTo))
    }
    if (newFilters.bustFrom) {
      filtered = filtered.filter(model => model.bust && model.bust >= parseInt(newFilters.bustFrom))
    }
    if (newFilters.bustTo) {
      filtered = filtered.filter(model => model.bust && model.bust <= parseInt(newFilters.bustTo))
    }

    // Apply dropdown filters
    if (newFilters.nationality) {
      filtered = filtered.filter(model => model.nationality === newFilters.nationality)
    }
    if (newFilters.hair) {
      filtered = filtered.filter(model => model.hair === newFilters.hair)
    }
    if (newFilters.eyes) {
      filtered = filtered.filter(model => model.eyes === newFilters.eyes)
    }
    if (newFilters.language) {
      filtered = filtered.filter(model => model.languages.includes(newFilters.language))
    }

    // Apply location and price filters
    if (newFilters.location) {
      filtered = filtered.filter(model => model.location === newFilters.location)
    }
    if (newFilters.priceFrom) {
      filtered = filtered.filter(model => model.price >= parseInt(newFilters.priceFrom))
    }
    if (newFilters.priceTo) {
      filtered = filtered.filter(model => model.price <= parseInt(newFilters.priceTo))
    }
    if (newFilters.meetingPlace) {
      filtered = filtered.filter(model => model.meetingPlace === newFilters.meetingPlace)
    }

    // Apply services filters
    if (newFilters.services && newFilters.services.length > 0) {
      filtered = filtered.filter(model =>
        newFilters.services.every((service: string) => 
          model.services.includes(service)
        )
      )
    }

    setFilteredModels(filtered)
  }

  if (loading) {
    return (
      <div className="homepage">
        <div className="homepage-header">
          <div className="homepage-header-content">
            <Link to="/" className="homepage-logo">
              <svg className="homepage-logo-svg" viewBox="0 0 200 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.988 23.6c0-2.764.927-5.068 2.781-6.91 1.854-1.86 4.228-2.79 7.124-2.79 2.895 0 5.27.93 7.124 2.79 1.854 1.842 2.78 4.146 2.78 6.91 0 2.835-.926 5.2-2.78 7.096-1.854 1.895-4.229 2.843-7.124 2.843-2.896 0-5.27-.948-7.124-2.843-1.854-1.896-2.78-4.261-2.78-7.096zm4.794 0c0 1.63.476 2.985 1.43 4.066.97 1.08 2.198 1.621 3.68 1.621 1.484 0 2.702-.54 3.656-1.621.97-1.08 1.456-2.436 1.456-4.066 0-1.56-.486-2.853-1.457-3.88-.953-1.046-2.171-1.568-3.654-1.568s-2.71.522-3.681 1.568c-.954 1.027-1.43 2.32-1.43 3.88zm17.963 9.62V14.218h4.688l5.243 8.877c.212.372.45.832.715 1.382.265.531.477.974.636 1.329l.238.531h.053c-.141-1.364-.212-2.445-.212-3.242v-8.877h4.635V33.22H94.08l-5.27-8.85c-.212-.372-.45-.823-.715-1.355a55.985 55.985 0 01-.636-1.355l-.238-.532h-.053c.141 1.364.212 2.445.212 3.242v8.85h-4.635zm19.966 0V14.218h11.864v3.987h-7.23v3.455h5.773v3.986h-5.773v3.588h7.601v3.986h-12.235z" fill="url(#paint0_linear)"></path>
                <path d="M120.351 33.22V14.617h1.059l10.567 14.59 1.509 2.34h.053a25.902 25.902 0 01-.132-2.34v-14.59h1.138V33.22h-1.059l-10.567-14.59-1.509-2.339h-.053c.088.94.132 1.719.132 2.339v14.59h-1.138zm19.862 0V14.617h1.138V33.22h-1.138zm5.557-9.301c0-2.693.882-4.97 2.648-6.83 1.783-1.86 3.981-2.79 6.594-2.79 2.578 0 4.732.699 6.462 2.099l-.689.877c-.688-.567-1.562-1.02-2.621-1.356a9.895 9.895 0 00-3.152-.531c-2.313 0-4.237.815-5.773 2.445-1.518 1.63-2.278 3.658-2.278 6.086 0 2.427.742 4.456 2.225 6.086 1.501 1.63 3.39 2.445 5.667 2.445a7.739 7.739 0 003.469-.824 8.734 8.734 0 002.887-2.233v-3.587h-3.31v-1.063h4.449v8.477h-1.139V31.6l.027-.798h-.053c-.724.815-1.642 1.48-2.755 1.993a8.675 8.675 0 01-3.575.744c-2.577 0-4.74-.921-6.488-2.764-1.73-1.86-2.595-4.145-2.595-6.856zm21.21 9.301V14.617h1.139v8.744h11.758v-8.744h1.139V33.22h-1.139v-8.796h-11.758v8.796h-1.139zm24.262 0V15.68h-6.912v-1.063h14.963v1.063h-6.912v17.54h-1.139z" fill="currentColor"></path>
                <path d="M24.401 44.493a5.685 5.685 0 01-2.539-.602c-2.37-1.19-7-3.744-11.368-7.467-5.682-4.842-9.05-10.04-10.01-15.448-.746-4.201.319-8.49 2.921-11.768 2.41-3.035 5.826-4.808 9.617-4.993a13.39 13.39 0 0110.113 3.852c.459.45.881.929 1.266 1.43.385-.502.807-.98 1.265-1.43A13.39 13.39 0 0135.78 4.214c3.791.185 7.207 1.958 9.617 4.994 2.603 3.277 3.667 7.566 2.921 11.767-.96 5.408-4.328 10.606-10.009 15.448-4.368 3.722-8.997 6.276-11.368 7.466a5.681 5.681 0 01-2.54.603z" fill="url(#paint1_linear)"></path>
                <path d="M24.4 41.523a4.193 4.193 0 01-1.818-.417c-2.198-1.065-6.487-3.348-10.527-6.67-5.153-4.239-8.2-8.748-9.056-13.402a11.923 11.923 0 012.506-9.758c2.048-2.488 4.945-3.942 8.16-4.094.19-.01.383-.014.572-.014 3.024 0 5.879 1.13 8.038 3.178.388.368.751.764 1.08 1.178L24.4 12.84l1.047-1.317c.33-.414.692-.81 1.08-1.178 2.159-2.05 5.014-3.178 8.038-3.178.19 0 .382.005.572.014 3.215.152 6.112 1.606 8.16 4.094a11.925 11.925 0 012.505 9.758c-.855 4.654-3.902 9.163-9.055 13.402-4.04 3.323-8.33 5.605-10.526 6.67a4.2 4.2 0 01-1.821.417z" fill="url(#paint2_linear)"></path>
                <path d="M45.396 9.21a13.519 13.519 0 00-3.1-2.865c2.104 3.136 2.92 7.023 2.243 10.839-.96 5.408-4.328 10.606-10.01 15.448-4.367 3.722-8.997 6.276-11.368 7.467a5.687 5.687 0 01-2.54.602 5.687 5.687 0 01-2.539-.602c-2.37-1.191-7-3.745-11.368-7.467a46.7 46.7 0 01-.554-.48 39.726 39.726 0 004.333 4.272c4.367 3.723 8.997 6.276 11.368 7.467a5.684 5.684 0 002.54.602c.876 0 1.754-.208 2.539-.602 2.371-1.19 7-3.744 11.368-7.467 5.682-4.842 9.05-10.04 10.01-15.448.746-4.201-.32-8.49-2.922-11.767z" fill="url(#paint3_linear)"></path>
                <path d="M35.78 4.215a13.392 13.392 0 00-10.113 3.852c-.458.45-.88.929-1.266 1.43v34.995c.877 0 1.755-.208 2.54-.602 2.37-1.19 7-3.744 11.368-7.466 5.682-4.842 9.05-10.04 10.01-15.448.745-4.201-.319-8.49-2.922-11.767-2.41-3.035-5.826-4.809-9.617-4.994z" fill="url(#paint4_linear)"></path>
                <defs>
                  <linearGradient id="paint0_linear" x1="55.931" y1="43.036" x2="109.293" y2="15.712" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F83479"></stop>
                    <stop offset="1" stopColor="#FF819C"></stop>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="20.417" y1="13.982" x2="37.373" y2="35.078" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF819C"></stop>
                    <stop offset=".259" stopColor="#FF7E9A"></stop>
                    <stop offset=".476" stopColor="#FE7396"></stop>
                    <stop offset=".676" stopColor="#FC628E"></stop>
                    <stop offset=".867" stopColor="#FA4A83"></stop>
                    <stop offset="1" stopColor="#F83479"></stop>
                  </linearGradient>
                  <linearGradient id="paint2_linear" x1="29.491" y1="30.882" x2="-7.001" y2="-53.856" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" stopOpacity="0"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <linearGradient id="paint3_linear" x1="29.261" y1="29.604" x2="38.504" y2="56.547" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F82814" stopOpacity="0"></stop>
                    <stop offset="1" stopColor="#C0272D"></stop>
                  </linearGradient>
                  <linearGradient id="paint4_linear" x1="28.395" y1="20.142" x2="6.092" y2="-2.517" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F82814" stopOpacity="0"></stop>
                    <stop offset="1" stopColor="#C0272D"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </Link>
            <svg className="homepage-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>
        <div className="container">
          <div className="loading">
            <h2>Загрузка...</h2>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="homepage">
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
            <button className="header-search-btn" onClick={() => setIsFilterModalOpen(true)}>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="homepage-nav">
        <div className="homepage-nav-content">
          <div className="homepage-menu" onClick={() => setIsFilterModalOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="homepage-main">
          <h1 className="homepage-title">Женские объявления эскорта</h1>
          <p className="homepage-description">
            Наша платформа предлагает элегантных и профессиональных спутниц для любых мероприятий. 
            Все модели проходят тщательную проверку и верификацию, что гарантирует высочайшее качество сервиса.
          </p>
      </div>

      {/* Features Section */}
      <div className="homepage-features">
        <div className="homepage-features-content">
          {/* Stats Section */}
          <div className="features-stats">
            <div className="stat-card">
              <div className="stat-number">{models.length}+</div>
              <div className="stat-label">Моделей онлайн</div>
        </div>

            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Поддержка</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Проверенные</div>
            </div>
          </div>
          

          

          {/* Filter Button */}
          <div className="features-filter">
            <button 
              className="homepage-filter-btn"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Открыть фильтр
            </button>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="homepage-profiles">
        <div className="homepage-profiles-content">
          <div className="profiles-grid">
              {filteredModels.map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            
          </div>

          <div className="homepage-show-more">
            <button className="homepage-show-more-btn">Показать ещё</button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container">
        <div className="homepage-content">
          <div className="homepage-content-section">
            <h2>Забронировать эскорт в Москве</h2>
            <p>
              Наша платформа предлагает элегантных и профессиональных спутниц для любых мероприятий. 
              Все модели проходят тщательную проверку и верификацию, что гарантирует высочайшее качество сервиса.
              Мы работаем в крупнейших городах России: Москве, Санкт-Петербурге, Новосибирске, 
              Екатеринбурге, Казани и Нижнем Новгороде. Наши спутницы владеют несколькими языками 
              и имеют опыт работы на различных мероприятиях.
            </p>
              </div>

          <div className="homepage-content-section">
            <h2>Эскорт услуги в Москве с девушками и моделями</h2>
            <p>
              • Проверенные модели с подтвержденными документами<br/>
              • Полная конфиденциальность и безопасность<br/>
              • Профессиональный подход к каждому клиенту<br/>
              • Гибкая система оплаты и бронирования<br/>
              • Круглосуточная поддержка клиентов
            </p>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterChange}
      />

      <Footer />
        <ChatWidget />
    </div>
  )
}

export default Home