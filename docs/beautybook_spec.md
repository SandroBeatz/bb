# BeautyBook (BB) — Product Specification & Technical Architecture
**v2.0 | Stack: Nuxt 4 + Nuxt UI v3 + Supabase + Clerk + Telegram Mini App**

---

## 1. Обзор проекта

**BeautyBook (BB)** — SaaS-платформа для специалистов в сфере красоты (мастеров маникюра, тату, ресниц, макияжа и т.д.). Мастер получает персональный веб-дашборд и формирует ссылки для букинга, которые можно разместить в Instagram, Telegram и на любой другой площадке.

Клиенты **не регистрируются** на платформе — они записываются по ссылке мастера, указывая только номер телефона и имя.

| Параметр | Значение |
|---|---|
| Целевая аудитория | Beauty-мастера (B2B SaaS) |
| Клиенты мастеров | Запись без регистрации по ссылке |
| Основные каналы клиентов | Web-ссылка + Telegram Mini App + Instagram bio link |
| Монетизация | Подписка мастеров (Free / Pro) |

---

## 2. Роли и пользователи

| Роль | Описание | Доступ |
|---|---|---|
| **Master** | Специалист, создаёт витрину и управляет записями | Веб-дашборд + мобильное приложение (будущее) |
| **Client** | Конечный потребитель услуг | Только через ссылку мастера (без регистрации) |
| **Admin** | Модерация, управление платформой | Панель администратора |

> **Важно:** Клиент не имеет аккаунта на платформе. Уникальный ключ клиента — **номер телефона**. Данные клиента (имя, телефон) сохраняются в базу при первом бронировании и подтягиваются при повторных визитах.

---

## 3. Функциональные требования

### 3.1 Landing Page

Лендинг ориентирован **только на мастеров** (клиенты на лендинг не попадают):

**Шапка:**
- Лого BeautyBook
- Кнопка «Посмотреть демо»
- Кнопка «Войти / Зарегистрироваться»

**Основной контент:**
- Hero-секция: ценностное предложение для мастеров
- Как это работает (3-4 шага)
- Преимущества платформы
- Тарифы (Free vs Pro)
- CTA «Создать свой BeautyBook»

**Футер:**
- О сервисе
- Связаться с нами
- Смена языка (ru/ky)
- Смена темы (light/dark)

### 3.2 Авторизация и регистрация

- Регистрация/логин через Clerk (email, Google, Apple)
- Для Telegram Mini App — авторизация через Telegram initData
- Защищённые роуты через Nuxt middleware

### 3.3 Онбординг мастера

При регистрации роль `master` присваивается **автоматически** (выбор роли убран).

**5 экранов онбординга:**

1. **Название и slug** — Название бизнеса + уникальный username для URL (`beautybook.app/master/{slug}`)
2. **Логотип** — Загрузка аватара/лого (можно пропустить)
3. **Тип услуг** — Выбор специализаций (Маникюр, Коррекция ресниц, Тату и т.д.), можно выбрать несколько
4. **График работы** — Установка рабочих дней и часов по дням недели
5. **Подтверждение** — Сводка заполненных данных + кнопка «Создать свой BeautyBook»

После завершения → переход в дашборд мастера.

### 3.4 Дашборд мастера

**Навигация (sidebar / bottom nav):**
- Кабинет (главная)
- Календарь
- Услуги
- Портфолио
- Клиенты
- Аналитика
- Настройки

**Верхний правый угол:**
- User dropdown (аватар + имя)
- Ссылка «Моя страничка»

### 3.5 Страничка мастера (публичная — для клиентов)

Это то, что видит клиент по ссылке. **Mobile-first дизайн** (открывается только на телефонах).

**Структура сверху вниз:**
1. Обложка (cover image)
2. Аватар + название
3. График работы за сегодня (или «Выходной» если не работает)
4. Вкладки: **Запись** | **Услуги** | **Портфолио** | **Обо мне**

**Вкладка «Запись»:**
- Кнопка «Записаться» (основная, выделенная) — переход к форме букинга
- Кнопка «Отменить запись» — поиск записи по номеру телефона
- Кнопка «Написать в WhatsApp» — прямая ссылка на WhatsApp мастера

**Форма букинга (быстрый flow):**
1. Клиент вводит номер телефона → поиск в базе → если найден, подставляется имя
2. Если не найден — вводит имя
3. Выбор услуги
4. Выбор даты и свободного слота
5. Подтверждение

> В TMA: данные (имя, телефон если доступен) берутся из Telegram с согласия пользователя.

### 3.6 Управление записями (мастер)

- Интерактивный календарь на базе FullCalendar
- Создание / редактирование / отмена записей
- Блокировка времени (перерыв, личное время)
- Статусы: pending → confirmed → completed / cancelled
- История клиента: все прошлые визиты, заметки

### 3.7 Быстрый чекаут (завершение сеанса)

Функция для мастера — завершить сеанс в 2 клика:
- Кнопка «Завершить сеанс» на карточке записи
- Bottom sheet: сумма (предзаполнена), способ оплаты, заметка
- Подтверждение → статус completed → запись в историю клиента

### 3.8 Клиенты

- **Уникальный ключ клиента: номер телефона**
- Клиент сохраняется в базу при первом букинге
- При повторном букинге — поиск по номеру телефона, автоподстановка
- Мастер может: просмотреть список клиентов, редактировать данные, добавить заметки
- История визитов по каждому клиенту

### 3.9 Аналитика (мастер)

- Источники записей: онлайн (web/TMA) vs оффлайн
- Самые популярные услуги за период
- Средний чек, динамика выручки
- Разбивка по методам оплаты
- Процент удержания клиентов (Pro)

### 3.10 Настройки

Страница настроек мастера:
1. **Настройки профиля** — имя, slug, аватар, обложка, контакты
2. **Настройки календаря** — вид по умолчанию, длительность слота
3. **Настройки уведомлений** — email/telegram уведомления о новых записях
4. **Способы оплаты** — создание методов (Наличные, Kaspi, Карта и т.д.)
5. **Telegram Mini App** (Pro) — инструкция по созданию бота и привязке мини-аппа

### 3.11 Telegram Mini App

- Мастер (на Pro подписке) создаёт себе Telegram-бота по инструкции в настройках
- Получает ссылку: `https://t.me/{bot_username}/app`
- Клиенты открывают Mini App → видят ту же «Страничку мастера»
- Данные из Telegram (имя, username) подтягиваются автоматически
- После бронирования — уведомление мастеру через Bot API

---

## 4. Подписки и монетизация

| Тариф | Цена | Лимиты | Функции |
|---|---|---|---|
| **Free** | 0 сом/мес | До 30 записей в месяц | Дашборд, календарь, услуги, портфолио, клиенты, базовая аналитика |
| **Pro** | TBD сом/мес | Без ограничений | Все функции Free + улучшенная аналитика, напоминания клиентам, Telegram Mini App |

---

## 5. Нефункциональные требования

| Параметр | Требование |
|---|---|
| Производительность | Страничка мастера < 1.5s LCP (SSR) |
| Безопасность | RLS на каждой таблице Supabase; JWT от Clerk |
| SEO | SSR-рендер страничек мастеров с мета-тегами |
| Локализация | ru (приоритет), ky |
| Мобайл | Mobile-first для странички мастера; Adaptive для дашборда |

---

## 6. Технологический стек

### 6.1 Frontend / Web

| Слой | Технология |
|---|---|
| Framework | Nuxt 4 (SSR/SSG) |
| UI Kit | Nuxt UI v3 (Tailwind CSS v4) |
| State | Pinia |
| Auth client | Clerk (Vue SDK) |
| API client | useFetch / $fetch |
| Telegram SDK | @tma.js/sdk |
| Forms | VeeValidate + Zod |
| Calendar | FullCalendar (@fullcalendar/vue3) |
| Charts | Chart.js (vue-chartjs) |

### 6.2 Backend

| Слой | Технология |
|---|---|
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth backend | Clerk |
| Telegram Bot | grammY |
| Email | Resend |

---

## 7. Схема базы данных

### profiles
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | Clerk userId |
| role | text | master / admin |
| full_name | text | |
| username | text UNIQUE | Slug для URL |
| avatar_url | text | |
| telegram_id | bigint | |
| phone | text UNIQUE | |
| email | text | |
| created_at | timestamptz | |

### master_profiles
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK FK → profiles.id | |
| bio | text | Описание мастера |
| city | text | |
| specializations | text[] | ['nails','lashes','tattoo',...] |
| contacts | jsonb | {telegram, whatsapp, instagram, phone} |
| work_hours | jsonb | {mon:{start,end,off},...} |
| cover_url | text | Обложка для странички |
| rating | numeric(3,2) | |
| subscription_tier | text | free / pro |
| subscription_ends_at | timestamptz | |

### clients
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK → profiles.id | Мастер, к которому привязан |
| phone | text NOT NULL | Уникальный ключ (в связке с master_id) |
| name | text | Имя клиента |
| telegram_id | bigint | Если пришёл через TMA |
| telegram_username | text | |
| notes | text | Заметки мастера |
| created_at | timestamptz | |
| UNIQUE(master_id, phone) | | |

### services
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK → profiles.id | |
| name | text | |
| description | text | |
| price | numeric(10,2) | |
| duration_minutes | int | |
| is_active | bool DEFAULT true | |

### bookings
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK → profiles.id | |
| client_id | uuid FK → clients.id | |
| service_id | uuid FK → services.id | |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| status | text | pending/confirmed/completed/cancelled |
| source | text | online/offline/telegram |
| notes | text | |
| created_at | timestamptz | |

### payment_types
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK → profiles.id | |
| name | text | |
| is_active | bool | |
| sort_order | int | |

### payment_records
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| booking_id | uuid FK UNIQUE → bookings.id | |
| master_id | uuid FK | |
| payment_type_id | uuid FK → payment_types.id | |
| amount | numeric(10,2) | |
| recorded_at | timestamptz | |

### portfolio_items
| Колонка | Тип | Описание |
|---|---|---|
| id | uuid PK | |
| master_id | uuid FK → profiles.id | |
| image_url | text | |
| caption | text | |
| service_tag | text | |
| sort_order | int | |
| created_at | timestamptz | |

---

## 8. Страницы и роуты

### Публичные (без авторизации)

| Путь | Описание |
|---|---|
| `/` | Landing page (для мастеров) |
| `/about` | О сервисе |
| `/contact` | Связаться с нами |
| `/sign-in` | Авторизация (Clerk) |
| `/sign-up` | Регистрация (Clerk) |
| `/master/[username]` | Страничка мастера (SSR, mobile-first) |
| `/master/[username]/book` | Форма бронирования |
| `/master/[username]/cancel` | Отмена записи по номеру телефона |

### Дашборд мастера (middleware: auth)

| Путь | Описание |
|---|---|
| `/onboarding` | Онбординг (5 шагов) |
| `/dashboard` | Кабинет (KPI, сегодняшние записи) |
| `/dashboard/calendar` | Календарь (FullCalendar) |
| `/dashboard/services` | Управление услугами |
| `/dashboard/portfolio` | Портфолио |
| `/dashboard/clients` | Клиенты |
| `/dashboard/analytics` | Аналитика |
| `/dashboard/settings` | Настройки |

### Telegram Mini App

| Путь | Описание |
|---|---|
| `/tma` | Точка входа TMA |
| `/tma/master/[id]` | Страничка мастера в TMA |
| `/tma/book/[masterId]` | Бронирование в TMA |

### Администрирование

| Путь | Описание |
|---|---|
| `/admin` | Панель администратора |

---

## 9. API Routes

### Публичные (без авторизации)

| Метод | Путь | Описание |
|---|---|---|
| GET | /api/masters/[username] | Профиль мастера |
| GET | /api/masters/[username]/services | Услуги мастера |
| GET | /api/masters/[username]/portfolio | Портфолио |
| GET | /api/masters/[id]/slots | Свободные слоты |
| POST | /api/masters/[id]/book | Создать бронирование (без авторизации) |
| POST | /api/masters/[id]/cancel | Отменить запись по телефону |
| POST | /api/masters/[id]/lookup-client | Поиск клиента по телефону |

### Аутентифицированные (мастер)

| Метод | Путь | Описание |
|---|---|---|
| GET | /api/me/profile | Свой профиль |
| PATCH | /api/me/profile | Обновить профиль |
| POST | /api/me/avatar | Загрузка аватара |
| POST | /api/me/onboarding | Завершение онбординга |
| GET | /api/master/bookings | Записи (с фильтрами) |
| POST | /api/master/bookings | Создать запись |
| PATCH | /api/master/bookings/[id] | Обновить запись |
| POST | /api/master/bookings/[id]/checkout | Чекаут |
| GET | /api/master/clients | Список клиентов |
| POST | /api/master/clients | Добавить клиента |
| GET | /api/master/clients/[id] | Детали клиента |
| PATCH | /api/master/clients/[id] | Редактировать клиента |
| GET | /api/master/services | Услуги |
| POST | /api/master/services | Создать услугу |
| PATCH | /api/master/services/[id] | Обновить |
| DELETE | /api/master/services/[id] | Удалить |
| GET | /api/master/payment-types | Методы оплаты |
| POST | /api/master/payment-types | Создать |
| PATCH | /api/master/payment-types/[id] | Обновить |
| DELETE | /api/master/payment-types/[id] | Удалить |
| GET | /api/master/portfolio | Портфолио |
| POST | /api/master/portfolio | Добавить |
| PATCH | /api/master/portfolio/[id] | Обновить |
| DELETE | /api/master/portfolio/[id] | Удалить |
| GET | /api/master/analytics | Аналитика |
| POST | /api/telegram/validate | Валидация initData |

---

## 10. Что удалено по сравнению с v1

- ❌ Каталог и поиск мастеров (`/catalog`)
- ❌ Роль «клиент» с регистрацией и аккаунтом
- ❌ Клиентские страницы (`/client/*`)
- ❌ Система отзывов и рейтингов
- ❌ Промоакции
- ❌ Реферальная программа
- ❌ Публичный API списка мастеров (`GET /api/masters`)
- ❌ Выбор роли при онбординге

---

## 11. MVP Scope

| Модуль | В MVP | Post-MVP |
|---|---|---|
| Регистрация / Clerk | Да | |
| Онбординг мастера (5 шагов) | Да | |
| Дашборд мастера | Да | |
| Календарь + бронирование (FullCalendar) | Да | |
| Услуги CRUD | Да | |
| Портфолио | Да | |
| Клиенты (по номеру телефона) | Да | |
| Быстрый чекаут | Да | |
| Методы оплаты | Да | |
| Страничка мастера (mobile-first) | Да | |
| Базовая аналитика | Да | |
| Landing page (для мастеров) | Да | |
| Настройки мастера | Да | |
| Подписки Free/Pro | Логика лимитов | Оплата |
| Telegram Mini App | Да (Pro) | |
| Напоминания клиентам | Нет | Pro feature |
| Мобильное приложение | Нет | Post-MVP |
| Google Calendar sync | Нет | Post-MVP |
| SMS-уведомления | Нет | Post-MVP |

---

*BeautyBook (BB) — Product Spec v2.0*
