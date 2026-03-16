#!/bin/bash
# Create GitHub Issues for BeautyBook v2.0 Migration
# Usage: bash docs/create_issues.sh
# Requires: gh CLI authenticated

set -e

echo "Creating labels..."
gh label create "phase-0" --color "D93F0B" --description "Phase 0: Preparation" --force
gh label create "phase-1" --color "E99695" --description "Phase 1: Onboarding & Auth" --force
gh label create "phase-2" --color "FEF2C0" --description "Phase 2: Landing Page" --force
gh label create "phase-3" --color "C2E0C6" --description "Phase 3: Dashboard Updates" --force
gh label create "phase-4" --color "BFD4F2" --description "Phase 4: Master Page & Booking" --force
gh label create "phase-5" --color "D4C5F9" --description "Phase 5: Subscriptions" --force
gh label create "phase-6" --color "F9D0C4" --description "Phase 6: Telegram Mini App" --force
gh label create "database" --color "1D76DB" --description "Database changes" --force
gh label create "cleanup" --color "CCCCCC" --description "Code cleanup" --force
gh label create "breaking-change" --color "B60205" --description "Breaking change" --force
gh label create "priority-high" --color "D93F0B" --description "High priority" --force
gh label create "clients" --color "0E8A16" --description "Client management" --force
gh label create "booking" --color "5319E7" --description "Booking flow" --force
gh label create "billing" --color "FBCA04" --description "Billing & subscriptions" --force
gh label create "onboarding" --color "006B75" --description "Onboarding flow" --force
gh label create "settings" --color "C5DEF5" --description "Settings" --force
gh label create "telegram" --color "0088CC" --description "Telegram integration" --force
gh label create "design" --color "E6007A" --description "Design/UI" --force
gh label create "api" --color "006B75" --description "API changes" --force

echo "Creating milestone..."
gh api repos/:owner/:repo/milestones -f title="v2.0" -f description="BeautyBook v2.0 — Master-only SaaS pivot" -f state="open" 2>/dev/null || echo "Milestone may already exist"

echo ""
echo "Creating issues..."

# Issue 1
ISSUE1=$(gh issue create \
  --title "[Phase 0] Миграция БД: таблица clients и обновление схемы" \
  --label "database,phase-0,breaking-change" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Создать новую таблицу `clients` для хранения клиентов мастера (без регистрации на платформе). Уникальный ключ — связка `(master_id, phone)`.

## Задачи
- [ ] Создать миграцию `009_clients_table.sql`:
  - Таблица `clients` (id uuid, master_id FK, phone text, name text, telegram_id bigint, telegram_username text, notes text, created_at)
  - UNIQUE(master_id, phone)
  - Индекс на (master_id, phone)
- [ ] Добавить `cover_url text` в `master_profiles`
- [ ] Мигрировать данные из `master_clients` → `clients` (backfill)
- [ ] Обновить `bookings.client_id` FK → `clients.id`
- [ ] Обновить `app/types/database.types.ts`
- [ ] Пометить таблицу `reviews` как deprecated

## Зависимости
Нет (стартовая задача)

## Acceptance Criteria
- Таблица `clients` создана и работает
- Существующие клиенты перенесены
- `database.types.ts` обновлен
BODY
)")
echo "Created: $ISSUE1"

# Issue 2
ISSUE2=$(gh issue create \
  --title "[Phase 0] Удалить клиентские страницы, каталог и отзывы" \
  --label "cleanup,phase-0,breaking-change" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Убрать всё, что связано с ролью «клиент» на платформе: каталог, клиентские страницы, отзывы.

## Задачи
- [ ] Удалить страницы: catalog/index, client/index, client/bookings, client/masters, client/settings
- [ ] Удалить middleware: client-only.ts, master-redirect.global.ts
- [ ] Удалить API routes: masters/index.get, masters/top.get, reviews.post, masters/[username]/reviews.get, me/masters.get, me/bookings.get, me/bookings/[id]/cancel.patch
- [ ] Удалить компоненты: reviews/ReviewModal.vue
- [ ] Обновить auth.ts middleware — убрать роутинг клиентов
- [ ] Обновить i18n файлы
- [ ] Убрать ссылки на каталог из навигации

## Зависимости
Нет (параллельно с #1)

## Acceptance Criteria
- Все клиентские и каталожные страницы удалены
- Нет broken imports/references
- `bun run check` проходит
BODY
)")
echo "Created: $ISSUE2"

# Issue 3
ISSUE3=$(gh issue create \
  --title "[Phase 1] Переделать онбординг — 5-шаговый stepper для мастера" \
  --label "feature,phase-1,onboarding" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Онбординг только для мастеров — роль master присваивается автоматически. 5 шагов.

## Экраны
1. **Название + slug** — бизнес-имя + username с live-проверкой уникальности
2. **Логотип** — загрузка аватара, кнопка «Пропустить»
3. **Специализации** — мульти-выбор (маникюр, ресницы, тату, макияж и т.д.)
4. **График работы** — дни недели + часы, toggle выходной
5. **Сводка** — все данные + «Создать свой BeautyBook»

## Задачи
- [ ] Переделать `app/pages/onboarding.vue` — stepper UI
- [ ] Обновить `POST /api/me/onboarding` — создание profiles + master_profiles
- [ ] Добавить `GET /api/me/check-username` — проверка уникальности slug
- [ ] Обновить i18n

## Зависимости
Блокирован: #1, #2

## Acceptance Criteria
- Новый пользователь → 5 шагов → дашборд
- Роль master автоматически
- Username уникальный
BODY
)")
echo "Created: $ISSUE3"

# Issue 4
ISSUE4=$(gh issue create \
  --title "[Phase 1] Обновить auth middleware" \
  --label "auth,phase-1" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Упростить auth middleware — все новые пользователи → онбординг → дашборд. Без ветки для клиентов.

## Задачи
- [ ] Обновить `app/middleware/auth.ts`: нет профиля → /onboarding, мастер → пропустить
- [ ] Упростить `master-only.ts`
- [ ] Убрать ссылки на `client-only` из definePageMeta

## Зависимости
Блокирован: #2
BODY
)")
echo "Created: $ISSUE4"

# Issue 5
ISSUE5=$(gh issue create \
  --title "[Phase 2] Редизайн Landing Page для мастеров" \
  --label "feature,phase-2,design" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Лендинг ориентирован только на мастеров.

## Структура
- **Шапка**: лого, «Посмотреть демо», «Войти / Зарегистрироваться»
- **Hero**: ценностное предложение для мастеров
- **Как это работает**: 3-4 шага
- **Преимущества**: календарь, клиенты, аналитика, TMA
- **Тарифы**: Free vs Pro
- **CTA**: «Создать свой BeautyBook»
- **Футер**: О сервисе, Контакты, язык, тема

## Задачи
- [ ] Переделать `app/pages/index.vue`
- [ ] Обновить `AppHeader.vue`, `AppFooter.vue`
- [ ] i18n

## Зависимости
Блокирован: #2
BODY
)")
echo "Created: $ISSUE5"

# Issue 6
ISSUE6=$(gh issue create \
  --title "[Phase 2] Статические страницы: About и Contact" \
  --label "feature,phase-2" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Добавить страницы «О сервисе» и «Связаться с нами».

## Задачи
- [ ] Создать `app/pages/about.vue`
- [ ] Создать `app/pages/contact.vue`
- [ ] Ссылки в футер
- [ ] i18n

## Зависимости
Блокирован: #5
BODY
)")
echo "Created: $ISSUE6"

# Issue 7
ISSUE7=$(gh issue create \
  --title "[Phase 3] Обновить layout дашборда" \
  --label "ui,phase-3" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
User dropdown и «Моя страничка» в верхний правый угол. Обновить навигацию.

## Задачи
- [ ] Обновить `app/layouts/dashboard.vue`:
  - Sidebar: Кабинет, Календарь, Услуги, Портфолио, Клиенты, Аналитика, Настройки
  - User dropdown в navbar (правый верхний угол)
  - «Моя страничка» в dropdown
- [ ] Обновить mobile bottom nav
- [ ] Убрать клиентскую навигацию

## Зависимости
Блокирован: #2
BODY
)")
echo "Created: $ISSUE7"

# Issue 8
ISSUE8=$(gh issue create \
  --title "[Phase 3] Переделать страницу клиентов под новую модель" \
  --label "feature,phase-3,clients" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Клиенты хранятся в таблице clients (уникальный ключ — телефон). Обновить UI и API.

## Задачи
- [ ] Обновить `app/pages/dashboard/clients.vue`:
  - Таблица (имя, телефон, telegram, визиты, последний визит)
  - Поиск по имени/телефону
  - Slideover с деталями
  - Редактирование
  - История визитов
- [ ] Обновить API: GET/POST/GET[id]/PATCH[id] /api/master/clients
- [ ] Обновить `dashboardCache.ts`
- [ ] Обновить `ClientPicker.vue`

## Зависимости
Блокирован: #1
BODY
)")
echo "Created: $ISSUE8"

# Issue 9
ISSUE9=$(gh issue create \
  --title "[Phase 3] Обновить страницу настроек мастера" \
  --label "feature,phase-3,settings" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Разделить настройки на 5 секций.

## Секции
1. Настройки профиля (имя, slug, аватар, обложка, контакты)
2. Настройки календаря (вид, слот)
3. Настройки уведомлений (placeholder)
4. Способы оплаты (CRUD)
5. Telegram Mini App (Pro, инструкция)

## Задачи
- [ ] Переделать `app/pages/dashboard/settings.vue`
- [ ] API для загрузки обложки
- [ ] i18n

## Зависимости
Блокирован: #1, #2
BODY
)")
echo "Created: $ISSUE9"

# Issue 10
ISSUE10=$(gh issue create \
  --title "[Phase 4] Редизайн странички мастера (mobile-first)" \
  --label "feature,phase-4,design,priority-high" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Главная ценность — страничка мастера для клиентов. Mobile-first.

## Структура
1. Обложка (cover)
2. Аватар + название
3. График работы на сегодня
4. Табы: Запись | Услуги | Портфолио | Обо мне

### Таб «Запись»
- Кнопка «Записаться» (primary, крупная)
- «Отменить запись»
- «Написать в WhatsApp»

## Задачи
- [ ] Переделать `app/pages/master/[username].vue`
- [ ] 4 таба с содержимым
- [ ] Убрать отзывы
- [ ] SSR + meta-теги
- [ ] Mobile-first адаптивный дизайн

## Зависимости
Блокирован: #1
BODY
)")
echo "Created: $ISSUE10"

# Issue 11
ISSUE11=$(gh issue create \
  --title "[Phase 4] Обновить форму бронирования — клиент по телефону" \
  --label "feature,phase-4,booking" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Клиент записывается без регистрации — телефон → поиск → автоподстановка.

## Flow
1. Телефон (маска) → debounced поиск
2. Найден → показать имя
3. Не найден → поле имени
4. Услуга → Дата → Слот → Подтверждение

## Задачи
- [ ] Переделать `app/pages/master/[username]/book.vue`
- [ ] API: `POST /api/masters/[id]/lookup-client`
- [ ] Обновить `POST /api/masters/[id]/book` — создание клиента
- [ ] Страница отмены: `app/pages/master/[username]/cancel.vue`
- [ ] API: `POST /api/masters/[id]/cancel`

## Зависимости
Блокирован: #1, #10
BODY
)")
echo "Created: $ISSUE11"

# Issue 12
ISSUE12=$(gh issue create \
  --title "[Phase 4] API для публичного бронирования без авторизации" \
  --label "api,phase-4" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
API endpoints для бронирования без авторизации клиента.

## Задачи
- [ ] `POST /api/masters/[id]/lookup-client` — поиск по phone
- [ ] Обновить `POST /api/masters/[id]/book` — phone+name, создание клиента, проверка лимита
- [ ] `POST /api/masters/[id]/cancel` — отмена по phone+booking_id
- [ ] Rate limiting

## Зависимости
Блокирован: #1
BODY
)")
echo "Created: $ISSUE12"

# Issue 13
ISSUE13=$(gh issue create \
  --title "[Phase 5] Логика подписок Free / Pro" \
  --label "feature,phase-5,billing" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
Free: до 30 записей/мес. Pro: без ограничений + улучшенная аналитика + напоминания.

## Задачи
- [ ] Server util: `checkBookingLimit(masterId)`
- [ ] 403 при превышении лимита Free
- [ ] Проверка в `/api/masters/[id]/book`
- [ ] Показать использование в дашборде (X / 30)
- [ ] Upsell-баннер при 25+
- [ ] Текущий тариф в настройках
- [ ] Условная логика для Pro-фич

## Зависимости
Блокирован: #1
BODY
)")
echo "Created: $ISSUE13"

# Issue 14
ISSUE14=$(gh issue create \
  --title "[Phase 6] Обновить Telegram Mini App flow" \
  --label "feature,phase-6,telegram" \
  --milestone "v2.0" \
  --body "$(cat <<'BODY'
## Описание
TMA использует ту же страничку мастера. Данные из Telegram автозаполняются.

## Задачи
- [ ] Обновить `/tma/master/[id]` — общие компоненты с web-версией
- [ ] Автозаполнение из initData (имя, phone)
- [ ] Инструкция в настройках мастера (Pro)
- [ ] Обновить `/api/telegram/validate`
- [ ] Уведомления мастеру через Bot API

## Зависимости
Блокирован: #10, #11
BODY
)")
echo "Created: $ISSUE14"

echo ""
echo "✅ All 14 issues created successfully!"
echo ""
echo "Dependency order:"
echo "  1. #1 + #2 (parallel) — preparation"
echo "  2. #4 + #7 (parallel) — auth + layout"
echo "  3. #3 — onboarding"
echo "  4. #5 — landing"
echo "  5. #8 + #9 + #6 (parallel) — clients, settings, static pages"
echo "  6. #10 — master page"
echo "  7. #11 + #12 (parallel) — booking"
echo "  8. #13 — subscriptions"
echo "  9. #14 — TMA"
