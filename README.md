<section>
  <h2>Fintor</h2>
  <p>
    Fintor is a personal finance management application designed to help users gain
    full visibility and control over their money.
  </p>

  <p>The app allows you to:</p>
  <ul>
    <li>Create and manage multiple accounts (bank accounts, cash, savings, etc.)</li>
    <li>Track one-time and recurring income</li>
    <li>Register recurring transactions and fixed expenses</li>
    <li>Add categorized expenses linked to specific accounts</li>
    <li>Create financial goals (e.g., Buy a car, Buy a house, Travel)</li>
    <li>Allocate funds from accounts to goals while keeping balances clearly separated</li>
    <li>Visualize financial data through charts and summaries</li>
  </ul>

  <p>
    Fintor differentiates between <strong>available money</strong> and
    <strong>allocated money</strong>, so users always know what can be spent and what
    is already committed.
  </p>

  <p>
    The goal of the project is to provide a clear, structured, and practical tool for
    personal financial planning, with a strong focus on usability, transparency, and
    long-term financial organization.
  </p>
</section>

## Environment setup

1. Duplicate `.env.example` as `.env`.
2. Update `EXPO_PUBLIC_API_BASE_URL` with your backend URL.
3. Restart Expo (`npm run start`) to load the new value.

Current API calls in `services/auth.service.ts` now use this env variable.

## API endpoints used

With `EXPO_PUBLIC_API_BASE_URL`, services call these routes:

- `POST /auth/login`
- `POST /users/add`
- `GET /dashboard`
- `GET /goals`
- `GET /profile`
- `GET /transactions`

## Internationalization (i18n)

The app uses `i18next` + `react-i18next` with Expo localization.

- Initialization: `i18n/index.ts`
- Translation resources: `i18n/resources/en.ts` and `i18n/resources/es.ts`
- Typed keys: `i18n/react-i18next.d.ts`

### How language is resolved

1. First, it loads the saved language from AsyncStorage (`app.language`).
2. If there is no saved preference, it uses device locale via `expo-localization`.
3. Fallback language is English (`en`).

### How to add new translations

1. Add the same key in both `en.ts` and `es.ts`.
2. Use `const { t } = useTranslation()` in screens/components.
3. Replace hardcoded strings with `t("your.key")`.

### Runtime switch

The profile screen includes a simple language switch (Español / English), and language changes are persisted automatically.
