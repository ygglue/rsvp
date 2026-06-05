# AGENTS.md

> **Attention AI Developer Agents:** This file serves as your guide and project-specific instructions for developing, maintaining, and testing this RSVP application. Review these guidelines completely before performing any tasks or making modifications.

---

## 1. Project Overview & Architecture

This is a single-event RSVP application designed to allow guests to RSVP for an event. It features public client forms, strict email validation, and a password-gated administration dashboard.

### Tech Stack
- **Framework:** Next.js 16.2 (App Router)
- **Runtime & Language:** Node.js, TypeScript, React 19
- **Package Manager:** `pnpm`
- **Database:** SQLite (via Turso client)
- **Email Delivery:** Resend API (6.12.3)
- **Styling:** Tailwind CSS 4.0 (via `@tailwindcss/postcss`)
- **Testing Framework:** Vitest (4.1.7)

### Routing & Views
- **`/` — Public RSVP Form:** Public landing page. Prompts guests for their `name` and `email` using client-side and server-side validation, writes the entry to SQLite (via Turso client), triggers a Resend confirmation email, and redirects to success.
- **`/success` — Success Page:** A public confirmation message acknowledging receipt of the guest's RSVP.
- **`/admin` — Dashboard:** Inline password verification against the host-configured `ADMIN_PASSWORD` env variable. Authenticates via a session cookie (`admin_authed`) and renders a chronological table of all submitted RSVPs.

---

## 2. Command Reference

Use these scripts from the root directory for development, testing, and building:

```bash
# Start the development server
pnpm dev

# Run unit tests synchronously (one-shot run)
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Build production bundle
pnpm build

# Start production server locally
pnpm start
```

---

## 3. Boundaries & The Three-Tier Model

### Always Do
- **Strict Validations:** Perform both client-side and server-side validation for RSVPs. Every submitted email **must** pass syntax check AND a real-world domain MX record lookup via `dns.resolveMx`.
- **Server Actions:** Secure database operations, authentication, and external service requests inside Next.js Server Actions (marked with `"use server";` at the top of the file) located in `src/lib/actions.ts`.
- **Database Access:** Utilize the Turso client defined in `src/lib/db.ts`.
- **Tailwind v4 Conventions:** Use standard utility classes in styling. Tailor colors, gradients, and micro-animations to keep the design premium and modern.
- **Unit Testing:** Maintain testing coverage. For every validation change or new action, add corresponding tests in the `__tests__/` directory.

### Ask First
- **New Dependencies:** Consult before introducing additional npm packages.
- **Feature Creep:** Check before adding guest count, plus-ones, meal preferences, or multi-event features.

### Never Do
- **Hardcoded Secrets:** Do **not** commit credentials, API keys, or raw passwords. Always fetch configuration from `process.env`.
- **Direct DB Queries in Components:** Never perform SQL operations directly inside React Components; route all requests through server actions in `src/lib/actions.ts`.
- **Unvalidated Email Delivery:** Never skip the domain check or MX verification. This keeps invalid email submissions out of the database and prevents spamming the Resend quota.
- **Session DB Storage:** Do not use database session stores or complex auth models (e.g., Auth.js / NextAuth). Authentication must remain thin, lightweight, and session-cookie-based.

---

## 4. Project Structure

```
rsvp/
├── .env.local             # Environment configurations (not committed)
├── __tests__/             # Vitest test suites
│   ├── actions.test.ts    # Server actions unit tests (mocked db/headers)
│   └── validation.test.ts # Input validation utilities test
├── src/
│   ├── app/               # Next.js App Router folders
│   │   ├── admin/         # Admin login & RSVP table
│   │   ├── success/       # Success state landing page
│   │   ├── layout.tsx     # Global layout & metadata configuration
│   │   └── page.tsx       # RSVP public form homepage
│   ├── data/              # Static data definitions
│   │   └── flowers.ts
│   ├── lib/               # Shared logic & services
│   │   ├── actions.ts     # Next.js Server Actions (submit, auth, fetch)
│   │   ├── db.ts          # SQLite/Turso database client
│   │   ├── email.ts       # Resend client mailer utility
│   │   └── validation.ts  # Regex syntax & domain MX record checking
├── postcss.config.mjs     # PostCSS configuration for TailwindCSS v4
├── tsconfig.json          # TypeScript configurations
├── vitest.config.ts       # Testing framework configuration
└── package.json           # Scripts & dependency definitions
```

---

## 5. Code Style & Standards

### Client-Server Boundaries
Keep your UI components lightweight and focused on state presentation. Leverage Server Actions for any backend operations.

#### Server Action Example (`src/lib/actions.ts`)
```typescript
"use server";

import { client } from "@/lib/db";
import { validateEmail } from "@/lib/validation";

export async function exampleAction(data: { email: string }) {
  const check = await validateEmail(data.email);
  if (!check.valid) return { success: false, error: check.error };

  try {
    await client.execute({
      sql: "INSERT INTO rsvps (email) VALUES (?)",
      args: [data.email],
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: "Database error" };
  }
}
```

### TypeScript Usage
- Define exact interfaces for Server Action payloads and returns.
- Use path aliases (e.g. `@/*` pointing to `./src/*`) for cleaner imports.

---

## 6. Testing Guidelines

Tests are written using **Vitest**. We leverage mock utilities to isolate logic from direct database connectivity and cookie manipulation.

### Action Mocking Architecture
When testing server actions, ensure that `db` client and `next/headers` cookie stores are fully mocked:

```typescript
import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  client: {
    execute: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: "true" }),
    delete: vi.fn(),
  }),
}));
```

Always verify tests pass cleanly prior to requesting a PR review or committing changes:
```bash
pnpm test
```
