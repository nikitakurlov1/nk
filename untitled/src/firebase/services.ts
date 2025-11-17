import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { db } from './config'

export interface Model {
  id?: string
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
  isStock?: boolean
  createdAt?: any
}

export interface Order {
  id?: string
  modelId: string
  modelName: string
  pimpTelegram: string
  date: string
  time: string
  duration: string
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  location: string
  notes?: string
  createdAt?: any
}

// ============ МОДЕЛИ ============

// Получить все модели
export const getModels = async (): Promise<Model[]> => {
  const modelsCol = collection(db, 'models')
  const modelsSnapshot = await getDocs(query(modelsCol, orderBy('createdAt', 'desc')))
  return modelsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Model))
}

// Подписка на изменения моделей (реал-тайм)
export const subscribeToModels = (callback: (models: Model[]) => void) => {
  const modelsCol = collection(db, 'models')
  return onSnapshot(query(modelsCol, orderBy('createdAt', 'desc')), (snapshot) => {
    const models = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Model))
    callback(models)
  })
}

// Добавить модель
export const addModel = async (model: Omit<Model, 'id'>): Promise<string> => {
  const modelsCol = collection(db, 'models')
  const docRef = await addDoc(modelsCol, {
    ...model,
    createdAt: Timestamp.now()
  })
  return docRef.id
}

// Обновить модель
export const updateModel = async (id: string, model: Partial<Model>): Promise<void> => {
  const modelDoc = doc(db, 'models', id)
  await updateDoc(modelDoc, model)
}

// Удалить модель
export const deleteModel = async (id: string): Promise<void> => {
  const modelDoc = doc(db, 'models', id)
  await deleteDoc(modelDoc)
}

// Удалить несколько моделей
export const deleteModels = async (ids: string[]): Promise<void> => {
  const promises = ids.map(id => deleteModel(id))
  await Promise.all(promises)
}

// ============ ЗАКАЗЫ ============

// Получить все заказы
export const getOrders = async (): Promise<Order[]> => {
  const ordersCol = collection(db, 'orders')
  const ordersSnapshot = await getDocs(query(ordersCol, orderBy('createdAt', 'desc')))
  return ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order))
}

// Подписка на изменения заказов (реал-тайм)
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersCol = collection(db, 'orders')
  return onSnapshot(query(ordersCol, orderBy('createdAt', 'desc')), (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order))
    callback(orders)
  })
}

// Добавить заказ
export const addOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  const ordersCol = collection(db, 'orders')
  const docRef = await addDoc(ordersCol, {
    ...order,
    createdAt: Timestamp.now()
  })
  return docRef.id
}

// Обновить заказ
export const updateOrder = async (id: string, order: Partial<Order>): Promise<void> => {
  const orderDoc = doc(db, 'orders', id)
  await updateDoc(orderDoc, order)
}

// Удалить заказ
export const deleteOrder = async (id: string): Promise<void> => {
  const orderDoc = doc(db, 'orders', id)
  await deleteDoc(orderDoc)
}

// ============ НАСТРОЙКИ ============

export interface Settings {
  id?: string
  telegramSupport: string
  updatedAt?: any
}

// Получить настройки
export const getSettings = async (): Promise<Settings> => {
  const settingsCol = collection(db, 'settings')
  const settingsSnapshot = await getDocs(settingsCol)
  if (settingsSnapshot.empty) {
    // Создаем настройки по умолчанию
    const defaultSettings = {
      telegramSupport: '@OneNightSupport',
      updatedAt: Timestamp.now()
    }
    const docRef = await addDoc(settingsCol, defaultSettings)
    return { id: docRef.id, ...defaultSettings }
  }
  const settingsDoc = settingsSnapshot.docs[0]
  return { id: settingsDoc.id, ...settingsDoc.data() } as Settings
}

// Подписка на изменения настроек (реал-тайм)
export const subscribeToSettings = (callback: (settings: Settings) => void) => {
  const settingsCol = collection(db, 'settings')
  return onSnapshot(settingsCol, async (snapshot) => {
    if (snapshot.empty) {
      // Создаем настройки по умолчанию
      const defaultSettings = {
        telegramSupport: '@OneNightSupport',
        updatedAt: Timestamp.now()
      }
      const docRef = await addDoc(settingsCol, defaultSettings)
      callback({ id: docRef.id, ...defaultSettings })
    } else {
      const settingsDoc = snapshot.docs[0]
      callback({ id: settingsDoc.id, ...settingsDoc.data() } as Settings)
    }
  })
}

// Сохранить настройки
export const saveSettings = async (settings: Partial<Settings>): Promise<void> => {
  const settingsCol = collection(db, 'settings')
  const settingsSnapshot = await getDocs(settingsCol)
  
  const dataToSave = {
    ...settings,
    updatedAt: Timestamp.now()
  }
  
  if (settingsSnapshot.empty) {
    await addDoc(settingsCol, dataToSave)
  } else {
    const settingsDoc = doc(db, 'settings', settingsSnapshot.docs[0].id)
    await updateDoc(settingsDoc, dataToSave)
  }
}
