# BeautyBook (BB) — Product Specification & Technical Architecture
**v1.1 | Stack: Nuxt 3 + Nuxt UI + Supabase + Clerk + Telegram Mini App**

---

## 1. Обзор проекта

**BeautyBook (BB)** — платформа для специалистов в сфере красоты (мастеров макияжа, тату, ногтей, ресниц и т.д.), позволяющая управлять клиентами и записями, вести онлайн-витрину и принимать бронирование через Telegram Mini App.

| Параметр | Значение |
|---|---|
| Целевая аудитория | Beauty-мастера (B2B) и их клиенты (B2C) |
| Основной канал | Web (Nuxt) + Telegram Mini App |
| Монетизация | Подписка мастеров + платное продвижение |
| MVP срок | 3–4 месяца |

---

## 2. Роли и пользователи

| Роль | Описание | Доступ |
|---|---|---|
| **Master** | Специалист, создаёт витрину и управляет записями | Личный кабинет + аналитика |
| **Client** | Конечный потребитель услуг | Поиск, бронирование, история |
| **Admin** | Модерация, управление платформой | Панель администратора |

---

## 3. Функциональные требования

### 3.1 Онбординг и авторизация

- Регистрация/логин через Clerk (email, Google, Apple)
- При первом входе — выбор роли: мастер или клиент
- Для Telegram Mini App — авторизация через Telegram initData + Clerk JWT
- Защищённые роуты через Nuxt middleware (useAuth)

### 3.2 Профиль мастера (витрина)

- Аватар, имя, специализация, описание, город
- Портфолио: загрузка фото работ (лимит зависит от тарифа)
- Список услуг: название, описание, цена, длительность
- График работы: рабочие дни и часы по каждому дню недели
- Кнопки быстрой связи: Telegram, WhatsApp, Instagram, звонок
- Рейтинг и отзывы клиентов (агрегированная оценка)
- Публичный URL: /master/[username]
- Счётчики: всего клиентов, записей, средний чек
- Акции: создание специальных предложений с датой истечения

### 3.3 Управление записями (мастер)

- Интерактивный календарь на базе Nuxt Calendar
- Создание / редактирование / отмена записей
- Блокировка времени (перерыв, личное время)
- Статусы: pending -> confirmed -> completed / cancelled
- История клиента: все прошлые визиты, предпочтения, заметки
- Автоматические напоминания за 24ч и 1ч до записи

### 3.4 Быстрый чекаут (завершение сеанса)

Функция для мастера — завершить сеанс в 2 клика без онлайн-оплаты:

- Кнопка «Завершить сеанс» на карточке текущей записи
- Открывается модальный экран (bottom sheet) с:
  - Итоговая сумма (предзаполнена ценой услуги, редактируемая)
  - Выбор способа оплаты из заранее созданного мастером списка
  - Опциональная заметка
- Мастер подтверждает — запись переходит в статус completed
- В историю клиента записывается: сумма, тип оплаты, дата

**Настройка методов оплаты (в настройках мастера):**
- Мастер создаёт свои методы: «Наличные», «Kaspi», «Перевод», «Карта» и т.д.
- Хранятся в таблице payment_methods как простой список строк
- Выбираются при чекауте из выпадающего списка

### 3.5 Telegram Mini App

- Точка входа: Telegram Bot с кнопкой Web App
- Клиент открывает витрину мастера прямо в Telegram
- Просмотр портфолио, услуг, цен, отзывов
- Онлайн-бронирование: выбор услуги -> дата -> слот -> подтверждение
- Push-уведомления через Bot API о подтверждении и изменениях
- Мастер получает уведомление о новой записи в Telegram

### 3.6 Поиск и каталог

- Поиск мастеров по категории (макияж, ногти, ресницы, тату...)
- Фильтры: город / район, рейтинг, цена, доступность
- Сортировка: по рейтингу, по популярности, по дате регистрации
- Карточка мастера в каталоге: фото, услуги, рейтинг, цены

### 3.7 Функции клиента

- Личный кабинет: история записей, предстоящие записи
- Отмена записи (до N часов — настраивается мастером)
- Оценка и отзыв после визита
- Подписка на мастера: получение акций и новостей
- Реферальная программа: бонусные баллы за приглашённых друзей

### 3.8 Аналитика (мастер)

- Источники записей: через мини-приложение vs оффлайн
- Самые популярные услуги за период
- Средний чек, динамика выручки (неделя / месяц / квартал)
- Разбивка по методам оплаты (наличные vs Kaspi vs карта...)
- Процент удержания клиентов (retention)
- Конверсия просмотров витрины в запись

---

## 4. Нефункциональные требования

| Параметр | Требование |
|---|---|
| Производительность | Страница витрины < 1.5s LCP (SSR/ISR) |
| Доступность | 99.5% uptime (Supabase + Vercel/Railway) |
| Безопасность | RLS на каждой таблице Supabase; JWT от Clerk |
| Масштабируемость | Горизонтальное масштабирование через Nuxt + Edge Functions |
| SEO | SSR-рендер витрин мастеров с мета-тегами |
| Локализация | ru (приоритет), en (будущее) |
| Мобайл | Adaptive Web + Telegram Mini App как нативный опыт |

---

## 5. Технологический стек

### 5.1 Frontend / Web

| Слой | Технология | Роль |
|---|---|---|
| Framework | Nuxt 3 | SSR/SSG, routing, middleware |
| UI Kit | Nuxt UI (TailwindCSS) | Компоненты, темизация |
| State | Pinia | Глобальный стейт |
| Auth client | Clerk (Vue SDK) | Сессии, useAuth, useUser |
| API client | useFetch / $fetch | Запросы к Supabase и internal API |
| Telegram SDK | @tma.js/sdk | Инициализация Mini App, initData |
| Forms | VeeValidate + Zod | Валидация форм |
| Calendar | Nuxt Calendar | Просмотр и управление расписанием |
| Charts | Chart.js (vue-chartjs) | Аналитика мастера |

### 5.2 Backend / BaaS

| Слой | Технология | Роль |
|---|---|---|
| Database | Supabase (PostgreSQL) | Основная БД, RLS, Realtime |
| Storage | Supabase Storage | Фото портфолио, аватары |
| Auth backend | Clerk | JWT-токены, webhooks |
| Edge Functions | Supabase Edge Functions (Deno) | Напоминания, бизнес-логика |
| Telegram Bot | grammY (Deno) | Bot API, команды, уведомления |
| Email | Resend | Транзакционные письма |
| Scheduled jobs | pg_cron (Supabase) | Напоминания, архивация записей |

### 5.3 Infrastructure

| Сервис | Где | Зачем |
|---|---|---|
| Nuxt app | Vercel / Railway | SSR + Edge middleware |
| Telegram Bot | Railway / Fly.io | Webhook listener, grammY |
| Supabase | Supabase Cloud | DB + Storage + Edge Functions |
| Clerk | Clerk Cloud | Auth, user management |
| CDN | Vercel Edge / Cloudflare | Статика и кеш |

---

## 6. Архитектура системы

### 6.1 Высокоуровневая схема

```
+----------------------------------------------------------+
|                     PRESENTATION                          |
|   Nuxt Web App (SSR)          Telegram Mini App (CSR)    |
+---------------------+--------------------+---------------+
                      | HTTPS              | HTTPS
+---------------------v--------------------v---------------+
|                     APPLICATION                           |
|   Nuxt server/api routes    grammY Bot    Edge Functions  |
|          Clerk JWT Validation    RLS enforcement          |
+---------------------+------------------------------------+
                      |
+---------------------v------------------------------------+
|                       DATA                               |
|         PostgreSQL (Supabase)    Supabase Storage        |
+----------------------------------------------------------+
```

### 6.2 Auth Flow (Clerk + Supabase)

1. Пользователь логинится через Clerk (Nuxt SDK)
2. Clerk возвращает JWT с sub (userId) и metadata (role)
3. Clerk webhook (user.created) создаёт запись в таблице profiles
4. Nuxt API routes получают userId из useAuth() — запросы в Supabase через service_role key
5. Supabase RLS проверяет auth.uid() === user_id для всех мутаций

### 6.3 Telegram Mini App Flow

1. Мастер настраивает бота: /start — получает Web App ссылку
2. Ссылка на витрину: https://t.me/bb_bot/app?startapp=master_{id}
3. Клиент открывает Mini App — Telegram передаёт initData
4. Nuxt API валидирует initData (HMAC-SHA256 с BOT_TOKEN)
5. Создаётся или находится аккаунт клиента, выдаётся сессия
6. Клиент бронирует — запись в БД; Bot API уведомляет мастера

### 6.4 Checkout Flow (завершение сеанса)

```
Мастер нажимает «Завершить сеанс»
        |
        v
Открывается bottom sheet:
  [Сумма: 2500 сом]       <- редактируемое поле
  [Способ оплаты: Kaspi]  <- из payment_methods мастера
  [Заметка: ...]          <- опционально
        |
        v
Мастер нажимает «Подтвердить»
        |
        v
PATCH /api/master/bookings/:id
  { status: completed, amount_paid: 2500, payment_method_id: uuid }
        |
        v
Запись обновляется, история клиента пополняется
```

---

## 7. Схема базы данных

### profiles
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | Clerk userId |
| role | enum(master,client,admin) | Роль пользователя |
| full_name | text | |
| username | text UNIQUE | Slug для /master/[username] |
| avatar_url | text | URL из Supabase Storage |
| telegram_id | bigint | Telegram user ID (nullable) |
| created_at | timestamptz | |

### master_profiles
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK FK -> profiles.id | |
| bio | text | Описание мастера |
| city | text | |
| specializations | text[] | ['nails','lashes','makeup',...] |
| contacts | jsonb | {telegram, whatsapp, instagram, phone} |
| work_hours | jsonb | {mon:{start:'09:00',end:'18:00'},...} |
| rating | numeric(3,2) | Агрегированный рейтинг |
| subscription_tier | enum(free,pro) | Тарифный план |
| subscription_ends_at | timestamptz | |

### payment_methods
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK -> profiles.id | |
| name | text | «Наличные», «Kaspi», «Карта»... |
| is_default | bool | Метод по умолчанию |
| sort_order | int | Порядок в списке |

### services
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK -> profiles.id | |
| name | text | Название услуги |
| description | text | |
| price | numeric(10,2) | |
| duration_minutes | int | Длительность в минутах |
| is_active | bool DEFAULT true | |

### bookings
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK -> profiles.id | |
| client_id | uuid FK -> profiles.id | |
| service_id | uuid FK -> services.id | |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| status | enum(pending,confirmed,completed,cancelled) | |
| source | enum(online,offline,telegram) | Источник записи |
| amount_paid | numeric(10,2) | Фактическая сумма (при чекауте) |
| payment_method_id | uuid FK -> payment_methods.id | Метод оплаты |
| notes | text | Заметки мастера |
| created_at | timestamptz | |

### portfolio_items
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK -> profiles.id | |
| image_url | text | Supabase Storage URL |
| caption | text | |
| service_tag | text | Категория работы |
| sort_order | int | |
| created_at | timestamptz | |

### reviews
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| booking_id | uuid FK -> bookings.id UNIQUE | Один отзыв на запись |
| master_id | uuid FK -> profiles.id | |
| client_id | uuid FK -> profiles.id | |
| rating | int CHECK(1-5) | |
| comment | text | |
| created_at | timestamptz | |

### promotions
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK -> profiles.id | |
| title | text | |
| description | text | |
| discount_percent | int | |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| is_active | bool | |

---

## 8. API Routes (Nuxt server/api)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | /api/masters | Список мастеров с фильтрами | Public |
| GET | /api/masters/[username] | Профиль мастера | Public |
| GET | /api/masters/[id]/slots | Свободные слоты | Public |
| POST | /api/masters/[id]/book | Создать бронирование | Client |
| GET | /api/me/profile | Свой профиль | Auth |
| PATCH | /api/me/profile | Обновить профиль | Auth |
| GET | /api/me/bookings | Мои записи (клиент) | Client |
| GET | /api/master/bookings | Записи мастера | Master |
| PATCH | /api/master/bookings/[id] | Изменить статус / чекаут | Master |
| GET | /api/master/services | Услуги мастера | Master |
| POST | /api/master/services | Создать услугу | Master |
| PATCH | /api/master/services/[id] | Обновить услугу | Master |
| GET | /api/master/payment-methods | Методы оплаты | Master |
| POST | /api/master/payment-methods | Создать метод оплаты | Master |
| DELETE | /api/master/payment-methods/[id] | Удалить метод | Master |
| GET | /api/master/analytics | Аналитика за период | Master |
| POST | /api/telegram/validate | Проверка initData (HMAC) | Internal |

---

## 9. Страницы и роуты Nuxt

| Путь | Страница | Тип рендера |
|---|---|---|
| / | Главная + поиск мастеров | SSR |
| /master/[username] | Публичная витрина мастера | SSR + ISR |
| /master/[username]/book | Форма бронирования | CSR |
| /dashboard | Кабинет мастера | Auth guard |
| /dashboard/calendar | Календарь записей (Nuxt Calendar) | CSR |
| /dashboard/clients | База клиентов | CSR |
| /dashboard/services | Управление услугами | CSR |
| /dashboard/portfolio | Загрузка портфолио | CSR |
| /dashboard/analytics | Аналитика | CSR |
| /dashboard/settings | Настройки + методы оплаты | CSR |
| /client/bookings | Мои записи (клиент) | Auth guard |
| /admin | Панель администратора | Admin guard |
| /tma | Точка входа Telegram Mini App | CSR, no layout |
| /tma/master/[id] | Витрина мастера в TMA | CSR |
| /tma/book/[masterId] | Бронирование в TMA | CSR |

---

## 10. Supabase RLS политики

| Таблица | Операция | Политика |
|---|---|---|
| profiles | SELECT | Публично (non-sensitive поля) |
| profiles | UPDATE | auth.uid() = id |
| master_profiles | SELECT | Публично |
| master_profiles | INSERT/UPDATE | auth.uid() = id |
| payment_methods | SELECT/INSERT/UPDATE/DELETE | auth.uid() = master_id |
| services | SELECT | Публично |
| services | INSERT/UPDATE/DELETE | auth.uid() = master_id |
| bookings | SELECT | auth.uid() = master_id OR auth.uid() = client_id |
| bookings | INSERT | auth.uid() = client_id |
| bookings | UPDATE | auth.uid() = master_id (статус, чекаут) |
| portfolio_items | SELECT | Публично |
| portfolio_items | INSERT/UPDATE/DELETE | auth.uid() = master_id |
| reviews | SELECT | Публично |
| reviews | INSERT | auth.uid() = client_id AND booking.status = completed |

---

## 11. Telegram Mini App — детали интеграции

### 11.1 Структура бота

- /start — приветствие + кнопка открытия Mini App
- /mybookings — список ближайших записей (клиент)
- /newbooking — глубокая ссылка на конкретного мастера
- Inline кнопки: подтвердить / отменить запись (мастер)

### 11.2 Валидация initData

1. Получаем initData из window.Telegram.WebApp.initData
2. На сервере: HMAC-SHA256(initData, SHA256(BOT_TOKEN))
3. Проверяем auth_date — не старше 24 часов
4. Создаём или находим пользователя, возвращаем short-lived JWT

### 11.3 Deep links

| Назначение | Ссылка |
|---|---|
| Открыть витрину мастера | https://t.me/bb_bot/app?startapp=master_{id} |
| Сразу на бронирование | https://t.me/bb_bot/app?startapp=book_{serviceId} |
| Акция мастера | https://t.me/bb_bot/app?startapp=promo_{promoId} |

---

## 12. Подписки и монетизация

| Тариф | Цена | Лимиты | Функции |
|---|---|---|---|
| Free | 0 сом/мес | 50 фото, 1 акция | Витрина, базовый календарь |
| Pro | 990 сом/мес | 300 фото, 10 акций | Telegram Mini App, аналитика, напоминания |

Дополнительные источники дохода:
- Платное размещение мастера в топе каталога (CPC/CPM)
- Реклама партнёрских брендов (косметика, инструменты)

---

## 13. MVP — что входит в первую версию

| Модуль | В MVP | Post-MVP |
|---|---|---|
| Регистрация / Clerk | Да | |
| Публичная витрина мастера | Да | |
| Каталог и поиск | Базовый (фильтр по категории) | Гео-поиск, карта |
| Управление услугами | Да | |
| Методы оплаты (настройка) | Да | |
| Календарь + бронирование (Nuxt Calendar) | Да | |
| Быстрый чекаут (завершение сеанса) | Да | |
| Telegram Mini App (витрина + бронь) | Да | |
| Bot уведомления | Да | |
| Напоминания клиентам | Email + Telegram | SMS |
| Портфолио | До 20 фото | 50/300 по тарифу |
| Отзывы и рейтинг | Да | |
| Аналитика мастера | Базовая (записи/выручка + методы оплаты) | Retention, когорты |
| Подписки Pro | Нет (ручной доступ) | Stripe/Kaspi интеграция |
| Акции | Нет | Post-MVP |
| Реферальная программа | Нет | Post-MVP |
| Синхронизация с Google Calendar | Нет | Post-MVP |

---

## 14. Дорожная карта MVP (12 недель)

| Этап | Недели | Задачи |
|---|---|---|
| 1. Фундамент | 1-2 | Clerk + Supabase, схема БД, Nuxt scaffold, базовые layout |
| 2. Мастер | 3-5 | Профиль, услуги, методы оплаты, загрузка портфолио |
| 3. Бронирование + чекаут | 6-7 | Nuxt Calendar, форма записи, статусы, быстрый чекаут |
| 4. Telegram | 8-9 | grammY бот, Mini App /tma/**, валидация initData, Bot уведомления |
| 5. Каталог + поиск | 10 | Страница поиска, фильтры, карточки мастеров |
| 6. Отзывы + аналитика | 11 | Система отзывов, графики аналитики (Chart.js) |
| 7. QA + Deploy | 12 | Тесты, Vercel deploy, Railway bot deploy, мягкий лонч |

---

## 15. Риски и митигация

| Риск | Вероятность | Митигация |
|---|---|---|
| Clerk + Supabase JWT несовместимость | Средняя | service_role в server routes, не пробрасывать Clerk JWT напрямую |
| Telegram initData replay attack | Низкая | Проверка auth_date < 24h, nonce |
| Overengineering на старте | Высокая | Жёсткое следование MVP scope, feature flags |
| Производительность Nuxt Calendar | Средняя | Пагинация по месяцам, индексы на starts_at + master_id |
| Сложность модерации контента | Средняя | Базовая пост-модерация, жалобы от пользователей |

---

## 16. Структура проекта

```
beautybook/
├── pages/
│   ├── index.vue                 # Главная / поиск
│   ├── master/[username].vue     # Витрина мастера
│   ├── dashboard/
│   │   ├── calendar.vue          # Nuxt Calendar
│   │   ├── clients.vue
│   │   ├── services.vue
│   │   ├── analytics.vue
│   │   └── settings.vue          # + методы оплаты
│   ├── client/bookings.vue
│   └── tma/
│       ├── index.vue
│       └── master/[id].vue
├── server/api/
│   ├── masters/
│   ├── master/
│   │   ├── bookings/[id].patch.ts  # Чекаут endpoint
│   │   ├── services/
│   │   ├── payment-methods/
│   │   └── analytics.get.ts
│   ├── me/
│   └── telegram/validate.post.ts
├── components/
│   ├── master/
│   ├── booking/
│   │   ├── BookingCalendar.vue   # Обёртка Nuxt Calendar
│   │   └── CheckoutModal.vue     # Быстрый чекаут
│   ├── portfolio/
│   └── ui/
├── composables/
│   ├── useBooking.ts
│   ├── useCheckout.ts
│   ├── useMaster.ts
│   └── useTelegramApp.ts
├── stores/
│   ├── booking.ts
│   └── master.ts
├── utils/
│   ├── telegram.ts               # initData validation
│   └── slots.ts                  # Slot generation
└── supabase/
    └── migrations/
```

---

*BeautyBook (BB) — Product Spec v1.1*
