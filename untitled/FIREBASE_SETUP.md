# Настройка Firebase для OneNight

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Добавить проект" (Add project)
3. Введите название проекта (например, "onenight-app")
4. Отключите Google Analytics (не обязательно для этого проекта)
5. Нажмите "Создать проект"

## Шаг 2: Регистрация веб-приложения

1. В консоли Firebase выберите ваш проект
2. Нажмите на иконку веб-приложения `</>`
3. Введите название приложения (например, "OneNight Web")
4. Нажмите "Зарегистрировать приложение"
5. Скопируйте конфигурацию Firebase (firebaseConfig)

## Шаг 3: Настройка Firestore Database

1. В боковом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите режим:
   - **Тестовый режим** (для разработки) - данные доступны всем на 30 дней
   - **Производственный режим** (для продакшена) - требует настройки правил безопасности
4. Выберите регион (например, europe-west1 для Европы)
5. Нажмите "Включить"

## Шаг 4: Настройка правил безопасности (важно!)

В разделе "Firestore Database" → "Правила" замените правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Модели - все могут читать, только админы могут писать
    match /models/{modelId} {
      allow read: if true;
      allow write: if request.auth != null; // Добавьте аутентификацию позже
    }
    
    // Заказы - все могут читать и писать (временно)
    match /orders/{orderId} {
      allow read, write: if true;
    }
    
    // Настройки - все могут читать, только админы могут писать
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null; // Добавьте аутентификацию позже
    }
  }
}
```

**ВАЖНО:** Эти правила открыты для всех. Для продакшена нужно добавить Firebase Authentication!

## Шаг 5: Обновление конфигурации в коде

Откройте файл `src/firebase/config.ts` и замените значения на свои:

```typescript
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_PROJECT_ID.firebaseapp.com",
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_PROJECT_ID.appspot.com",
  messagingSenderId: "ВАШ_MESSAGING_SENDER_ID",
  appId: "ВАШ_APP_ID"
}
```

Эти данные вы получили на Шаге 2.

## Шаг 6: Запуск приложения

```bash
npm run dev
```

Теперь все данные будут синхронизироваться через Firebase в реальном времени!

## Что изменилось?

✅ **Было:** localStorage (данные только на одном устройстве)  
✅ **Стало:** Firebase Firestore (данные синхронизируются между всеми пользователями)

### Преимущества:
- ✅ Данные доступны на всех устройствах
- ✅ Автоматическая синхронизация в реальном времени
- ✅ Надежное хранение данных
- ✅ Бесплатно до 50,000 операций чтения в день

## Следующие шаги (опционально)

### Добавить аутентификацию (рекомендуется для продакшена):

1. В Firebase Console → Authentication → "Начать"
2. Включите Email/Password или другой метод
3. Обновите правила безопасности Firestore
4. Добавьте логин/регистрацию в приложение

### Миграция существующих данных:

Если у вас уже есть данные в localStorage, их можно перенести в Firebase:

1. Откройте консоль браузера (F12)
2. Выполните:
```javascript
// Получить данные из localStorage
const customModels = JSON.parse(localStorage.getItem('custom_models') || '[]')
const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]')

console.log('Models:', customModels)
console.log('Orders:', orders)
```

3. Вручную добавьте эти данные через админ-панель

## Troubleshooting

### Ошибка: "Firebase: Error (auth/api-key-not-valid)"
- Проверьте правильность API ключа в `config.ts`

### Ошибка: "Missing or insufficient permissions"
- Проверьте правила безопасности в Firestore

### Данные не синхронизируются
- Проверьте подключение к интернету
- Откройте консоль браузера (F12) и проверьте ошибки
- Убедитесь, что Firestore Database включена

## Поддержка

Если возникли проблемы, проверьте:
1. Консоль браузера (F12) на наличие ошибок
2. Firebase Console → Firestore Database - видны ли данные?
3. Правила безопасности настроены правильно?
