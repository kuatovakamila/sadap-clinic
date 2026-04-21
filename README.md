# SADAP Clinic

Веб-приложение клиники на **Next.js 16** с лендингом, страницами врачей и услуг, SMS OTP-аутентификацией, личным кабинетом и записями на приём.

## О проекте

Проект состоит из одного workspace-приложения `client` и разворачивается как Next.js App Router приложение.

Ключевые возможности:
- Лендинг и контентные страницы (о клинике, услуги, врачи, отзывы, новости)
- Детальные страницы врача и услуги по `slug`
- Авторизация по номеру телефона через OTP (SMSC)
- Профиль пользователя
- Создание и просмотр записей на приём
- Интеграция с Supabase (Auth + PostgreSQL + Storage)

## Технологии

- Next.js 16 (App Router)
- React 19
- ESLint 9 + eslint-config-next
- Supabase (`@supabase/supabase-js`)
- SMSC.kz (отправка OTP)

## Структура репозитория

```text
.
├── client/                     # Основное Next.js приложение
│   ├── src/app/                # Страницы и API-роуты
│   ├── src/lib/                # Supabase клиенты и SQL-миграции
│   └── public/                 # Статические файлы
├── SUPABASE_SETUP.md           # Подробная настройка Supabase + Vercel
├── SUPABASE_IMAGES_FIX.md      # Исправление доступа к изображениям Supabase
├── package.json                # Корневые скрипты workspace
└── vercel.json                 # Конфигурация Vercel
```

## Основные маршруты

- `/` — главная страница
- `/services`, `/services/[slug]` — услуги
- `/doctors`, `/doctors/[slug]` — врачи
- `/auth` — вход/регистрация по OTP
- `/profile` — личный кабинет
- `/appointments` — записи пользователя
- `/news`, `/reviews`, `/reviews-page`, `/aboutUs`

## API маршруты (App Router)

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/doctors`
- `GET /api/doctors/[slug]`
- `GET /api/services/[slug]`
- `POST /api/appointments/create`
- `GET /api/appointments/get?userId=...`

## Требования

- Node.js 20+
- npm
- Проект Supabase
- Доступ к SMSC.kz

## Переменные окружения

Создайте файл `client/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SMSC_LOGIN=<smsc-login>
SMSC_PASSWORD=<smsc-password>
```

## Установка

Из корня репозитория:

```bash
npm install
```

Или через скрипт сборки (он сам установит зависимости в `client`):

```bash
npm run build
```

## Запуск

### Development

```bash
npm run dev
```

Откройте: `http://localhost:3000`

### Production build

```bash
npm run build
npm run start
```

## Линтинг

```bash
cd client
npm run lint
```

## База данных (Supabase)

SQL-файлы в `client/src/lib/`:
- `supabase-migrations.sql` — таблицы `profiles`, `appointments` и RLS
- `services-migration.sql` — таблица `services` и политики
- `supabase-storage-policies.sql` — политики для Storage

Примените их через Supabase SQL Editor.

## Деплой

Проект подготовлен под Vercel (`vercel.json`).

Подробные инструкции:
- `SUPABASE_SETUP.md`
- `SUPABASE_IMAGES_FIX.md`

## Примечания

- Интерфейс ориентирован на русскоязычный контент.
- `next.config.mjs` уже настроен для загрузки изображений из Supabase Storage.
