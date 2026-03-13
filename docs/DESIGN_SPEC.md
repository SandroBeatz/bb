# BeautyBook Design System

**Version:** 1.0 | **Date:** 2026-03-13 | **Stack:** Nuxt 4 · Nuxt UI v3 · Tailwind CSS v4

> Этот документ — единственный источник правды по дизайну для всех разработчиков и AI-агентов. Любые изменения UI должны соответствовать этой спеке.

---

## Содержание

1. [Философия дизайна](#1-философия-дизайна)
2. [Цветовая система](#2-цветовая-система)
3. [Типографика](#3-типографика)
4. [Отступы и сетка](#4-отступы-и-сетка)
5. [Скругления и тени](#5-скругления-и-тени)
6. [Компоненты (Nuxt UI)](#6-компоненты-nuxt-ui)
7. [Календарь (nuxt-vcalendar)](#7-календарь-nuxt-vcalendar)
8. [Анимации и микровзаимодействия](#8-анимации-и-микровзаимодействия)
9. [Иконки](#9-иконки)
10. [Адаптивность и мобильная версия](#10-адаптивность-и-мобильная-версия)
11. [Шаблоны страниц](#11-шаблоны-страниц)
12. [Доступность](#12-доступность)
13. [Что делать и что не делать](#13-что-делать-и-что-не-делать)

---

## 1. Философия дизайна

### Концепция: «Refined Warmth» (Утончённая теплота)

BeautyBook — это пространство доверия между мастером и клиентом. Дизайн должен быть:

- **Минималистичным** — каждый экран имеет одно главное действие; остальное отступает на второй план
- **Тёплым** — холодные нейтральные тона отталкивают; тёплые кремовые и приглушённые розовые создают ощущение уюта
- **Профессиональным** — не «розово-девочковый», а утончённый и зрелый (аудитория 25–45 лет)
- **Быстрым** — интерфейс не должен думать за пользователя; каждый следующий шаг очевиден

### Три правила

1. **Одно главное действие на экране.** Кнопка «Записаться», «Сохранить», «Подтвердить» — всегда одна, всегда выделена.
2. **Пространство — это не пустота, а роскошь.** Не заполнять экран ради заполнения. Whitespace — дорогой материал.
3. **Мобильный контекст — основной.** Клиенты бронируют в очереди и в транспорте. Мастера управляют расписанием одной рукой.

---

## 2. Цветовая система

### Семантические роли цветов

| Роль | Назначение |
|---|---|
| `primary` | Главные CTA, активные состояния, акценты — dusty rose / mauve |
| `neutral` | Текст, границы, фоны — warm stone (тёплые серо-коричневые) |
| `success` | Подтверждение бронирования, оплата прошла |
| `warning` | Ожидает подтверждения, приближается запись |
| `error` | Ошибки форм, отмена, отказ |
| `info` | Нейтральные подсказки |

### Светлая тема (`light`)

```
Фон страницы:        #FAF8F5   (тёплый кремовый, не чисто белый)
Фон карточек:        #FFFFFF   (белый, чтобы карточки «всплывали» над фоном)
Фон muted:           #F5EFE8   (тёплый бежевый для второстепенных зон)
Фон elevated:        #EEE8E0   (для hover, tooltip)
Фон accented:        #E5DDD4   (для выделенных блоков)

Граница default:     #DDD5CB
Граница muted:       #E8E0D8
Граница accented:    #CFC5B9

Текст основной:      #2D2520   (тёплый тёмно-коричневый, не #000)
Текст secondary:     #6B5B52   (stone-600 аналог)
Текст muted:         #9E8E85   (для подписей, метаданных)
Текст disabled:      #C4B5AE
```

### Тёмная тема (`dark`)

```
Фон страницы:        #1A1612   (очень тёмный кофейный, не чёрный)
Фон карточек:        #231D18   (немного светлее фона)
Фон muted:           #2C2420
Фон elevated:        #332B25
Фон accented:        #3D332C

Граница default:     #3D342C
Граница muted:       #352D26
Граница accented:    #4A3F36

Текст основной:      #F5EDE4   (тёплый кремовый)
Текст secondary:     #C4B5AE
Текст muted:         #8C7A72
```

### Палитра primary (Dusty Rose / Mauve)

Переопределяет Tailwind `rose` в сторону приглушённого мова-розового:

```
rose-50:   #FDF5F7   (очень светлый бледно-розовый фон)
rose-100:  #FAE8EE
rose-200:  #F4CEDB
rose-300:  #EAAABF
rose-400:  #DD7FA0
rose-500:  #C85C82   (основной акцент)
rose-600:  #AD4068
rose-700:  #913153
rose-800:  #782A46
rose-900:  #65263D
rose-950:  #3C0F21
```

### Применение primary в интерфейсе

```
Кнопки CTA (solid):     bg-primary-500, hover:bg-primary-600
Текстовые ссылки:       text-primary-600 (light) / text-primary-400 (dark)
Активный таб/пункт:     border-b-2 border-primary-500
Фокус input:            ring-1 ring-primary-400
Бейдж/тег:              bg-primary-50 text-primary-700 (light)
Икона акцент:           text-primary-500
```

### Нейтральная палитра (Stone — тёплая)

Используется для ВСЕГО текста, границ и фоновых поверхностей. Это `stone` из Tailwind (уже тёплый оттенок).

```
stone-50:  #FAFAF9
stone-100: #F5F5F4
stone-200: #E7E5E4
stone-300: #D6D3D1
stone-400: #A8A29E
stone-500: #78716C
stone-600: #57534E
stone-700: #44403C
stone-800: #292524
stone-900: #1C1917
stone-950: #0C0A09
```

### Статусные цвета

```
success:  'emerald'  — подтверждено, оплачено, выполнено
warning:  'amber'    — ожидает, скоро, напоминание
error:    'red'      — отменено, ошибка
info:     'sky'      — информация, подсказка
```

---

## 3. Типографика

### Шрифты

```css
/* Заголовки / Дисплей */
font-family: 'Cormorant Garamond', Georgia, serif;

/* Интерфейс / Тело / Кнопки */
font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
```

**Cormorant Garamond** — высококонтрастный элегантный сериф. Используется исключительно для крупных заголовков (имена мастеров, hero-тексты, секционные заголовки). Создаёт ощущение luxury без вульгарности.

**Plus Jakarta Sans** — гуманистический гротеск, читаемый при любом размере. Используется для всего функционального UI.

### Шкала размеров

| Токен | Размер | Строки | Применение |
|---|---|---|---|
| `text-xs` | 12px | 1.4 | Метаданные, временны́е метки, счётчики |
| `text-sm` | 14px | 1.5 | Подписи полей, вторичный текст, теги |
| `text-base` | 16px | 1.6 | Основной текст, описания |
| `text-lg` | 18px | 1.5 | Цены, акцентированный текст |
| `text-xl` | 20px | 1.4 | Заголовки карточек, названия услуг |
| `text-2xl` | 24px | 1.3 | Заголовки секций |
| `text-3xl` | 30px | 1.2 | Имена мастеров (профиль) |
| `text-4xl` | 36px | 1.1 | Hero-заголовки (Cormorant) |
| `text-5xl` | 48px | 1.0 | Лендинг hero (Cormorant) |

### Правила применения

```
Заголовки (h1–h2):     font-serif (Cormorant), font-light, tracking-tight
Заголовки (h3–h4):     font-sans, font-semibold
Кнопки:                font-sans, font-medium, tracking-wide (0.025em)
Навигация:             font-sans, font-medium
Метки форм:            font-sans, font-medium, text-sm
Метаданные:            font-sans, font-normal, text-xs, text-muted
Цены:                  font-sans, font-semibold, text-lg
```

### Регистр текста

- **Sentence case везде.** Никаких ALL CAPS для навигации и кнопок.
- Исключение: аббревиатуры (ID, CTA, VIP) и лейблы метаданных `НОВЫЙ`, `PRO`.
- Названия кнопок: «Записаться», «Сохранить» — не «ЗАПИСАТЬСЯ».

---

## 4. Отступы и сетка

### Базовая единица: 4px (rem-based)

Tailwind's 4px unit. Все отступы кратны 4px:

```
gap-1  = 4px    — между иконкой и текстом
gap-2  = 8px    — между inline-элементами
gap-3  = 12px   — внутри компактных компонентов
gap-4  = 16px   — стандартный отступ внутри карточек
gap-6  = 24px   — между элементами списка
gap-8  = 32px   — между секциями внутри страницы
gap-12 = 48px   — между крупными секциями
gap-16 = 64px   — hero и крупные блоки
```

### Внутренние отступы карточек

```
Компактная карточка:   p-3 (12px)
Стандартная карточка:  p-4 (16px)
Широкая карточка:      p-5 lg:p-6 (20–24px)
```

### Сетка страниц

```
Мобиль (< 768px):   1 колонка, max-width: 100%, px-4
Планшет (768–1024): 2 колонки для листингов, max-width: 768px, px-6
Десктоп (> 1024):   2–3 колонки, max-width: 1280px, mx-auto, px-8
```

### Списки мастеров

```
mobile:  grid-cols-1
sm:      grid-cols-2
lg:      grid-cols-3
xl:      grid-cols-4 (только в широких каталогах)
gap-4 или gap-5
```

---

## 5. Скругления и тени

### Скругления (`--ui-radius: 0.5rem = 8px`)

| Элемент | Класс | Значение |
|---|---|---|
| Кнопки | `rounded-lg` | 8px |
| Карточки | `rounded-2xl` | 16px |
| Аватары | `rounded-full` | 50% |
| Поля ввода | `rounded-lg` | 8px |
| Теги / Бейджи | `rounded-full` | 50% |
| Модальные окна | `rounded-2xl` | 16px |
| Боттом-шиты | `rounded-t-3xl` | 24px сверху |
| Изображения в карточках | `rounded-xl` | 12px |

### Тени

```css
/* Карточки мастеров — лёгкая тёплая тень */
shadow:     0 1px 3px rgba(45,37,32,0.06), 0 1px 2px rgba(45,37,32,0.04)

/* Hover на карточке */
shadow-md:  0 4px 6px rgba(45,37,32,0.07), 0 2px 4px rgba(45,37,32,0.05)

/* Модальные окна */
shadow-xl:  0 20px 40px rgba(45,37,32,0.12)

/* Sticky кнопки */
shadow-lg:  0 10px 15px rgba(45,37,32,0.08)
```

Правило: **тени всегда тёплые** (brown-tinted), не холодные серые. Использовать `shadow` класс Tailwind с кастомными переменными.

---

## 6. Компоненты (Nuxt UI)

Все компоненты — из `@nuxt/ui` v3. Кастомизация через `app.config.ts` и `ui` prop.

### UButton

```vue
<!-- Главный CTA — «Записаться», «Подтвердить» -->
<UButton color="primary" size="lg" class="w-full">
  Записаться
</UButton>

<!-- Вторичное действие -->
<UButton color="neutral" variant="outline" size="md">
  Отмена
</UButton>

<!-- Опасное действие -->
<UButton color="error" variant="ghost" size="sm">
  Удалить
</UButton>

<!-- Иконка + текст (часто используется в дашборде) -->
<UButton color="neutral" variant="ghost" leading-icon="i-heroicons-plus">
  Добавить услугу
</UButton>
```

**Правила кнопок:**
- Основной CTA всегда `size="lg"`, `color="primary"`, `variant="solid"`
- На мобиле основной CTA всегда `class="w-full"` (полная ширина)
- Никогда не размещать два solid-CTA рядом. Второй — `outline` или `ghost`
- Кнопки с разрушительными действиями — `color="error"`, всегда требуют подтверждения

### UCard

```vue
<!-- Карточка мастера в листинге -->
<UCard
  :ui="{
    root: 'rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200',
    body: 'p-0'
  }"
>
  <!-- Фото занимает 60-65% высоты карточки -->
  <div class="aspect-[4/5] overflow-hidden">
    <img :src="master.cover" class="w-full h-full object-cover" />
  </div>
  <div class="p-4">
    <p class="font-sans font-semibold text-base text-highlighted">{{ master.name }}</p>
    <p class="font-sans text-sm text-muted mt-0.5">{{ master.specialty }}</p>
    <div class="flex items-center justify-between mt-3">
      <span class="font-sans text-sm font-semibold text-primary-600">от {{ master.price }} ₽</span>
      <UBadge color="neutral" variant="soft" size="xs">⭐ {{ master.rating }}</UBadge>
    </div>
  </div>
</UCard>

<!-- Карточка услуги -->
<UCard :ui="{ root: 'rounded-xl', body: 'p-4' }">
  <div class="flex items-start justify-between gap-4">
    <div>
      <p class="font-sans font-medium text-base text-highlighted">{{ service.name }}</p>
      <p class="font-sans text-sm text-muted mt-1">{{ service.duration }} мин</p>
    </div>
    <span class="font-sans font-semibold text-lg text-primary-600 shrink-0">{{ service.price }} ₽</span>
  </div>
</UCard>
```

### UInput / UTextarea

```vue
<!-- Все поля ввода — единый стиль -->
<UFormField label="Телефон" name="phone">
  <UInput
    placeholder="+7 (___) ___-__-__"
    inputmode="tel"
    size="lg"
    :ui="{ base: 'rounded-lg' }"
  />
</UFormField>
```

**Правила форм:**
- Размер полей: `size="lg"` на мобиле, `size="md"` на десктопе в модальных окнах
- Лейблы: всегда visible, не placeholder-only (placeholder не заменяет label)
- Валидация: ошибка появляется после blur или после попытки submit
- Поля телефона: `inputmode="tel"`, поля суммы: `inputmode="decimal"`

### UModal / Drawer

```vue
<!-- Быстрое бронирование и детали — боттом-шит на мобиле -->
<UDrawer direction="bottom">
  <template #content>
    <div class="rounded-t-3xl px-4 pt-4 pb-safe">
      <!-- Индикатор шторки -->
      <div class="w-10 h-1 bg-accented rounded-full mx-auto mb-6" />
      <!-- Контент -->
    </div>
  </template>
</UDrawer>

<!-- Подтверждение действий — центральное модальное окно -->
<UModal>
  <template #content>
    <div class="p-6">
      <h3 class="font-sans font-semibold text-xl text-highlighted mb-2">
        Отменить запись?
      </h3>
      <p class="font-sans text-sm text-muted mb-6">
        Мастер будет уведомлён об отмене.
      </p>
      <div class="flex gap-3">
        <UButton color="neutral" variant="outline" class="flex-1">Назад</UButton>
        <UButton color="error" class="flex-1">Отменить</UButton>
      </div>
    </div>
  </template>
</UModal>
```

### UTabs / UNavigationMenu

```vue
<!-- Табы в дашборде мастера -->
<UTabs
  :items="[
    { label: 'Сегодня', value: 'today' },
    { label: 'Неделя', value: 'week' },
    { label: 'Месяц', value: 'month' }
  ]"
  :ui="{
    list: 'border-b border-default',
    trigger: 'font-sans font-medium text-sm',
  }"
/>
```

### UBadge

```vue
<!-- Статус бронирования -->
<UBadge color="warning" variant="soft">Ожидает</UBadge>
<UBadge color="success" variant="soft">Подтверждено</UBadge>
<UBadge color="error"   variant="soft">Отменено</UBadge>
<UBadge color="neutral" variant="soft">Завершено</UBadge>

<!-- Тег категории -->
<UBadge color="primary" variant="subtle" size="sm">Маникюр</UBadge>
```

### UAvatar

```vue
<!-- Аватар мастера -->
<UAvatar
  :src="master.avatar"
  :alt="master.name"
  size="xl"
  :ui="{ root: 'ring-2 ring-default' }"
/>
```

### UToast / уведомления

```vue
<!-- Используем useToast() из Nuxt UI -->
const toast = useToast()

// Успех
toast.add({
  title: 'Запись создана',
  description: `${master.name}, ${formatDate(date)}`,
  color: 'success',
  icon: 'i-heroicons-check-circle',
  duration: 4000,
})

// Ошибка
toast.add({
  title: 'Не удалось сохранить',
  color: 'error',
  icon: 'i-heroicons-x-circle',
})
```

---

## 7. Календарь (nuxt-vcalendar)

Используем `@samk-dev/nuxt-vcalendar` — обёртка над v-calendar.

### Стилизация под дизайн-систему

```vue
<template>
  <VCalendar
    :attributes="calendarAttrs"
    :min-date="new Date()"
    expanded
    borderless
    class="bb-calendar"
  />
</template>
```

```css
/* app/assets/css/main.css — секция calendar overrides */
.bb-calendar {
  /* Фон */
  --vc-bg: transparent;
  --vc-border: transparent;

  /* Заголовок месяца */
  --vc-header-arrow-color: var(--ui-text);
  --vc-header-title-color: var(--ui-text-highlighted);
  --vc-header-title-font-weight: 600;

  /* Дни недели */
  --vc-weekday-color: var(--ui-text-muted);
  --vc-weekday-font-size: 0.75rem;

  /* Числа */
  --vc-day-content-color: var(--ui-text);
  --vc-day-content-font-size: 0.875rem;
  --vc-day-content-font-weight: 400;

  /* Сегодня */
  --vc-today-bg-color: var(--ui-bg-muted);
  --vc-today-color: var(--ui-text-highlighted);

  /* Выделенный день (выбранная дата) */
  --vc-accent-200: var(--color-rose-200);
  --vc-accent-400: var(--color-rose-400);
  --vc-accent-500: var(--color-rose-500);
  --vc-accent-600: var(--color-rose-600);
}

/* Ячейки дат — увеличенные тач-таргеты */
.bb-calendar .vc-day-content {
  min-height: 44px;
  min-width: 44px;
  border-radius: 8px;
}

/* Недоступные даты */
.bb-calendar .vc-day.is-not-in-month .vc-day-content {
  opacity: 0.3;
}
```

### Атрибуты для статусов слотов

```ts
const calendarAttrs = computed(() => [
  // Доступные слоты
  {
    dates: availableDates.value,
    highlight: {
      color: 'rose',
      fillMode: 'light',
    },
  },
  // Занятые/недоступные
  {
    dates: unavailableDates.value,
    content: {
      style: { opacity: '0.3', textDecoration: 'line-through' },
    },
  },
  // Выбранная дата
  {
    dates: selectedDate.value,
    highlight: {
      color: 'rose',
      fillMode: 'solid',
    },
  },
])
```

### Вид календаря по умолчанию

- **Клиент (выбор даты бронирования):** месячный вид, expanded, только выбор даты
- **Мастер (расписание):** недельный вид как основной; переключение на месячный; drag-and-drop по возможности

---

## 8. Анимации и микровзаимодействия

### Принцип: «Ткань, не механизм»

Движения должны быть плавными, органичными и быстрыми. Никакого "bounce" и "elastic".

### Временны́е константы

```css
--duration-fast:    150ms;   /* hover, focus rings */
--duration-base:    200ms;   /* кнопки, смена состояний */
--duration-smooth:  300ms;   /* появление карточек, переходы между вкладками */
--duration-modal:   350ms;   /* модальные окна, боттом-шиты */
```

### Easing

```css
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);    /* основной для входящих элементов */
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);     /* для переходов */
```

### Применение

```css
/* Карточки мастеров — hover lift */
.master-card {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 200ms ease-out;
}
.master-card:hover {
  transform: translateY(-2px);
}

/* Кнопки — press feedback */
.btn-primary:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}

/* Страницы — fade-in при навигации */
.page-enter-active { transition: opacity 200ms ease-out; }
.page-leave-active { transition: opacity 150ms ease-in; }
.page-enter-from, .page-leave-to { opacity: 0; }

/* Shimmer загрузка — вместо спиннеров */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--ui-bg-muted) 25%,
    var(--ui-bg-elevated) 50%,
    var(--ui-bg-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}
```

### Что запрещено

- Parallax на мобиле
- Анимации длиннее 400ms
- Auto-playing видео
- Confetti / взрывные эффекты после подтверждения (заменять на тихий checkmark)
- Bounce/elastic easing
- Всегда добавлять `@media (prefers-reduced-motion: reduce)` для отключения анимаций

---

## 9. Иконки

Используем **Heroicons** (встроены в Nuxt UI) как основную библиотеку.

### Правила

```
Навигация:          24px (6 Tailwind units) — outline style
Внутри кнопок:      20px (5 units) — solid style
Метаданные/inline:  16px (4 units) — outline style
Иллюстрации:        48px+ — используем специальные SVG или Phosphor
```

### Часто используемые иконки

```
i-heroicons-calendar        — расписание
i-heroicons-scissors        — услуги / мастер
i-heroicons-user            — профиль клиента
i-heroicons-users           — клиенты мастера
i-heroicons-chart-bar       — аналитика
i-heroicons-star            — рейтинг
i-heroicons-map-pin         — локация
i-heroicons-clock           — время / длительность
i-heroicons-currency-ruble  — цена
i-heroicons-check-circle    — подтверждено
i-heroicons-x-circle        — отменено
i-heroicons-bell            — уведомления
i-heroicons-photo           — портфолио
i-heroicons-plus            — добавить
i-heroicons-pencil          — редактировать
i-heroicons-trash           — удалить
```

---

## 10. Адаптивность и мобильная версия

### Breakpoints

```
sm:   640px   — большой телефон
md:   768px   — планшет портрет
lg:   1024px  — планшет ландшафт / малый ноутбук
xl:   1280px  — стандартный ноутбук
2xl:  1536px  — большой экран
```

### Зона большого пальца

На мобиле основные действия должны быть в **нижних 40% экрана**:
- Кнопка «Записаться» — sticky bottom
- Навигация — bottom navigation bar
- Боттом-шиты — естественная зона досягаемости

### Bottom Navigation (мобиль)

```vue
<!-- Видна только на мобиле, максимум 4-5 пунктов -->
<nav class="fixed bottom-0 left-0 right-0 md:hidden bg-default border-t border-default
            flex items-center justify-around pb-safe px-2">
  <NuxtLink to="/dashboard">
    <UButton icon="i-heroicons-calendar" variant="ghost" color="neutral" size="sm" />
  </NuxtLink>
  <!-- ... -->
</nav>
```

### Safe Area Insets

```css
/* Всегда учитывать notch и home indicator на iOS */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
```

### Touch Targets

Минимальный touch target: **44×44px** (Apple HIG). Это особенно критично для:
- Ячеек календаря (даты)
- Слотов времени
- Кнопок в карточках

---

## 11. Шаблоны страниц

### Лендинг (`/`)

```
Hero:
  - Фоновая фотография мастера/атмосферное фото (full-bleed)
  - Serif заголовок h1 (Cormorant, text-5xl, font-light)
  - Подзаголовок sans text-lg text-muted
  - CTA кнопка "Найти мастера" (primary, lg, rounded-lg)

Секции:
  - Как это работает (3 шага, горизонтальный ряд)
  - Топ мастера (горизонтальный скролл на мобиле, 4 карточки на десктопе)
  - Для мастеров CTA (отдельная секция с другим фоном)
  - Отзывы (3 карточки)
```

### Листинг мастеров (`/masters`)

```
Структура:
  - Фильтры (sticky, горизонтальный скролл на мобиле)
  - Сетка карточек (1/2/3 колонки)
  - Пагинация или infinite scroll

Карточка мастера:
  - Фото 4:5 (портретное) или 1:1 — выбрать единое
  - Имя + специальность под фото
  - Рейтинг + количество отзывов
  - Цена «от Х ₽»
  - Hover: лёгкий подъём карточки
```

### Профиль мастера (`/master/[username]`)

```
Hero:
  - Cover photo (16:9 или full-width, max-height: 240px мобиль / 360px десктоп)
  - Аватар (circular, 80px мобиль / 96px десктоп) — перекрывает нижний край cover
  - Имя (Cormorant, text-3xl), специальность (sans, text-base, text-muted), город
  - Рейтинг + количество отзывов (иконка звезды + числа)
  - Sticky кнопка "Записаться" (primary, lg, w-full) — всегда видна при скролле

Вкладки:
  1. Услуги (список с ценами + длительностью)
  2. Портфолио (3-колоночная фотосетка)
  3. Отзывы (список с аватарами и датами)
  4. О мастере (краткое bio + контакты)

Сигналы доверия (above the fold):
  - "X записей" в год
  - Verified badge
  - "Отвечает в течение 1 часа"
```

### Флоу бронирования (`/master/[username]/book`)

```
Прогресс: Step 1 of 4 — горизонтальный прогресс-бар сверху

Шаг 1: Выбор услуги
  - Список услуг из профиля
  - Radio selection или highlighted card

Шаг 2: Выбор даты
  - Полноэкранный календарь (bb-calendar)
  - Доступные даты подсвечены

Шаг 3: Выбор времени
  - Сетка слотов (3 колонки), минимум 44px высота
  - Занятые слоты: opacity-40, strike-through, не кликабельны

Шаг 4: Подтверждение + контакты
  - Summary: мастер, услуга, дата, время, цена
  - Поля: имя, телефон (опционально — уже из профиля Clerk)
  - Кнопка "Подтвердить запись"

После подтверждения:
  - Checkmark animation (300ms draw)
  - Toast уведомление
  - Redirect на /client/bookings
```

### Дашборд мастера (`/dashboard`)

```
Мобиль: Вертикальный скролл
Десктоп: Sidebar navigation + main content area

KPI Cards (top row — самое важное):
  - Сегодня: X записей, Х ₽
  - Ожидают подтверждения: X (если > 0, badge пульсирует)
  - Этот месяц: X ₽

Ближайшие записи:
  - Список сегодняшних записей по времени
  - Каждая запись: время + имя клиента + услуга + статус badge
  - Quick actions: подтвердить, отменить, написать клиенту

Быстрые действия (FAB на мобиле):
  - "Добавить запись" (ручное создание)
  - "Заблокировать время"

Навигация в дашборде:
  - Расписание (Calendar view)
  - Услуги (CRUD)
  - Клиенты (список)
  - Аналитика (графики)
  - Профиль (редактирование)
  - Настройки
```

### Telegram Mini App (`/tma/*`)

```
Специфика TMA:
  - Использовать цвета из Telegram theme variables когда возможно
  - Нет header/footer — TMA предоставляет свой chrome
  - Main button через Telegram WebApp API (не наша кнопка)
  - Уменьшить padding: p-3 вместо p-4, compact cards
  - Back button через Telegram BackButton API
```

---

## 12. Доступность

- **Контрастность:** Минимум 4.5:1 для body text, 3:1 для крупных заголовков и UI-элементов
- **Focus rings:** Всегда видимы (`ring-2 ring-primary-500 ring-offset-2`), не скрывать через `outline-none` без альтернативы
- **Alt-текст:** Все изображения мастеров и портфолио должны иметь alt-атрибут
- **ARIA:** Использовать семантические роли, особенно для навигации, боттом-шитов и диалогов
- **prefers-reduced-motion:** Отключать все CSS-анимации

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 13. Что делать и что не делать

### Делать

- Один CTA на экран, всегда `primary`
- Карточки мастеров с фото-dominant layout (фото > 50% высоты)
- Тёплые тона (#FAF8F5 фон вместо чисто белого)
- Serif (Cormorant) для заголовков, sans (Plus Jakarta) для UI
- 44px минимум для touch-таргетов
- Bottom sheet для мобильных быстрых действий
- Skeleton/shimmer для загрузки
- Кнопка «Записаться» всегда sticky и видимая на профиле мастера

### Не делать

- НЕ использовать `font-bold` для Cormorant Garamond (только `font-light` или `font-normal`)
- НЕ писать ALL CAPS для кнопок и навигации
- НЕ размещать два `solid` CTA рядом
- НЕ использовать чистый `#000000` для текста
- НЕ использовать холодные серые как neutral (только warm stone)
- НЕ добавлять Tailwind `purple` — он конфликтует с нашей палитрой и ассоциируется с generic AI
- НЕ использовать `animate-bounce` — только `ease-out` transitions
- НЕ прятать `outline` без альтернативы для accessibility
- НЕ делать карточку со списком 10+ элементов — использовать pagination
- НЕ просить телефон/email до того, как пользователь готов бронировать

---

## Файлы конфигурации

| Файл | Назначение |
|---|---|
| `app/assets/css/main.css` | Tailwind + Nuxt UI imports, @theme tokens, кастомные CSS |
| `app/app.config.ts` | Nuxt UI цвета и дефолты компонентов |
| `nuxt.config.ts` | Регистрация доп. semantic colors |

---

*Последнее обновление: 2026-03-13. При изменении дизайн-системы обновлять этот файл.*
