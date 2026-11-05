# Implementation Plan: Operator Authentication, Clean Slate Database, and Interactive Feature Instruction System

Secure the Daily Collection Admin application with mandatory credentials (`akash` / `saanvi`), clear demo seeded data to establish a pristine zero-state operational environment, and introduce a comprehensive, interactive user guide system across all core features.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and architectural choices have been confirmed through Phase 1 clarification:
> - **Login Credentials**: Username `akash` and password `saanvi`. The application will always present the login screen on launch/refresh.
> - **Database State**: Cleared of demo records on launch to start fresh with clean empty states, while retaining an optional "Restore Sample Data" button in Settings for operator training.
> - **Feature Guidance**: Interactive guide modal and contextual help triggers integrated directly on every feature screen, plus a dedicated guide launcher in the main navigation.

- **Confirmed Decision 1**: Login credentials are set to `akash` and `saanvi`, with locked-out attempt protection (5 attempts maximum) and security audit tracking.
- **Confirmed Decision 2**: Storage resets to clean empty arrays for borrowers, loans, payments, and expenses, with graceful empty states prompting the operator to disburse their first loan or record their first customer.
- **Confirmed Decision 3**: A multi-tab interactive instruction center (`FeatureInstructionsModal.tsx`) with workflow walkthroughs, step-by-step checklists, operational tips, and deep-link shortcuts to directly try each feature.

---

## 1. Overview & Core Concept

- **What It Does**: 
  1. Enforces secure admin authentication requiring username `akash` and password `saanvi` on every app launch.
  2. Boots the microfinance ledger into a clean, empty operational state with zero dummy borrowers or payments, ready for real field operations.
  3. Provides an interactive, in-app user training guide covering all 9 operational modules (Dashboard, Borrowers, Upfront Deduction Loans, Daily Collections, Receipts, Overdue Follow-ups, Financial Reports, Expenses, and iOS Push Notifications).
- **Target Audience / Persona**: Microfinance managers, daily collection agents, and loan officers in India operating on mobile devices under outdoor daylight conditions.
- **Key Value**: Immediate security and privacy for the owner's genuine business records, no clutter from dummy test data, and zero learning curve for field agents through step-by-step feature guides.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Authentication Flow**:
   - The user opens the app $\rightarrow$ The sleek slate-900 login screen appears immediately.
   - User enters `akash` and `saanvi` (with toggleable password visibility and single-tap credential auto-fill).
   - Upon submitting, the credentials validate instantly, logging the admin in as **Akash** (`super_admin`), recording a security audit log event, and transitioning to the Dashboard.

2. **Clean Slate Exploration**:
   - The dashboard opens with zeroed metrics (₹0 Today's Collection, 0 Active Borrowers, 0 Active Loans, 0 Overdue).
   - Clean, friendly empty state banners explain how to register the first customer and issue the first loan.
   - If an agent wants to explore with demo figures, an alert banner in Settings or Dashboard allows one-tap "Load Sample Demo Data".

3. **Feature Instruction & Training Walkthrough**:
   - User taps the **"Guide" / "?"** button in the top navigation or on any feature header (e.g., *How does Upfront Deduction work?* on the Create Loan screen).
   - An interactive modal appears, pre-selected to the relevant feature guide.
   - The guide displays:
     - Clear business concept explanation (e.g. *₹10,000 Sanctioned $\rightarrow$ ₹8,000 Disbursed $\rightarrow$ 10 Weekly Collections of ₹1,000*).
     - Step-by-step visual workflow checklist with operational tips.
     - "Try It Now" button that closes the guide and directly opens the appropriate modal or tab.

### Visual Identity & Theme

- **Palette**: Emerald-600 primary (`#059669`) with Slate-900/950 backdrop, high-contrast white surfaces, and dark mode compensation.
- **Typography**: Display typography using **Plus Jakarta Sans**, body copy in high-legibility sans, and all monetary values rendered in **JetBrains Mono** with `tabular-nums` formatting.
- **Touch Targets**: Strictly $\ge 44\text{px}$ touch hitboxes optimized for one-handed mobile use.
- **Anti-Slop Discipline**: Zero pill-badge sandwiches, unboxed metadata separators (`·`), no fake telemetry tickers, and natural title case throughout.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage Version Migration (`dca_initialized_v2`)**
  - *Chosen Approach*: Bump the initialization key from `v1` to `v2` in `CollectionStorage` to automatically wipe old mock borrowers/loans on current browsers while preserving the clean slate.
  - *Why*: Ensures returning users and preview instances don't retain the previous turn's demo accounts.
  - *Alternatives Considered*: Manual user wipe button only. Rejected because the user specifically requested to clear seeded demo data.

- **Decision 2: Contextual Help Triggers vs. Single Help Page**
  - *Chosen Approach*: A centralized modal with tabbed guides, combined with contextual `?` buttons in `TopNav`, `CreateLoanModal`, `DailyCollectionView`, and `AdminSettingsView`.
  - *Why*: Allows field agents to get instant answers without leaving their active form or losing input data.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Root (App.tsx)                              │
│  State: isAuthenticated (default false), activeTab, storage entities   │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │                                  │
          [Not Authenticated]                    [Authenticated]
                    │                                  │
                    ▼                                  ▼
         ┌─────────────────────┐            ┌───────────────────────────┐
         │     LoginView       │            │         TopNav            │
         │ user: akash         │            │  - User Guide (?) Button  │
         │ pass: saanvi        │            │  - iOS Push Trigger       │
         │ locked attempt limit│            │  - Dark Mode & Profile    │
         └─────────────────────┘            └─────────────┬─────────────┘
                                                          │
          ┌───────────────────────────────────────────────┴───────────────┐
          │                                                               │
          ▼                                                               ▼
┌───────────────────────┐                                     ┌───────────────────────┐
│     Active Views      │                                     │ FeatureInstructions   │
│ - Dashboard (Empty)   │ ◄──── [Contextual Help Triggers] ── │ Modal (All 9 Modules) │
│ - Borrowers (Empty)   │                                     │ - Step-by-Step guides │
│ - Loans (Upfront calc)│                                     │ - Upfront Loan guide  │
│ - Collections (Daily) │                                     │ - Push & Receipts guide│
│ - Settings (Restore)  │                                     │ - "Try It Now" actions│
└───────────────────────┘                                     └───────────────────────┘
```

### Components & Services to Update

1. `src/services/storage.ts`:
   - Set `DEFAULT_ADMIN` to name `Akash`, username `akash`, email `akash@dailycollect.com`.
   - Update `initialize()` with `dca_initialized_v2` to initialize empty arrays by default.
   - Retain `resetToDemo()` for optional sample loading in Settings.
   - Add `clearAllData()` helper for full zero-state wiping.

2. `src/components/LoginView.tsx`:
   - Enforce authentication check: `username.trim().toLowerCase() === 'akash' && password === 'saanvi'`.
   - Update demo credentials hint to `akash / saanvi`.
   - Reset failed attempts and lockouts cleanly.

3. `src/App.tsx`:
   - Initialize `isAuthenticated` to `false` so the app strictly opens on the login screen.
   - Add state `showInstructionsModal` and `instructionInitialTab`.
   - Pass `onOpenInstructions={(tab) => ...}` to `TopNav` and view components.
   - Render `FeatureInstructionsModal` when active.

4. `src/components/FeatureInstructionsModal.tsx`:
   - New comprehensive guide modal covering all 9 core operational modules with step-by-step instructions, diagrams, tips, and direct launch actions.

5. `src/components/TopNav.tsx` & View Empty States:
   - Add **Guide** button in `TopNav`.
   - Ensure clean empty state layouts in `DashboardView`, `BorrowersView`, `LoansView`, and `DailyCollectionView`.

---

## 5. Verification Plan

1. **Compilation & Linting**:
   - Run `compile_applet` and `lint_applet` together to verify 0 errors.
2. **Login Screen Testing**:
   - Launch app $\rightarrow$ Verify login screen is displayed.
   - Test invalid credentials $\rightarrow$ Verify error message and attempt countdown.
   - Test `akash` / `saanvi` $\rightarrow$ Verify instant login success.
3. **Clean Database Verification**:
   - Verify 0 borrowers, 0 loans, 0 collections on fresh login.
   - Verify empty state callouts and sample load option in Settings.
4. **Instruction Modal Verification**:
   - Open Guide from TopNav $\rightarrow$ Switch between all feature tabs.
   - Verify Upfront Deduction Loan guide explains ₹10k sanction / ₹8k net / ₹1k weekly.
   - Click "Try It Now" $\rightarrow$ Verify proper view opens seamlessly.
