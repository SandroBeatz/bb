# GitHub Issues — BeautyBook v2.0 Migration

> Каждая задача готова для создания через `gh issue create`. После установки `gh` — запустить скрипт `docs/create_issues.sh`.

---

## Issue #1: [Phase 0] Миграция БД: таблица clients и обновление схемы
**Labels:** `database`, `phase-0`, `breaking-change`
**Milestone:** v2.0

### Описание
Создать новую таблицу `clients` для хранения клиентов мастера (без регистрации на платформе). Уникальный ключ — связка `(master_id, phone)`.

### Задачи
- [ ] Создать миграцию `009_clients_table.sql`:
  - Таблица `clients` (id uuid, master_id FK, phone text, name text, telegram_id bigint, telegram_username text, notes text, created_at)
  - UNIQUE(master_id, phone)
  - Индекс на (master_id, phone)
- [ ] Добавить `cover_url text` в `master_profiles`
- [ ] Мигрировать данные из `master_clients` → `clients` (backfill скрипт)
- [ ] Обновить `bookings.client_id` FK → `clients.id` (или добавить новый FK)
- [ ] Обновить `app/types/database.types.ts`
- [ ] Пометить таблицу `reviews` как deprecated (не удалять данные)

### Зависимости
Нет (стартовая задача)

### Acceptance Criteria
- Таблица `clients` создана и работает
- Существующие клиенты перенесены
- `database.types.ts` обновлен

---

## Issue #2: [Phase 0] Удалить клиентские страницы, каталог и отзывы
**Labels:** `cleanup`, `phase-0`, `breaking-change`
**Milestone:** v2.0

### Описание
Убрать всё, что связано с ролью «клиент» на платформе: каталог мастеров, клиентские страницы, систему отзывов.

### Задачи
- [ ] Удалить страницы:
  - `app/pages/catalog/index.vue`
  - `app/pages/client/index.vue`
  - `app/pages/client/bookings.vue`
  - `app/pages/client/masters.vue`
  - `app/pages/client/settings.vue`
- [ ] Удалить middleware:
  - `app/middleware/client-only.ts`
  - `app/middleware/master-redirect.global.ts`
- [ ] Удалить API routes:
  - `server/api/masters/index.get.ts` (список всех мастеров)
  - `server/api/masters/top.get.ts`
  - `server/api/reviews.post.ts`
  - `server/api/masters/[username]/reviews.get.ts`
  - `server/api/me/masters.get.ts`
  - `server/api/me/bookings.get.ts`
  - `server/api/me/bookings/[id]/cancel.patch.ts`
- [ ] Удалить компоненты:
  - `app/components/reviews/ReviewModal.vue`
- [ ] Обновить `auth.ts` middleware — убрать роутинг клиентов
- [ ] Обновить i18n файлы — удалить неиспользуемые ключи
- [ ] Убрать ссылки на каталог из навигации

### Зависимости
Нет (можно параллельно с #1)

### Acceptance Criteria
- Все клиентские и каталожные страницы удалены
- Нет broken imports/references
- `bun run check` проходит

---

## Issue #3: [Phase 1] Переделать онбординг — 5-шаговый stepper для мастера
**Labels:** `feature`, `phase-1`, `onboarding`
**Milestone:** v2.0

### Описание
Онбординг теперь только для мастеров — роль `master` присваивается автоматически. 5 шагов вместо выбора роли.

### Задачи
- [ ] Переделать `app/pages/onboarding.vue` — stepper UI (UStepper или кастомный):
  1. **Название + slug**: бизнес-имя + username с live-проверкой уникальности
  2. **Логотип**: загрузка аватара (UFileInput), кнопка «Пропустить»
  3. **Специализации**: мульти-выбор чипсов (маникюр, ресницы, тату, макияж и т.д.)
  4. **График работы**: по дням недели, start/end time, toggle выходной
  5. **Сводка**: отображение введённых данных + кнопка «Создать свой BeautyBook»
- [ ] Обновить `POST /api/me/onboarding`:
  - Создать запись в `profiles` с role=master
  - Создать запись в `master_profiles` (specializations, work_hours)
  - Проверка уникальности username
- [ ] Добавить API `GET /api/me/check-username?username=xxx` — проверка свободности slug
- [ ] Обновить i18n (ru.json, ky.json)

### Зависимости
- Блокирован: #1 (миграция БД), #2 (удаление клиентских страниц)

### Acceptance Criteria
- Новый пользователь проходит 5 шагов и попадает в дашборд
- Роль `master` устанавливается автоматически
- Username уникальный и проверяется в реальном времени
- Можно пропустить аватар

---

## Issue #4: [Phase 1] Обновить auth middleware
**Labels:** `auth`, `phase-1`
**Milestone:** v2.0

### Описание
Упростить auth middleware — убрать ветки для клиентов, все новые пользователи идут на онбординг, после — в дашборд.

### Задачи
- [ ] Обновить `app/middleware/auth.ts`:
  - Если нет профиля → `/onboarding`
  - Если есть профиль с role=master → пропустить
  - Убрать редирект на `/client`
- [ ] Обновить `app/middleware/master-only.ts` — упростить (все авторизованные = мастера)
- [ ] Проверить все `definePageMeta` — убрать ссылки на `client-only`

### Зависимости
- Блокирован: #2

### Acceptance Criteria
- Авторизованный пользователь без профиля → `/onboarding`
- Мастер → дашборд
- Нет упоминаний `client-only` middleware

---

## Issue #5: [Phase 2] Редизайн Landing Page для мастеров
**Labels:** `feature`, `phase-2`, `design`
**Milestone:** v2.0

### Описание
Лендинг должен быть полностью ориентирован на мастеров. Убрать каталог мастеров, поиск, и все CTA для клиентов.

### Задачи
- [ ] Переделать `app/pages/index.vue`:
  - **Шапка**: лого, «Посмотреть демо», «Войти / Зарегистрироваться»
  - **Hero**: ценностное предложение (заголовок + подзаголовок + CTA)
  - **Как это работает**: 3-4 шага (зарегистрируйся → настрой → поделись ссылкой → принимай записи)
  - **Преимущества**: иконки + описание (календарь, клиенты, аналитика, TMA)
  - **Тарифы**: Free vs Pro сравнительная таблица
  - **CTA**: «Создать свой BeautyBook»
- [ ] Обновить `AppHeader.vue` — убрать ссылки на каталог, добавить «Демо»
- [ ] Обновить `AppFooter.vue` — ссылки на About, Contact, язык, тема
- [ ] Обновить i18n

### Зависимости
- Блокирован: #2

### Acceptance Criteria
- Лендинг ориентирован на мастеров
- Нет упоминаний каталога/поиска мастеров
- Адаптивный дизайн (mobile + desktop)

---

## Issue #6: [Phase 2] Статические страницы: About и Contact
**Labels:** `feature`, `phase-2`
**Milestone:** v2.0

### Описание
Добавить страницы «О сервисе» и «Связаться с нами».

### Задачи
- [ ] Создать `app/pages/about.vue` — информация о BeautyBook
- [ ] Создать `app/pages/contact.vue` — форма обратной связи или контактные данные
- [ ] Добавить ссылки в футер
- [ ] i18n для обеих страниц

### Зависимости
- Блокирован: #5 (чтобы футер был готов)

### Acceptance Criteria
- Обе страницы доступны и стилизованы
- Ссылки в футере работают

---

## Issue #7: [Phase 3] Обновить layout дашборда
**Labels:** `ui`, `phase-3`
**Milestone:** v2.0

### Описание
Обновить навигацию дашборда: user dropdown и «Моя страничка» в верхний правый угол.

### Задачи
- [ ] Обновить `app/layouts/dashboard.vue`:
  - Sidebar: Кабинет, Календарь, Услуги, Портфолио, Клиенты, Аналитика, Настройки
  - Убрать user footer из sidebar
  - Добавить в верхний правый угол (navbar): аватар + dropdown (Моя страничка, Настройки, Выйти)
- [ ] Обновить mobile bottom nav
- [ ] Убрать навигацию для клиентов

### Зависимости
- Блокирован: #2

### Acceptance Criteria
- User dropdown в правом верхнем углу
- «Моя страничка» доступна из dropdown
- Навигация соответствует спеке

---

## Issue #8: [Phase 3] Переделать страницу клиентов под новую модель
**Labels:** `feature`, `phase-3`, `clients`
**Milestone:** v2.0

### Описание
Клиенты теперь хранятся в таблице `clients` (уникальный ключ — телефон). Обновить UI и API.

### Задачи
- [ ] Обновить `app/pages/dashboard/clients.vue`:
  - Таблица клиентов (имя, телефон, telegram, кол-во визитов, последний визит)
  - Поиск по имени/телефону
  - Клик → детали клиента (slideover)
  - Редактирование: имя, телефон, заметки
  - История визитов клиента
- [ ] Обновить API endpoints:
  - `GET /api/master/clients` — из таблицы `clients`
  - `POST /api/master/clients` — добавить клиента вручную
  - `GET /api/master/clients/[id]` — детали с историей
  - `PATCH /api/master/clients/[id]` — обновить данные
- [ ] Обновить `dashboardCache.ts` — методы для клиентов
- [ ] Обновить `ClientPicker.vue` — поиск по таблице `clients`

### Зависимости
- Блокирован: #1 (таблица clients)

### Acceptance Criteria
- Клиенты отображаются из новой таблицы
- Поиск и редактирование работают
- История визитов показывается

---

## Issue #9: [Phase 3] Обновить страницу настроек мастера
**Labels:** `feature`, `phase-3`, `settings`
**Milestone:** v2.0

### Описание
Разделить настройки на секции и добавить инструкцию по TMA.

### Задачи
- [ ] Переделать `app/pages/dashboard/settings.vue`:
  - Секция «Настройки профиля» (имя, slug, аватар, обложка, контакты, WhatsApp)
  - Секция «Настройки календаря» (вид по умолчанию, длительность слота)
  - Секция «Настройки уведомлений» (toggle email/telegram — placeholder)
  - Секция «Способы оплаты» (CRUD методов оплаты)
  - Секция «Telegram Mini App» (Pro) — пошаговая инструкция
- [ ] Загрузка обложки (`cover_url`) — API endpoint
- [ ] i18n

### Зависимости
- Блокирован: #1 (cover_url), #2

### Acceptance Criteria
- Все 5 секций отображаются
- Способы оплаты работают (перенесены из settings/payment-types)
- TMA секция показывает инструкцию для Pro

---

## Issue #10: [Phase 4] Редизайн странички мастера (mobile-first)
**Labels:** `feature`, `phase-4`, `design`, `priority-high`
**Milestone:** v2.0

### Описание
Главная ценность продукта — страничка мастера, по которой клиенты записываются. Mobile-first дизайн.

### Задачи
- [ ] Переделать `app/pages/master/[username].vue`:
  - Обложка (cover_url или градиент)
  - Аватар + название
  - График работы на сегодня (или «Выходной»)
  - Табы: Запись | Услуги | Портфолио | Обо мне
- [ ] Таб «Запись»:
  - Кнопка «Записаться» (primary, крупная)
  - Кнопка «Отменить запись»
  - Кнопка «Написать в WhatsApp» (если указан)
- [ ] Таб «Услуги» — карточки услуг с ценой и длительностью
- [ ] Таб «Портфолио» — сетка фото
- [ ] Таб «Обо мне» — bio, контакты, город
- [ ] Убрать отзывы из страницы
- [ ] SSR + meta-теги для SEO
- [ ] Адаптивный дизайн (приоритет mobile)

### Зависимости
- Блокирован: #1 (cover_url в master_profiles)

### Acceptance Criteria
- Страничка красиво выглядит на мобильном
- Все 4 таба работают
- Кнопки CTA видны и понятны
- Выходной день корректно отображается

---

## Issue #11: [Phase 4] Обновить форму бронирования — клиент по телефону
**Labels:** `feature`, `phase-4`, `booking`
**Milestone:** v2.0

### Описание
Клиент записывается без регистрации — вводит телефон, система ищет в базе. Если найден — подставляет имя.

### Задачи
- [ ] Переделать `app/pages/master/[username]/book.vue`:
  1. Поле телефона (маска ввода) → debounced поиск
  2. Если найден → показать имя, автозаполнить
  3. Если не найден → поле имени
  4. Выбор услуги
  5. Выбор даты и слота
  6. Подтверждение
- [ ] Новый API: `POST /api/masters/[id]/lookup-client` — поиск по phone + master_id
- [ ] Обновить `POST /api/masters/[id]/book`:
  - Создать запись в `clients` если не существует
  - Связать booking с client_id
- [ ] Добавить страницу отмены: `app/pages/master/[username]/cancel.vue`
  - Ввод телефона → показать активные записи → кнопка отмены
- [ ] API: `POST /api/masters/[id]/cancel` — отмена по client phone + booking_id

### Зависимости
- Блокирован: #1 (таблица clients), #10 (страничка мастера)

### Acceptance Criteria
- Клиент записывается по номеру телефона
- Повторный клиент автоматически распознаётся
- Отмена по номеру телефона работает
- Запись сохраняется в `clients` + `bookings`

---

## Issue #12: [Phase 4] API для публичного бронирования без авторизации
**Labels:** `api`, `phase-4`
**Milestone:** v2.0

### Описание
Обновить и создать API endpoints для бронирования без авторизации клиента.

### Задачи
- [ ] `POST /api/masters/[id]/lookup-client` — поиск по phone, возврат {found, name}
- [ ] Обновить `POST /api/masters/[id]/book`:
  - Принимать phone + name вместо client_id
  - Создавать/находить клиента в `clients`
  - Проверять лимит Free-подписки (30 записей/мес)
  - Создавать booking
- [ ] `POST /api/masters/[id]/cancel`:
  - Принимать phone + booking_id
  - Проверять что booking принадлежит клиенту с этим phone
  - Менять статус на cancelled
- [ ] Rate limiting на lookup и book endpoints (защита от спама)

### Зависимости
- Блокирован: #1

### Acceptance Criteria
- Все 3 endpoints работают
- Клиент создаётся при первом букинге
- Нельзя отменить чужую запись
- Rate limiting работает

---

## Issue #13: [Phase 5] Логика подписок Free / Pro
**Labels:** `feature`, `phase-5`, `billing`
**Milestone:** v2.0

### Описание
Реализовать логику ограничений Free-подписки и upsell для Pro.

### Задачи
- [ ] Server util: `checkBookingLimit(masterId)` — подсчёт записей за текущий месяц
- [ ] Если Free и ≥30 записей — вернуть 403 с сообщением
- [ ] Добавить в API `/api/masters/[id]/book` проверку лимита
- [ ] В дашборде показать текущее использование (X / 30 записей)
- [ ] Upsell-баннер при приближении к лимиту (25+)
- [ ] В настройках — отображение текущего тарифа
- [ ] Условная логика для Pro-фич (улучшенная аналитика, TMA секция)

### Зависимости
- Блокирован: #1 (subscription_tier уже есть в master_profiles)

### Acceptance Criteria
- Free мастер не может создать >30 записей/мес
- Показывается текущее использование
- Upsell-баннер появляется при 25+ записях
- Pro-фичи доступны только для Pro

---

## Issue #14: [Phase 6] Обновить Telegram Mini App flow
**Labels:** `feature`, `phase-6`, `telegram`
**Milestone:** v2.0

### Описание
TMA использует ту же страничку мастера. Данные из Telegram подтягиваются автоматически.

### Задачи
- [ ] Обновить `/tma/master/[id]` — использовать те же компоненты что и `/master/[username]`
- [ ] В TMA: автозаполнение имени из `initData.user.first_name + last_name`
- [ ] Если доступен phone из Telegram — автозаполнить
- [ ] В настройках мастера (Pro) — пошаговая инструкция:
  1. Создать бота через @BotFather
  2. Настроить Web App URL
  3. Получить ссылку для клиентов
- [ ] Обновить `/api/telegram/validate` если нужно
- [ ] Уведомления мастеру через Bot API о новых записях

### Зависимости
- Блокирован: #10 (страничка мастера), #11 (форма бронирования)

### Acceptance Criteria
- TMA открывает страничку мастера
- Данные из Telegram подтягиваются
- Инструкция в настройках понятна

---

## Диаграмма зависимостей

```
#1 (DB migration) ──────┬──→ #3 (Onboarding)
                        ├──→ #8 (Clients page)
                        ├──→ #10 (Master page)
                        ├──→ #11 (Booking form) ←── #10
                        ├──→ #12 (Booking API)
                        └──→ #13 (Subscriptions)

#2 (Cleanup) ───────────┬──→ #3 (Onboarding)
                        ├──→ #4 (Auth middleware)
                        ├──→ #5 (Landing) ──→ #6 (Static pages)
                        ├──→ #7 (Dashboard layout)
                        └──→ #9 (Settings) ←── #1

#10 + #11 ──────────────→ #14 (TMA)
```

## Рекомендуемый порядок выполнения

1. **#1 + #2** (параллельно) — подготовка
2. **#4 + #7** (параллельно) — auth + layout
3. **#3** — онбординг
4. **#5** — лендинг
5. **#8 + #9 + #6** (параллельно) — клиенты, настройки, статические страницы
6. **#10** — страничка мастера
7. **#11 + #12** (параллельно) — букинг
8. **#13** — подписки
9. **#14** — TMA
