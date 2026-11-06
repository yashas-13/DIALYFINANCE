# Daily Collection Admin

> A mobile-first, one-handed collection management and microfinance operating system designed for field loan officers and administrators. Built with React 19, TypeScript, Tailwind CSS v4, Express, and full-stack Apple iOS Web Push (APNs).

---

## Table of Contents

- [Key Features](#key-features)
- [Operator Credentials](#operator-credentials)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Apple iOS PWA & Push Notification Setup](#apple-ios-pwa--push-notification-setup)
- [Operational Lending Models](#operational-lending-models)
- [Project Architecture](#project-architecture)
- [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Key Features

- **Mobile-First One-Handed Ergonomics**: Designed for field agents operating on scooters or holding cash clipboards. All interactive buttons, tabs, and list rows maintain minimum **44px touch targets**.
- **Zero Floating-Point Financial Precision**: All currency amounts are stored and calculated in integer units (**Paise**) to eliminate rounding discrepancies between physical cash and the digital ledger.
- **Upfront Deduction Discounting Loans**: Supports upfront interest/fee deduction at loan disbursement (*e.g., Sanction ₹10,000 $\rightarrow$ Deduct ₹2,000 $\rightarrow$ Disburse ₹8,000 Net Cash $\rightarrow$ Collect 10 weekly installments of ₹1,000*), in addition to Flat Rate and Reducing Balance (EMI) loans.
- **One-Tap Daily Collection Terminal**: High-speed operator view with date picker, route filters (Due / Paid / Partial / Overdue), and a 5-second collection drawer.
- **Verifiable Receipts & WhatsApp Integration**: Auto-sequenced voucher numbers (`RCP-26-XXXX`), printable thermal receipts, and instant formatted WhatsApp payment confirmations.
- **Apple iOS Push Notifications (APNs)**: Compliant with Apple's iOS 16.4+ Web Push specifications (RFC 8291/8292 VAPID). Features Web Audio synthesized Apple Tri-tone chime (`G5 -> B5 -> D6`), 5s/10s lockscreen testing timers, and deep-link notification routing.
- **In-App 9-Module Feature Guide**: Accessible via the **"Guide"** button in the top navigation bar, featuring searchable step-by-step instructions for every core feature.
- **Clean Slate Database & Backup**: Starts fresh with clean empty states. Supports full JSON database export/import and tamper-evident audit logging.

---

## Operator Credentials

The application enforces secure authentication on launch:

| Field | Value |
| :--- | :--- |
| **Username** | `akash` |
| **Password** | `saanvi` |
| **Role** | Super Admin |

*Note: For quick field testing, a "Fill Credentials" button is available directly on the login card. The system locks out after 5 consecutive failed attempts to prevent brute-force attacks.*

---

## Prerequisites

Before installing, ensure your environment meets the following requirements:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+ included with Node) or `yarn` / `pnpm`
- **Modern Web Browser**: Chrome, Safari 16.4+, Edge, or Firefox

---

## Installation & Setup

### 1. Clone or Extract the Project

```bash
# Clone the repository (or extract the project zip)
git clone <repository-url>
cd daily-collection-admin
```

### 2. Install Dependencies

Install all required production and development dependencies:

```bash
npm install
```

This installs:
- Core UI: `react`, `react-dom`, `lucide-react`, `motion`, `@tailwindcss/vite`, `tailwindcss`
- Backend: `express`, `web-push`, `dotenv`, `tsx`
- Build & Types: `vite`, `typescript`, `@types/node`, `@types/express`, `@types/web-push`

### 3. Configure Environment Variables (Optional)

Copy the example environment template:

```bash
cp .env.example .env
```

The application runs out-of-the-box with default local storage and local VAPID keys. If configuring AI Studio or custom domains, update `.env`:

```env
# Optional: GEMINI_API_KEY for server-side AI integrations
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Host URL for self-referential links (defaults to current host)
APP_URL="http://localhost:3000"
```

---

## Running the Application

### Development Mode

Runs the Express full-stack server on port **3000** with Vite middleware mounted:

```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

### Building for Production

Compile the TypeScript code and bundle the Vite frontend:

```bash
npm run build
```

The production assets will be generated in the `/dist` directory.

### Running in Production

Start the production Node.js server using `tsx`:

```bash
npm start
```

### Code Quality & Type Checking

Run the TypeScript compiler in check mode (`noEmit`) to verify types:

```bash
npm run lint
```

---

## Apple iOS PWA & Push Notification Setup

To receive real APNs Push Notifications on an iPhone or iPad, Apple requires the web app to run in **Standalone Mode from the Home Screen** (available on iOS 16.4 or later).

### Step-by-Step iOS Installation:

1. **Open Safari on iPhone**: Navigate to your hosted application URL (e.g., `https://your-domain.run.app`).
2. **Add to Home Screen**:
   - Tap the Safari **Share** button (the square icon with an upward arrow).
   - Scroll down and tap **"Add to Home Screen"**.
   - Tap **"Add"** in the top-right corner.
3. **Launch from Home Screen**:
   - Tap the newly created **DailyCollect** app icon on your iOS home screen.
   - The app now launches in standalone fullscreen mode without Safari browser chrome.
4. **Enable Notifications**:
   - Log in using username `akash` and password `saanvi`.
   - Tap the **"iOS Push"** button in the top navigation bar.
   - Switch to the **"iOS Setup & Diagnostics"** tab and tap **"Enable Notifications"**.
   - Tap **"Allow"** on the Apple iOS permission prompt.
5. **Test Lock Screen Alerts**:
   - Switch to the **"Quick Triggers"** tab in the push modal.
   - Tap **"Test in 5s (Lock Screen)"** on the *Overdue Account Alert*.
   - Immediately press your iPhone's side button to lock the screen.
   - After 5 seconds, your iPhone will wake with the banner and play the Apple Tri-tone chime.

---

## Operational Lending Models

The application natively supports 3 microfinance lending structures:

### 1. Upfront Deduction (Disburse Net Cash, Repay Face Value)
*Ideal for micro-credit, weekly market vendor loans, and merchant advances.*
- **Sanctioned Face Value**: ₹10,000
- **Upfront Deduction Rate**: 20% (₹2,000 deducted upfront for interest/processing)
- **Net Cash Handed to Borrower**: ₹8,000
- **Total Repayable**: ₹10,000 across 10 weekly collections of ₹1,000.
- **Formula**: `Net Disbursed = Sanctioned - Upfront Deduction`
- **Next-Day Collection Schedule**: If disbursed today, Installment #1 is automatically scheduled for the **next day** (tomorrow). For weekly loans, subsequent installments recur every 7 days on that same weekday (*e.g., disbursed Friday $\rightarrow$ 1st due Saturday [next day] $\rightarrow$ 2nd due Saturday [+7d] $\rightarrow$ 3rd due Saturday [+14d]*).

### 2. Daily & Weekly Automated Due Date Calculation
- **Daily Repayment Loans**: Disbursed on Date $T$ $\rightarrow$ Installment #1 is due on $T+1$ (the next day), Installment #2 on $T+2$, etc.
- **Weekly Repayment Loans**: Disbursed on Date $T$ $\rightarrow$ Installment #1 is due on $T+1$ (the next day), Installment #2 on $T+8$ (+7 days), Installment #3 on $T+15$ (+14 days), recurring on that assigned weekday.
- **Auto-Assigned Collection Slot**: The loan form automatically determines and sets the collection slot (*e.g., "Every Saturday"*).
- **Manual Customization**: Operators can inspect the 3-step sequence preview and adjust the 1st due date if needed.
- Interest is calculated across the entire tenure up-front:
  `Total Interest = Principal × (Annual Rate / 100) × (Tenure in Years)`
- Installments are split evenly across days, weeks, or months.

### 3. Reducing Balance (EMI)
- Standard amortization schedule where interest is charged on the declining principal balance after each repayment.

---

## Project Architecture

```
├── index.html                   # HTML entry point with iOS PWA meta tags
├── package.json                 # Project dependencies and npm scripts
├── server.ts                    # Express server with Vite middleware & web-push APNs endpoints
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4 plugin
├── public/
│   ├── manifest.webmanifest     # Standalone PWA manifest
│   ├── sw.js                    # Service worker handling push & notificationclick events
│   ├── apple-touch-icon.png     # iOS home screen touch icon (180x180)
│   ├── pwa-192x192.png          # PWA 192px icon
│   ├── pwa-512x512.png          # PWA 512px icon
│   └── icon.svg                 # SVG brand icon
└── src/
    ├── main.tsx                 # React DOM root entry point
    ├── App.tsx                  # Top-level state, authentication & modal coordinator
    ├── index.css                # Global styles with Tailwind CSS v4 & custom dark mode
    ├── types.ts                 # TypeScript interfaces for borrowers, loans, receipts & settings
    ├── services/
    │   ├── storage.ts           # Local encrypted storage with clean slate & demo seeding
    │   └── pushService.ts       # Web Push API, APNs client & Apple Tri-tone audio synthesizer
    ├── utils/
    │   ├── finance.ts           # Financial math (Paise conversion, loan schedules, upfront deduction)
    │   └── finance.test.ts      # Unit tests for financial calculations
    └── components/
        ├── LoginView.tsx               # Login screen (credentials: akash / saanvi)
        ├── TopNav.tsx                  # Header with search, User Guide, iOS Push & theme switch
        ├── BottomTabBar.tsx            # Thumb-accessible navigation anchor
        ├── DashboardView.tsx           # Daily KPI summary & clean-slate onboarding card
        ├── FeatureInstructionsModal.tsx# Comprehensive 9-module interactive user guide
        ├── IOSPushNotificationModal.tsx# Apple push control center & trigger simulator
        ├── IOSPushBanner.tsx           # Floating iOS dynamic island banner with sound
        ├── BorrowersView.tsx           # Customer directory with WhatsApp/Call triggers
        ├── AddEditBorrowerModal.tsx    # Customer registration & KYC
        ├── BorrowerDetailModal.tsx     # Borrower account ledger & contact hub
        ├── LoansView.tsx               # Loan portfolio manager
        ├── CreateLoanModal.tsx         # Loan calculator (Upfront Deduction, Flat, Reducing)
        ├── LoanDetailModal.tsx         # Repayment schedule & closure
        ├── DailyCollectionView.tsx     # Fast field collection operator terminal
        ├── RecordPaymentModal.tsx      # Payment submission drawer
        ├── PaymentReceiptModal.tsx     # Printable voucher & WhatsApp share
        ├── PaymentHistoryView.tsx      # Transaction search & export
        ├── PendingOverdueView.tsx      # Delinquent account recovery manager
        ├── ReportsView.tsx             # Daily collection sheets & cashflow metrics
        ├── ExpensesView.tsx            # Operational field expenditure logger
        ├── NotificationsModal.tsx      # System alerts drawer
        ├── AdminSettingsView.tsx       # Business profile, backups & demo reset controls
        └── AuditLogView.tsx            # Immutable security activity ledger
```

---

## Troubleshooting & FAQ

### 1. I forgot the password. What are the credentials?
The operator username is `akash` and the password is `saanvi`. You can click the **"Fill Credentials"** button on the login screen to automatically fill them.

### 2. How do I start with an empty database vs. load demo data?
- The application boots by default with a **clean operational slate** (0 customers, 0 loans).
- To load realistic sample records for staff training, go to **Settings ➔ Data Management ➔ Load Sample Demo Data**.
- To wipe everything back to a clean slate, tap **Settings ➔ Data Management ➔ Reset to Clean Slate**.

### 3. How do I take backups?
Navigate to **Settings ➔ Data Management ➔ Export JSON Backup**. This downloads an uncompressed, encrypted JSON file with all customer records, contracts, receipts, and audit logs. You can restore this file on any device by tapping **Restore Backup JSON**.

### 4. Why aren't push notifications appearing on my iPhone?
Apple requires Web Push apps to be added to the iOS Home Screen first:
1. Ensure your iPhone is on **iOS 16.4 or newer**.
2. You must open the app in **Safari** and tap **Share ➔ Add to Home Screen**.
3. Open the app from the **Home Screen icon** (not inside Safari browser tabs).
4. Tap **iOS Push** in the top navigation bar and grant notification permissions.

---

## License

Apache-2.0. Built for microfinance operators and daily loan collectors.
