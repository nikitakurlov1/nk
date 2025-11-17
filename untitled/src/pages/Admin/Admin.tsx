import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

interface Model {
  id: number
  name: string
  age: number
  location: string
  price: number
  verified: boolean
  vip: boolean
  online: boolean
  newThisWeek?: boolean
  photos: string[]
  height?: number
  weight?: number
  bust?: string
  hair?: string
  eyes?: string
  nationality?: string
  languages?: string[]
  description?: string
  meetingPlace?: string
  services?: string[]
  isStock?: boolean // Флаг для стоковых анкет
}

interface Order {
  id: number
  modelId: number
  modelName: string
  pimpTelegram: string
  date: string
  time: string
  duration: string
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  location: string
  notes?: string
  createdAt: string
}

const Admin = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'models' | 'orders' | 'settings'>('models')
  const [stockModels, setStockModels] = useState<Model[]>([]) // Стоковые анкеты
  const [customModels, setCustomModels] = useState<Model[]>([]) // Пользовательские анкеты
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [telegramSupport, setTelegramSupport] = useState('')

  // Объединенный список всех моделей
  const models = [...stockModels, ...customModels]

  useEffect(() => {
    loadModels()
    loadOrders()
    loadSettings()
  }, [])

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('admin_orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }

  const loadSettings = () => {
    const savedTelegram = localStorage.getItem('telegram_support')
    if (savedTelegram) {
      setTelegramSupport(savedTelegram)
    } else {
      setTelegramSupport('@OneNightSupport')
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem('telegram_support', telegramSupport)
    alert('Настройки сохранены!')
  }

  // Сохранение пользовательских моделей в localStorage
  useEffect(() => {
    if (customModels.length > 0) {
      localStorage.setItem('custom_models', JSON.stringify(customModels))
    } else {
      localStorage.removeItem('custom_models')
    }
  }, [customModels])

  // Сохранение заказов в localStorage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('admin_orders', JSON.stringify(orders))
    } else {
      localStorage.removeItem('admin_orders')
    }
  }, [orders])

  const loadModels = async () => {
    try {
      // Загружаем стоковые анкеты из файла
      const response = await fetch('/data/models.json')
      const stockData = await response.json()
      // Помечаем их как стоковые
      const markedStockData = stockData.map((model: Model) => ({ ...model, isStock: true }))
      setStockModels(markedStockData)
      
      // Загружаем пользовательские анкеты из localStorage
      const savedCustomModels = localStorage.getItem('custom_models')
      if (savedCustomModels) {
        setCustomModels(JSON.parse(savedCustomModels))
      }
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  const handleCellEdit = (modelId: number, field: keyof Model, value: any) => {
    // Проверяем, это стоковая или пользовательская модель
    const model = models.find(m => m.id === modelId)
    if (!model) return
    
    if (model.isStock) {
      // Стоковые модели нельзя редактировать
      alert('Стоковые анкеты нельзя редактировать. Создайте новую анкету.')
      return
    }
    
    // Редактируем только пользовательские модели
    setCustomModels(customModels.map(m => 
      m.id === modelId ? { ...m, [field]: value } : m
    ))
  }

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedRows.length === models.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(models.map(m => m.id))
    }
  }

  const handleDeleteSelected = () => {
    // Проверяем, есть ли стоковые модели в выборке
    const hasStockModels = selectedRows.some(id => {
      const model = models.find(m => m.id === id)
      return model?.isStock
    })
    
    if (hasStockModels) {
      alert('Нельзя удалять стоковые анкеты. Выберите только пользовательские.')
      return
    }
    
    if (window.confirm(`Удалить ${selectedRows.length} записей?`)) {
      setCustomModels(customModels.filter(m => !selectedRows.includes(m.id)))
      setSelectedRows([])
    }
  }

  const handleAddNew = () => {
    const newModel: Model = {
      id: Math.max(...models.map(m => m.id), 0) + 1,
      name: 'Новая модель',
      age: 18,
      location: 'Москва',
      price: 10000,
      verified: false,
      vip: false,
      online: false,
      photos: [],
      isStock: false // Новая модель - пользовательская
    }
    setCustomModels([newModel, ...customModels])
  }

  const handleAutoFill = () => {
    if (!editingModel) return

    const updated = { ...editingModel }

    // Автозаполнение имени
    if (!updated.name || updated.name === 'Новая модель') {
      const names = ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Виктория', 'Екатерина', 'Дарья', 'Алина', 'Кристина']
      updated.name = names[Math.floor(Math.random() * names.length)]
    }

    // Автозаполнение возраста
    if (!updated.age || updated.age === 18) {
      updated.age = Math.floor(Math.random() * 13) + 18 // 18-30
    }

    // Автозаполнение роста
    if (!updated.height) {
      updated.height = Math.floor(Math.random() * 21) + 160 // 160-180
    }

    // Автозаполнение веса пропорционально росту
    if (!updated.weight && updated.height) {
      // Формула: идеальный вес = рост - 110 (±5 кг)
      const idealWeight = updated.height - 110
      updated.weight = idealWeight + Math.floor(Math.random() * 11) - 5 // ±5 кг
    }

    // Автозаполнение груди пропорционально весу
    if (!updated.bust && updated.weight) {
      if (updated.weight < 50) {
        updated.bust = ['1', '1.5', '2'][Math.floor(Math.random() * 3)]
      } else if (updated.weight < 60) {
        updated.bust = ['2', '2.5', '3'][Math.floor(Math.random() * 3)]
      } else {
        updated.bust = ['3', '3.5', '4'][Math.floor(Math.random() * 3)]
      }
    }

    // Автозаполнение цвета волос
    if (!updated.hair) {
      const hairColors = ['Блондинка', 'Брюнетка', 'Шатенка', 'Рыжая']
      updated.hair = hairColors[Math.floor(Math.random() * hairColors.length)]
    }

    // Автозаполнение цвета глаз
    if (!updated.eyes) {
      const eyeColors = ['Голубые', 'Зеленые', 'Карие', 'Серые']
      updated.eyes = eyeColors[Math.floor(Math.random() * eyeColors.length)]
    }

    // Автозаполнение национальности
    if (!updated.nationality) {
      const nationalities = ['Русская', 'Украинка', 'Белоруска', 'Казашка', 'Армянка']
      updated.nationality = nationalities[Math.floor(Math.random() * nationalities.length)]
    }

    // Автозаполнение языков
    if (!updated.languages || updated.languages.length === 0) {
      updated.languages = ['Русский']
      if (Math.random() > 0.5) {
        updated.languages.push('English')
      }
    }

    // Автозаполнение города
    if (!updated.location || updated.location === 'Москва') {
      const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород']
      updated.location = cities[Math.floor(Math.random() * cities.length)]
    }

    // Автозаполнение цены пропорционально параметрам
    if (!updated.price || updated.price === 10000) {
      let basePrice = 8000
      if (updated.vip) basePrice += 5000
      if (updated.verified) basePrice += 2000
      if (updated.bust && parseFloat(updated.bust) >= 3) basePrice += 2000
      updated.price = basePrice + Math.floor(Math.random() * 5) * 1000 // округление до тысяч
    }

    // Автозаполнение места встречи
    if (!updated.meetingPlace) {
      const places = ['Выезд', 'У себя', 'Выезд и у себя']
      updated.meetingPlace = places[Math.floor(Math.random() * places.length)]
    }

    // Автозаполнение описания
    if (!updated.description) {
      updated.description = `Привет! Меня зовут ${updated.name}. Я ${updated.age}-летняя ${updated.nationality?.toLowerCase()} с ${updated.hair?.toLowerCase()} волосами и ${updated.eyes?.toLowerCase()} глазами. Мой рост ${updated.height} см, вес ${updated.weight} кг. Я очень общительная и веселая девушка, которая любит проводить время в хорошей компании. Готова составить вам компанию на любом мероприятии.`
    }

    // Автозаполнение услуг
    if (!updated.services || updated.services.length === 0) {
      updated.services = [
        'Классический секс',
        'Минет без презерватива',
        'Минет в презервативе',
        'Куннилингус',
        'Поцелуи',
        'Массаж расслабляющий',
        'Стриптиз'
      ]
    }

    setEditingModel(updated)
  }

  const handleAddOrder = () => {
    const newOrder: Order = {
      id: Math.max(...orders.map(o => o.id), 0) + 1,
      modelId: 0,
      modelName: '',
      pimpTelegram: '',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      duration: '1 час',
      price: 0,
      status: 'pending',
      location: 'Москва',
      createdAt: new Date().toISOString()
    }
    setEditingOrder(newOrder)
    setShowOrderModal(true)
  }

  const handleSaveOrder = () => {
    if (!editingOrder) return
    
    const existingOrder = orders.find(o => o.id === editingOrder.id)
    
    if (existingOrder) {
      // Обновление существующего заказа
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o))
    } else {
      // Добавление нового заказа - генерируем новый ID
      const newOrder = {
        ...editingOrder,
        id: Math.max(...orders.map(o => o.id), 0) + 1,
        createdAt: new Date().toISOString()
      }
      setOrders([newOrder, ...orders])
    }
    
    setShowOrderModal(false)
    setEditingOrder(null)
  }

  const handleDeleteOrder = (id: number) => {
    if (window.confirm('Удалить заказ?')) {
      setOrders(orders.filter(o => o.id !== id))
    }
  }

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>OneNight Admin Panel</h1>
          <div className="admin-breadcrumb">
            Главная / {activeTab === 'models' ? 'Модели' : activeTab === 'orders' ? 'Заказы' : 'Настройки'}
          </div>
        </div>
        <div className="admin-header-right">
          <button className="admin-btn-icon" title="Уведомления">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
          </button>
          <button className="admin-btn-icon" title="Профиль">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </button>
          <button className="admin-btn-secondary" onClick={() => navigate('/')}>
            Выйти
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          Модели ({models.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Заказы
        </button>
        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Настройки
        </button>
      </div>

      {/* Toolbar */}
      {activeTab === 'models' && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <button className="admin-btn-primary" onClick={handleAddNew}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Добавить
            </button>
            <button 
              className="admin-btn-danger" 
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Удалить ({selectedRows.length})
            </button>
            <button className="admin-btn-secondary">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Обновить
            </button>
            <button className="admin-btn-secondary">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
              </svg>
              Экспорт
            </button>
          </div>
          <div className="admin-toolbar-right">
            <div className="admin-search">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input 
                type="text" 
                placeholder="Поиск по имени или городу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'models' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.length === models.length && models.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Тип</th>
                  <th>Фото</th>
                  <th>Имя</th>
                  <th>Возраст</th>
                  <th>Город</th>
                  <th>Цена</th>
                  <th>Рост</th>
                  <th>Вес</th>
                  <th>Грудь</th>
                  <th>Волосы</th>
                  <th>Глаза</th>
                  <th>Национальность</th>
                  <th>Языки</th>
                  <th>Verified</th>
                  <th>VIP</th>
                  <th>Online</th>
                  <th>Новая</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr 
                    key={model.id}
                    className={selectedRows.includes(model.id) ? 'selected' : ''}
                  >
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(model.id)}
                        onChange={() => handleSelectRow(model.id)}
                        disabled={model.isStock}
                      />
                    </td>
                    <td>{model.id}</td>
                    <td>
                      {model.isStock ? (
                        <span className="admin-badge admin-badge-stock">Сток</span>
                      ) : (
                        <span className="admin-badge admin-badge-custom">Своя</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-photo">
                        {model.photos[0] ? (
                          <img src={model.photos[0]} alt={model.name} />
                        ) : (
                          <div className="admin-photo-placeholder">?</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.name}
                        onChange={(e) => handleCellEdit(model.id, 'name', e.target.value)}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={model.age}
                        onChange={(e) => handleCellEdit(model.id, 'age', parseInt(e.target.value))}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.location}
                        onChange={(e) => handleCellEdit(model.id, 'location', e.target.value)}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={model.price}
                        onChange={(e) => handleCellEdit(model.id, 'price', parseInt(e.target.value))}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={model.height || ''}
                        onChange={(e) => handleCellEdit(model.id, 'height', parseInt(e.target.value))}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={model.weight || ''}
                        onChange={(e) => handleCellEdit(model.id, 'weight', parseInt(e.target.value))}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.bust || ''}
                        onChange={(e) => handleCellEdit(model.id, 'bust', e.target.value)}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.hair || ''}
                        onChange={(e) => handleCellEdit(model.id, 'hair', e.target.value)}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.eyes || ''}
                        onChange={(e) => handleCellEdit(model.id, 'eyes', e.target.value)}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.nationality || ''}
                        onChange={(e) => handleCellEdit(model.id, 'nationality', e.target.value)}
                        className="admin-cell-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={model.languages?.join(', ') || ''}
                        onChange={(e) => handleCellEdit(model.id, 'languages', e.target.value.split(',').map(l => l.trim()))}
                        className="admin-cell-input"
                        placeholder="Русский, English"
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={model.verified}
                        onChange={(e) => handleCellEdit(model.id, 'verified', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={model.vip}
                        onChange={(e) => handleCellEdit(model.id, 'vip', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={model.online}
                        onChange={(e) => handleCellEdit(model.id, 'online', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={model.newThisWeek || false}
                        onChange={(e) => handleCellEdit(model.id, 'newThisWeek', e.target.checked)}
                      />
                    </td>
                    <td>
                      <div className="admin-actions">
                        {!model.isStock ? (
                          <>
                            <button 
                              className="admin-btn-icon-small" 
                              title="Редактировать"
                              onClick={() => setEditingModel(model)}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>
                            <button 
                              className="admin-btn-icon-small" 
                              title="Удалить"
                              onClick={() => {
                                if (window.confirm(`Удалить модель ${model.name}?`)) {
                                  setCustomModels(customModels.filter(m => m.id !== model.id))
                                }
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="admin-text-muted" title="Стоковые анкеты нельзя редактировать">
                            Только просмотр
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && !showStats && (
          <>
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <button className="admin-btn-primary" onClick={handleAddOrder}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Новый заказ
                </button>
                <button className="admin-btn-secondary" onClick={() => setShowStats(true)}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  Статистика
                </button>
              </div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Модель</th>
                    <th>Telegram сутенера</th>
                    <th>Длительность</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                        Нет заказов. Создайте первый заказ.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.date).toLocaleDateString('ru-RU')}</td>
                        <td>{order.time}</td>
                        <td>{order.modelName}</td>
                        <td>{order.pimpTelegram}</td>
                        <td>{order.duration}</td>
                        <td>{order.price} ₽</td>
                        <td>
                          <span className={`admin-status admin-status-${order.status}`}>
                            {order.status === 'pending' && 'Ожидает'}
                            {order.status === 'confirmed' && 'Подтвержден'}
                            {order.status === 'completed' && 'Завершен'}
                            {order.status === 'cancelled' && 'Отменен'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button 
                              className="admin-btn-icon-small" 
                              title="Редактировать"
                              onClick={() => {
                                setEditingOrder(order)
                                setShowOrderModal(true)
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>
                            <button 
                              className="admin-btn-icon-small" 
                              title="Удалить"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'orders' && showStats && (
          <div className="admin-stats">
            <div className="admin-stats-header">
              <h2>Статистика заказов</h2>
              <button className="admin-btn-secondary" onClick={() => setShowStats(false)}>
                Назад к заказам
              </button>
            </div>
            
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#e3f2fd' }}>
                  <svg viewBox="0 0 24 24" fill="#1976d2">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{orders.length}</div>
                  <div className="admin-stat-label">Всего заказов</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#fff3e0' }}>
                  <svg viewBox="0 0 24 24" fill="#f57c00">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{orders.filter(o => o.status === 'completed').length}</div>
                  <div className="admin-stat-label">Завершено</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#e8f5e9' }}>
                  <svg viewBox="0 0 24 24" fill="#388e3c">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{orders.reduce((sum, o) => sum + o.price, 0).toLocaleString()} ₽</div>
                  <div className="admin-stat-label">Общая сумма</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#fce4ec' }}>
                  <svg viewBox="0 0 24 24" fill="#c2185b">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{new Set(orders.map(o => o.modelId)).size}</div>
                  <div className="admin-stat-label">Активных моделей</div>
                </div>
              </div>
            </div>

            <div className="admin-stats-section">
              <h3>Статусы заказов</h3>
              <div className="admin-stats-bars">
                <div className="admin-stat-bar">
                  <div className="admin-stat-bar-label">Ожидают</div>
                  <div className="admin-stat-bar-track">
                    <div 
                      className="admin-stat-bar-fill" 
                      style={{ 
                        width: `${orders.length ? (orders.filter(o => o.status === 'pending').length / orders.length * 100) : 0}%`,
                        background: '#ffa726'
                      }}
                    ></div>
                  </div>
                  <div className="admin-stat-bar-value">{orders.filter(o => o.status === 'pending').length}</div>
                </div>
                <div className="admin-stat-bar">
                  <div className="admin-stat-bar-label">Подтверждены</div>
                  <div className="admin-stat-bar-track">
                    <div 
                      className="admin-stat-bar-fill" 
                      style={{ 
                        width: `${orders.length ? (orders.filter(o => o.status === 'confirmed').length / orders.length * 100) : 0}%`,
                        background: '#42a5f5'
                      }}
                    ></div>
                  </div>
                  <div className="admin-stat-bar-value">{orders.filter(o => o.status === 'confirmed').length}</div>
                </div>
                <div className="admin-stat-bar">
                  <div className="admin-stat-bar-label">Завершены</div>
                  <div className="admin-stat-bar-track">
                    <div 
                      className="admin-stat-bar-fill" 
                      style={{ 
                        width: `${orders.length ? (orders.filter(o => o.status === 'completed').length / orders.length * 100) : 0}%`,
                        background: '#66bb6a'
                      }}
                    ></div>
                  </div>
                  <div className="admin-stat-bar-value">{orders.filter(o => o.status === 'completed').length}</div>
                </div>
                <div className="admin-stat-bar">
                  <div className="admin-stat-bar-label">Отменены</div>
                  <div className="admin-stat-bar-track">
                    <div 
                      className="admin-stat-bar-fill" 
                      style={{ 
                        width: `${orders.length ? (orders.filter(o => o.status === 'cancelled').length / orders.length * 100) : 0}%`,
                        background: '#ef5350'
                      }}
                    ></div>
                  </div>
                  <div className="admin-stat-bar-value">{orders.filter(o => o.status === 'cancelled').length}</div>
                </div>
              </div>
            </div>

            <div className="admin-stats-section">
              <h3>Топ моделей по заказам</h3>
              <div className="admin-stats-table">
                {Object.entries(
                  orders.reduce((acc, order) => {
                    acc[order.modelName] = (acc[order.modelName] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([modelName, count], index) => (
                    <div key={modelName} className="admin-stats-row">
                      <div className="admin-stats-rank">#{index + 1}</div>
                      <div className="admin-stats-name">{modelName}</div>
                      <div className="admin-stats-count">{count} заказов</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-settings">
            <div className="admin-settings-section">
              <h2>Контакты поддержки</h2>
              <div className="admin-settings-group">
                <label>Telegram поддержки</label>
                <input 
                  type="text" 
                  value={telegramSupport}
                  onChange={(e) => setTelegramSupport(e.target.value)}
                  placeholder="@OneNightSupport"
                />
                <small style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                  Этот Telegram будет отображаться на сайте и в чате поддержки
                </small>
              </div>
            </div>

            <div className="admin-settings-actions">
              <button className="admin-btn-primary" onClick={handleSaveSettings}>
                Сохранить изменения
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="admin-footer">
        <div className="admin-footer-left">
          © 2024 OneNight Admin Panel. Все права защищены.
        </div>
        <div className="admin-footer-right">
          Версия 1.0.0 | Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </div>
      </div>

      {/* Edit Model Modal */}
      {editingModel && (
        <div className="admin-modal-overlay" onClick={() => setEditingModel(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>Редактирование анкеты: {editingModel.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  className="admin-btn-autofill" 
                  onClick={handleAutoFill}
                  title="Автоматически заполнить пустые поля"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
                  </svg>
                  Автозаполнение
                </button>
                <button className="admin-modal-close" onClick={() => setEditingModel(null)}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="admin-modal-content">
              <div className="admin-modal-grid">
                {/* Основная информация */}
                <div className="admin-modal-section">
                  <h3>Основная информация</h3>
                  <div className="admin-form-group">
                    <label>Имя</label>
                    <input 
                      type="text" 
                      value={editingModel.name}
                      onChange={(e) => setEditingModel({...editingModel, name: e.target.value})}
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Возраст</label>
                      <input 
                        type="number" 
                        value={editingModel.age}
                        onChange={(e) => setEditingModel({...editingModel, age: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Город</label>
                      <input 
                        type="text" 
                        value={editingModel.location}
                        onChange={(e) => setEditingModel({...editingModel, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Цена (₽/час)</label>
                    <input 
                      type="number" 
                      value={editingModel.price}
                      onChange={(e) => setEditingModel({...editingModel, price: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Место встречи</label>
                    <select 
                      value={editingModel.meetingPlace || 'Выезд'}
                      onChange={(e) => setEditingModel({...editingModel, meetingPlace: e.target.value})}
                    >
                      <option value="Выезд">Выезд</option>
                      <option value="У себя">У себя</option>
                      <option value="Выезд и у себя">Выезд и у себя</option>
                    </select>
                  </div>
                </div>

                {/* Внешность */}
                <div className="admin-modal-section">
                  <h3>Внешность</h3>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Рост (см)</label>
                      <input 
                        type="number" 
                        value={editingModel.height || ''}
                        onChange={(e) => setEditingModel({...editingModel, height: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Вес (кг)</label>
                      <input 
                        type="number" 
                        value={editingModel.weight || ''}
                        onChange={(e) => setEditingModel({...editingModel, weight: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Размер груди</label>
                    <input 
                      type="text" 
                      value={editingModel.bust || ''}
                      onChange={(e) => setEditingModel({...editingModel, bust: e.target.value})}
                      placeholder="2"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Цвет волос</label>
                    <select 
                      value={editingModel.hair || ''}
                      onChange={(e) => setEditingModel({...editingModel, hair: e.target.value})}
                    >
                      <option value="">Выберите</option>
                      <option value="Блондинка">Блондинка</option>
                      <option value="Брюнетка">Брюнетка</option>
                      <option value="Шатенка">Шатенка</option>
                      <option value="Рыжая">Рыжая</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Цвет глаз</label>
                    <select 
                      value={editingModel.eyes || ''}
                      onChange={(e) => setEditingModel({...editingModel, eyes: e.target.value})}
                    >
                      <option value="">Выберите</option>
                      <option value="Голубые">Голубые</option>
                      <option value="Зеленые">Зеленые</option>
                      <option value="Карие">Карие</option>
                      <option value="Серые">Серые</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Национальность</label>
                    <input 
                      type="text" 
                      value={editingModel.nationality || ''}
                      onChange={(e) => setEditingModel({...editingModel, nationality: e.target.value})}
                      placeholder="Русская"
                    />
                  </div>
                </div>

                {/* Дополнительно */}
                <div className="admin-modal-section admin-modal-section-full">
                  <h3>Дополнительная информация</h3>
                  <div className="admin-form-group">
                    <label>Языки (через запятую)</label>
                    <input 
                      type="text" 
                      value={editingModel.languages?.join(', ') || ''}
                      onChange={(e) => setEditingModel({...editingModel, languages: e.target.value.split(',').map(l => l.trim())})}
                      placeholder="Русский, English"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Описание</label>
                    <textarea 
                      rows={4}
                      value={editingModel.description || ''}
                      onChange={(e) => setEditingModel({...editingModel, description: e.target.value})}
                      placeholder="Расскажите о модели..."
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Услуги (через запятую)</label>
                    <textarea 
                      rows={3}
                      value={editingModel.services?.join(', ') || ''}
                      onChange={(e) => setEditingModel({...editingModel, services: e.target.value.split(',').map(s => s.trim())})}
                      placeholder="Классический секс, Минет, Куннилингус..."
                    />
                  </div>
                </div>

                {/* Статусы */}
                <div className="admin-modal-section admin-modal-section-full">
                  <h3>Статусы</h3>
                  <div className="admin-form-checkboxes">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={editingModel.verified}
                        onChange={(e) => setEditingModel({...editingModel, verified: e.target.checked})}
                      />
                      Верифицирована
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={editingModel.vip}
                        onChange={(e) => setEditingModel({...editingModel, vip: e.target.checked})}
                      />
                      VIP
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={editingModel.online}
                        onChange={(e) => setEditingModel({...editingModel, online: e.target.checked})}
                      />
                      Онлайн
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={editingModel.newThisWeek || false}
                        onChange={(e) => setEditingModel({...editingModel, newThisWeek: e.target.checked})}
                      />
                      Новая на этой неделе
                    </label>
                  </div>
                </div>

                {/* Фотографии */}
                <div className="admin-modal-section admin-modal-section-full">
                  <h3>Фотографии</h3>
                  <div className="admin-form-group">
                    <label>Добавить фото по URL</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="https://example.com/photo.jpg"
                        id="photoUrlInput"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            const url = input.value.trim()
                            if (url) {
                              setEditingModel({
                                ...editingModel,
                                photos: [...editingModel.photos, url]
                              })
                              input.value = ''
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => {
                          const input = document.getElementById('photoUrlInput') as HTMLInputElement
                          const url = input.value.trim()
                          if (url) {
                            setEditingModel({
                              ...editingModel,
                              photos: [...editingModel.photos, url]
                            })
                            input.value = ''
                          }
                        }}
                      >
                        Добавить
                      </button>
                    </div>
                  </div>
                  <div className="admin-photos-grid">
                    {editingModel.photos.map((photo, index) => (
                      <div key={index} className="admin-photo-item">
                        <img src={photo} alt={`Фото ${index + 1}`} />
                        <button 
                          className="admin-photo-remove"
                          onClick={() => {
                            const newPhotos = editingModel.photos.filter((_, i) => i !== index)
                            setEditingModel({...editingModel, photos: newPhotos})
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <label className="admin-photo-add">
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const files = e.target.files
                          if (files) {
                            Array.from(files).forEach(file => {
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setEditingModel({
                                    ...editingModel,
                                    photos: [...editingModel.photos, event.target.result as string]
                                  })
                                }
                              }
                              reader.readAsDataURL(file)
                            })
                          }
                          e.target.value = ''
                        }}
                      />
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <span>Добавить фото</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setEditingModel(null)}>
                Отмена
              </button>
              <button 
                className="admin-btn-primary"
                onClick={() => {
                  // Сохраняем только пользовательские модели
                  setCustomModels(customModels.map(m => m.id === editingModel.id ? editingModel : m))
                  setEditingModel(null)
                }}
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && editingOrder && (
        <div className="admin-modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="admin-modal-header">
              <h2>{editingOrder.id && orders.find(o => o.id === editingOrder.id) ? 'Редактирование заказа' : 'Новый заказ'}</h2>
              <button className="admin-modal-close" onClick={() => setShowOrderModal(false)}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="admin-modal-content">
              <div className="admin-modal-grid">
                <div className="admin-modal-section">
                  <h3>Информация о заказе</h3>
                  <div className="admin-form-group">
                    <label>Модель</label>
                    <select 
                      value={editingOrder.modelId}
                      onChange={(e) => {
                        const modelId = parseInt(e.target.value)
                        const model = models.find(m => m.id === modelId)
                        setEditingOrder({
                          ...editingOrder, 
                          modelId,
                          modelName: model?.name || '',
                          price: model?.price || 0
                        })
                      }}
                    >
                      <option value={0}>Выберите модель</option>
                      {models.map(model => (
                        <option key={model.id} value={model.id}>{model.name} - {model.location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Дата</label>
                      <input 
                        type="date" 
                        value={editingOrder.date}
                        onChange={(e) => setEditingOrder({...editingOrder, date: e.target.value})}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Время</label>
                      <input 
                        type="time" 
                        value={editingOrder.time}
                        onChange={(e) => setEditingOrder({...editingOrder, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Telegram сутенера</label>
                    <input 
                      type="text" 
                      value={editingOrder.pimpTelegram}
                      onChange={(e) => setEditingOrder({...editingOrder, pimpTelegram: e.target.value})}
                      placeholder="@username"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Длительность</label>
                    <select 
                      value={editingOrder.duration}
                      onChange={(e) => setEditingOrder({...editingOrder, duration: e.target.value})}
                    >
                      <option value="1 час">1 час</option>
                      <option value="2 часа">2 часа</option>
                      <option value="3 часа">3 часа</option>
                      <option value="Ночь">Ночь</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Место встречи</label>
                    <input 
                      type="text" 
                      value={editingOrder.location}
                      onChange={(e) => setEditingOrder({...editingOrder, location: e.target.value})}
                      placeholder="Москва, отель..."
                    />
                  </div>
                </div>

                <div className="admin-modal-section">
                  <h3>Детали заказа</h3>
                  <div className="admin-form-group">
                    <label>Цена (₽)</label>
                    <input 
                      type="number" 
                      value={editingOrder.price}
                      onChange={(e) => setEditingOrder({...editingOrder, price: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Статус</label>
                    <select 
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value as Order['status']})}
                    >
                      <option value="pending">Ожидает</option>
                      <option value="confirmed">Подтвержден</option>
                      <option value="completed">Завершен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </div>
                </div>

                <div className="admin-modal-section admin-modal-section-full">
                  <h3>Примечания</h3>
                  <div className="admin-form-group">
                    <textarea 
                      rows={3}
                      value={editingOrder.notes || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                      placeholder="Дополнительная информация о заказе..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowOrderModal(false)}>
                Отмена
              </button>
              <button 
                className="admin-btn-primary"
                onClick={handleSaveOrder}
                disabled={!editingOrder.modelId || !editingOrder.pimpTelegram?.trim()}
              >
                Сохранить заказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
