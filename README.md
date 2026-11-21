# MedCamp OS (MedComp)

**High-Velocity Multi-Tenant Digital Operating System for Community Medical Camps**

![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

---

## 1. Executive Summary & Real-World Problem

### The Problem in Community Healthcare Camps
Community medical outreach camps in India frequently process **500 to 2,000+ patients in a single 8-hour window**. Traditional operations suffer from critical vulnerabilities:
- **Paper Record Chaos:** Handwritten slips get lost, water-damaged, or illegibly transcribed.
- **Triage Bottlenecks:** Vitals intake (BP, pulse, height, weight) bottlenecks at the entrance.
- **Medication Stockouts:** When a pharmacy runs out of a prescribed drug, patients are forced to physically hike back across crowded grounds to locate the consulting physician for an alternative prescription.
- **Zero Record Continuity:** Once the camp wraps up, patients leave with fragile paper slips that are discarded, eliminating follow-up care continuity.

### The MedCamp OS Solution
**MedCamp OS** digitizes the entire camp lifecycle into a synchronized, paperless clinical assembly line:
1. **QR-Gated Mobile Self-Registration:** Patients scan a physical QR standee at the gate to register on their smartphones, receiving an atomic sequential token (e.g., `#101`, `#102`).
2. **Nurse Triage Terminal:** Nurses query tokens or pick cards from a real-time auto-polling sidebar to log vitals with strict systolic/diastolic BP formatting.
3. **Doctor Clinical Desk:** Physicians access vitals, click one-tap symptom presets, chart diagnoses, and issue structured prescriptions with automatic speed macros (`101` $\rightarrow$ `1-0-1`).
4. **Pharmacy Dispensation Counter:** Pharmacists fulfill prescriptions via a verified safety checklist or trigger the **Out-of-Stock Loop** to instantly re-route the patient to the doctor.
5. **A4 Medical Report Canvas:** Generates an official, hospital-branded digital summary with an ink-saving print layout for physical archiving.
6. **Public TV Display Board:** Displays live token queues on waiting-area monitors across all three clinical stations.

---

## 2. Technology Stack & Architectural Blueprint

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Station Terminals"]
        PReg["Patient Phone\n(/[campCode]/register)"]
        NT["Nurse Terminal\n(/[campCode]/nurse)"]
        DT["Doctor Terminal\n(/[campCode]/doctor)"]
        PT["Pharmacy Terminal\n(/[campCode]/pharmacy)"]
        TV["Waiting Hall TV\n(/[campCode]/display)"]
        PR["Patient Report Canvas\n(/sample-report)"]
    end

    subgraph ServerLayer ["Next.js 14 App Router (Server Actions)"]
        SA["app/actions.ts\n(Input Validation, Auth, Mutations)"]
        Singleton["lib/prisma.ts\n(Prisma Connection Singleton)"]
    end

    subgraph DataLayer ["PostgreSQL Database (Prisma ORM)"]
        DB[("PostgreSQL\n(Organizations, Campaigns, Staff, Patients)")]
    end

    PReg -->|registerPatientAction| SA
    NT -->|updateVitalsAction| SA
    DT -->|saveDoctorConsultationAction| SA
    PT -->|completeDispensationAction\nmarkOutOfStockAction| SA
    TV -->|getLiveQueueAction| SA
    PR -->|getPatientStatusAction| SA

    SA --> Singleton
    Singleton --> DB
```

- **Frontend Framework:** Next.js 14 (App Router) with React 18, utilizing React Server Components (RSC) and Client Components with strict boundary isolation.
- **Styling & Design System:** Tailwind CSS with Google Outfit font typography, Lucide React icons, and a custom dark mode engine (`next-themes`).
- **Backend & API Layer:** Next.js Server Actions (`"use server"`), eliminating separate REST route overhead and providing type-safe mutations with zero client bundle leakage.
- **Database ORM:** Prisma ORM 5.22 with strict connection pooling singleton guards designed for cloud RDS scalability.
- **Security & Session Management:** Bcrypt password hashing (`salt=10`), HTTP-only 24-hour scoped session cookies, and multi-tenant schema isolation.

---

## 3. Database Schema & Multi-Tenancy Architecture

The database architecture is defined in `prisma/schema.prisma` and enforces strict multi-tenant scoping:

```mermaid
erDiagram
    Organization ||--o{ Campaign : hosts
    Campaign ||--o{ Staff : employs
    Campaign ||--o{ Patient : registers

    Organization {
        string id PK
        string name
        string chiefOrganizer
        string department
        datetime createdAt
    }

    Campaign {
        string id PK
        string campCode UK "Unique Camp Slug (e.g. APOLLO-01)"
        string slugToken "QR Standee Security Token"
        string status "ACTIVE | INACTIVE"
        string organizationId FK
        datetime createdAt
    }

    Staff {
        string id PK
        string staffId "Alphanumeric Staff ID (e.g. DOC01)"
        string name
        string role "DOCTOR | NURSE | PHARMACIST | ADMIN"
        string password "Bcrypt Hash"
        string deploymentId FK "Scoped to Camp"
    }

    Patient {
        string id PK
        int tokenNumber "Sequential Atomic Token (101, 102...)"
        string name
        int age
        string gender
        string phone "10-Digit Mobile"
        string status "REGISTERED | NURSE | DOCTOR | PHARMACY | COMPLETED"
        string height
        string weight
        string bloodPressure
        string pulse
        string symptoms
        string diagnosis
        string prescriptions "Structured JSON Array"
        string campaignId FK
        datetime createdAt
    }
```

### Multi-Tenancy Guarantees
- **Camp-Scoped Queries:** All mutations and queries require `campCode` or `campaignId`. No camp can access or modify patient files belonging to another camp.
- **Composite Staff Keys:** Staff identifiers (e.g., `DOC01`) are scoped to `deploymentId`, allowing identical staff IDs across separate medical camps without conflict.
- **Atomic Token Generation:** New patient tokens are issued inside `prisma.$transaction` blocks to prevent token collision during simultaneous patient check-ins.

---

## 4. Complete Application Route Directory

MedCamp OS contains 15 production-verified routes:

| Route | Role / Audience | Description |
| :--- | :--- | :--- |
| `/` | Public / Staff | Global landing portal with direct access to Staff Portals and Patient Report Lookup. |
| `/admin/setup` | Organization Admin | Institutional setup wizard to bootstrap new medical camps, provision initial staff, and generate QR codes. |
| `/[campCode]/login` | Healthcare Staff | Secure role-based staff authentication (Doctor, Nurse, Pharmacist, Admin) with redirect dispatching. |
| `/[campCode]/dashboard` | Camp Chief Organizer | Master administrative dashboard with camp kill-switch toggle, dynamic mid-camp staff provisioning, and real-time camp analytics. |
| `/[campCode]/register` | Patient (Mobile) | QR-gated mobile self-registration engine with 10-digit Indian phone validation and duplicate record reconciliation. |
| `/[campCode]/nurse` | Triage Nurse | Nurse triage terminal with live queue auto-polling, token search, and vitals recording (BP, Pulse, Height, Weight). |
| `/[campCode]/doctor` | Consulting Physician | Doctor clinical desk with symptom quick-presets, diagnosis charting, frequency macros (`101` $\rightarrow$ `1-0-1`), and out-of-stock emergency alerts. |
| `/[campCode]/pharmacy` | Pharmacist | Pharmacy dispensation counter with verification checklists, medicine handover, and the **Out-of-Stock** doctor referral trigger. |
| `/[campCode]/display` | Waiting Hall TV | Public multi-column real-time queue display board tracking tokens across Nurse, Doctor, and Pharmacy stations. |
| `/[campCode]/report` | Patient / Doctor | Camp-specific patient medical report lookup by Token ID or 10-digit phone number. |
| `/[campCode]/camp/status` | Patient (Mobile) | Live personal token status tracker showing queue position and stage progression. |
| `/[campCode]/camp/report/[id]` | Patient / Doctor | Direct permanent clinical report canvas for a specific patient ID. |
| `/patient-portal` | Patient (Universal) | Cross-camp universal patient report retrieval portal with instant showcase bypass (Token `42`). |
| `/report` | Universal Direct | Direct patient report canvas with print engine integration. |
| `/sample-report` | Presentation / Demo | Ready-to-showcase official sample medical report for **Alexander Hamilton** with instant A4 print engine. |

---

## 5. Detailed Clinical Assembly Line & Workflows

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (Mobile)
    actor Nurse as Nurse Terminal
    actor Doctor as Doctor Desk
    actor Pharmacy as Pharmacy Counter
    actor TV as Public TV Board

    Patient->>Patient: Scans QR standee at camp gate
    Patient->>Patient: Fills name, age, phone -> Receives Token #101
    TV-->>TV: Token #101 appears in "Nurse Queue"
    Nurse->>Nurse: Queries Token #101, logs BP (120/80) & Pulse (72)
    Nurse->>Doctor: Forwards patient (Status -> DOCTOR)
    TV-->>TV: Token #101 moves to "Doctor Queue"
    Doctor->>Doctor: Selects symptoms, diagnosis & prescribes medications
    Doctor->>Pharmacy: Submits prescription (Status -> PHARMACY)
    TV-->>TV: Token #101 moves to "Pharmacy Pickup"
    alt Normal Dispensation
        Pharmacy->>Pharmacy: Verifies drug checklist, hands over medicines
        Pharmacy->>Patient: Marks COMPLETED -> Patient receives ready toast
    else Out-of-Stock Scenario
        Pharmacy->>Doctor: Flags "Out-of-Stock" with note
        Doctor->>Doctor: Patient hoisted to top of Doctor Queue with red alert
        Doctor->>Pharmacy: Doctor prescribes alternate drug & re-submits
    end
```

### Stage 1: QR-Gated Patient Self-Registration (`/[campCode]/register`)
- **QR Gatekeeper:** Direct URL access is blocked unless opened with `?access=slugToken` (embedded in physical QR stands) or verified via a session token cookie.
- **Data Hygiene:** Strictly validates 10-digit Indian phone numbers.
- **Duplicate Prevention:** If a patient who is already registered enters their phone number again, the system halts duplicate creation and offers an instant one-click record update flow.

### Stage 2: Nurse Triage Terminal (`/[campCode]/nurse`)
- **Real-Time Auto-Polling:** Polls the database every 5 seconds for new registrations.
- **Blood Pressure Guard:** Validates systolic/diastolic format (e.g., `120/80`), flagging typos with inline alerts.
- **One-Click Handover:** Saving vitals immediately transitions the patient from `REGISTERED` to `DOCTOR` status.

### Stage 3: Doctor Clinical Desk (`/[campCode]/doctor`)
- **Isolation Protection:** Switching between patients resets symptoms and prescriptions, preventing accidental cross-patient clinical data bleed.
- **Speed Macro Engine:** Automatically formats numeric entries into standard medical frequency notations (e.g., `101` $\rightarrow$ `1-0-1`, `111` $\rightarrow$ `1-1-1`), while preserving standard dosage strengths (`500` mg).
- **Out-of-Stock Priority Escalation:** If the pharmacy flags an out-of-stock drug, the patient is instantly hoisted to the top of the doctor queue with an amber/red flashing banner displaying the pharmacist's note.

### Stage 4: Pharmacy Dispensation (`/[campCode]/pharmacy`)
- **Verification Checklist:** Displays doctor-prescribed medications as an interactive checklist. Pharmacists must verify fulfillment before clearing the patient.
- **Out-of-Stock Referral Loop:** If an item is unavailable, the pharmacist enters a note (e.g., *"Paracetamol out of stock, substitute with Ibuprofen"*) and clicks **Report Out of Stock**. The patient is automatically reassigned to `DOCTOR_REFERRED_OUT_OF_STOCK`.

### Stage 5: Ink-Saving A4 Medical Report (`/sample-report`, `/report`)
- **Single-Page Clinical Canvas:** Renders official hospital letterhead, patient demographics, triage vitals, doctor notes, and prescribed dosages.
- **Print Optimization:** Formatted with dedicated `@media print` CSS rules. In dark mode, clicking **Print Official Report** (or pressing `Ctrl+P`) strips dark backgrounds and navigation bars, rendering crisp black typography on pure white A4 paper.

---

## 6. Key Innovations & Advanced Systems Engineering

### 1. The Closed-Loop "Out-of-Stock" Exception Workflow
In rural or high-volume camps, pharmacies constantly face inventory depletion. MedCamp OS eliminates physical cross-camp patient backtracking by providing an immediate, bidirectional digital referral loop:
```
[Pharmacy flags Stockout] -> [Status: DOCTOR_REFERRED_OUT_OF_STOCK] -> [Hoisted to Doctor Priority Queue] -> [Doctor Re-prescribes] -> [Returned to Pharmacy]
```

### 2. Ink-Saving A4 Print Engine
Healthcare camps operate in daylight, dimly lit community halls, and under power constraints. While the UI supports full high-contrast dark mode for staff screens, clinical reports must print cleanly on physical paper. MedCamp OS's print engine:
- Strips all dark mode styles, buttons, and navbars.
- Uses strict page margins (`@page { size: A4; margin: 15mm; }`).
- Renders high-contrast clinical tables with black borders to conserve printer ink.

### 3. Prisma Connection Pooling Singleton Guard
AWS RDS and cloud PostgreSQL instances enforce tight connection limits (`max_connections=10`). In `lib/prisma.ts`, MedCamp OS implements a hardened global singleton that prevents Next.js hot-module reloading from spinning up redundant database connections and causing `P2024` connection pool timeouts.

### 4. Zero-Unmount Dark Mode Context
Unlike traditional providers that unmount and remount component trees upon theme changes (which wipes unsaved doctor inputs and clinical forms), MedCamp OS uses an unmount-free `ThemeProvider` that toggles `.dark` class attributes seamlessly on the root HTML node.

---

## 7. Production Engineering Audit & Bug Fix Log

During the comprehensive end-to-end audit, all bugs and inconsistencies across the entire codebase were systematically resolved:

| ID | Module / File | Discovered Issue | Engineering Fix Applied |
| :---: | :--- | :--- | :--- |
| **FIX-01** | `prisma/schema.prisma` | `Campaign.campCode` was not marked `@unique`, causing runtime crashes on `findUnique({ where: { campCode } })`. | Added `@unique` constraint to `Campaign.campCode` and regenerated Prisma Client. |
| **FIX-02** | `app/actions.ts` | `closeAndWipeCampAction` deleted all staff across the entire organization instead of scoping to the active camp. | Scoped deletion query strictly to `where: { deploymentId: campCode }`. |
| **FIX-03** | `app/actions.ts` | `initializeCampAction` marked all camps across all organizations as inactive. | Scoped deactivation strictly to `where: { organizationId: org.id }`. |
| **FIX-04** | `app/actions.ts` | Numeric fields (`age`, `height`, `weight`, `pulse`) threw database type errors when empty strings or `NaN` were submitted. | Added sanitization helpers (`cleanInt`, `cleanFloat`) returning `null` or valid integers. |
| **FIX-05** | `app/actions.ts` | Bcrypt password hashes were serialized in `getOrganizationOverviewAction` and returned to client browsers. | Added explicit Prisma `select` projections to exclude `password` from all serialized payloads. |
| **FIX-06** | `DoctorTerminal.tsx` | Switching patients did not reset symptoms or prescriptions, causing Patient A's prescription to bleed into Patient B. | Implemented `handleSelectPatient` to reset `symptoms`, `diagnosis`, and `prescriptions` upon patient change. |
| **FIX-07** | `DoctorTerminal.tsx` | Macro regex `/^[0-9]{3}$/` turned standard 500mg doses into `5-0-0`. | Refined regex strictly to `/^[0-2]{3}$/` so only valid scheduling codes (`101`, `111`, `010`) format as macros. |
| **FIX-08** | `NurseTerminal.tsx` | Vitals save target used unverified `searchToken` state rather than the active `patientData.tokenNumber`. | Updated mutation to pass `patientData.tokenNumber` directly. |
| **FIX-09** | `PharmacyTerminal.tsx` | `selectedPatient` was included in `useEffect` dependency array, triggering runaway infinite network fetch loops. | Removed `selectedPatient` from dependency array and stabilized polling to fixed 5s intervals. |
| **FIX-10** | `RegisterClient.tsx` | `window.history.pushState` was executed on every form keystroke, corrupting browser back-button navigation. | Decoupled history state pushes from form input change handlers. |
| **FIX-11** | `RegisterClient.tsx` | Status check checked `"PHARMACIST"` instead of schema enum `"PHARMACY"`. | Standardized enum check to `"PHARMACY"`. |
| **FIX-12** | `[campCode]/camp/status` | Broken link pointed to `/camp/report/[id]` (returning 404). | Updated route link to `/${campCode}/camp/report/${patient.id}`. |
| **FIX-13** | `ThemeProvider.tsx` | Used anti-pattern that unmounted the React tree until mounted, wiping unsaved clinical form states. | Removed tree unmounting; wrapped children safely inside `NextThemesProvider`. |
| **FIX-14** | `PatientNotification.tsx` | Dismissing the notification toast caused it to re-appear on every 5s poll. | Added persistent `dismissed` session flag to permanently silence dismissed toasts. |
| **FIX-15** | `globals.css` | Dark mode CSS variables were scoped to `@media (prefers-color-scheme: dark)`, conflicting with manual `.dark` class toggles. | Rescoped dark CSS variables directly to `.dark` class selector. |
| **FIX-16** | `tailwind.config.ts` | Outfit font family was declared in HTML but missing from Tailwind's font family config. | Added `fontFamily: { outfit: ['var(--font-outfit)', 'Outfit', 'sans-serif'] }`. |
| **FIX-17** | `tsconfig.json` | Missing explicit modern JavaScript target for Next.js 14 App Router. | Added `"target": "es2022"`. |

---

## 8. Local Setup & Execution Guide

> [!IMPORTANT]
> **Strict Localhost Policy:** All changes and configurations are executed and verified strictly on `localhost`. No commits or pushes to remote git repositories are performed.

### Prerequisites
- **Node.js:** v18.17+ or v20.x
- **Package Manager:** npm (v9+)
- **Database:** PostgreSQL (Local or Cloud RDS instance)

### Step-by-Step Installation

1. **Clone & Navigate:**
   ```bash
   cd d:\MedComp
   ```

2. **Configure Environment Variables:**
   Create or verify your `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/medcamp?schema=public"
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Synchronize Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

6. **Verify Production Build (Optional):**
   ```bash
   npm run build
   ```
   All 15 routes will compile with **Exit Code 0**.

---

## 9. Presentation Guide for Tomorrow's Showcase

Follow this step-by-step presentation script to showcase the platform smoothly and professionally.

### Presentation Flow (5 Minutes Total)

```
[0:00 - 0:45] The Pitch & Landing Page (http://localhost:3000)
    │
[0:45 - 2:00] The Instant Showcase Report (http://localhost:3000/sample-report)
    │
[2:00 - 2:45] Ink-Saving A4 Print Engine Demo (Click "Print Official Report" or Ctrl+P)
    │
[2:45 - 4:00] The Core Innovation: "Out-of-Stock" Loop Demo
    │
[4:00 - 4:45] Public TV Queue Display Board (http://localhost:3000/42/display)
    │
[4:45 - 5:00] Closing & Questions
```

### Presentation Script & Talking Points

#### Step 1: The Pitch (45 Seconds)
- **URL:** `http://localhost:3000`
- **Say:**  
  *"Good morning everyone. This is MedCamp OS. In high-volume community medical outreach camps, paper records create chaos: lost prescriptions, triage bottlenecks, and duplicate patient entries. MedCamp OS replaces paper with an automated, synchronized clinical assembly line where patient data flows seamlessly from QR registration to nurse triage, doctor consultation, and pharmacy dispensation."*
- **Action:** Click the **Theme Toggle** in the top-right header to show light and dark mode support.

#### Step 2: Instant Showcase Report (1 Minute 15 Seconds)
- **URL:** `http://localhost:3000/sample-report`
- **Say:**  
  *"Let's start by looking at the finished output. Here is the official digital medical report generated for a patient, Alexander Hamilton. It displays full institutional branding, triage vitals (Height, Weight, Blood Pressure: 120/80, Pulse: 72 bpm), cardiology diagnosis, and structured prescriptions with dosages and durations."*

#### Step 3: Ink-Saving A4 Print Engine (45 Seconds)
- **Action:** Click the **Print Official Report** button (or press `Ctrl + P`).
- **Say:**  
  *"Notice what happens when we print. Even in dark mode, our print engine instantly strips all dark backgrounds, web navigation bars, and buttons. It renders a clean, ink-saving black-and-white A4 medical report formatted specifically for physical patient archiving."*

#### Step 4: Key Innovation — The "Out-of-Stock" Loop (1 Minute 15 Seconds)
- **Say:**  
  *"The single biggest point of failure in real-world medical camps is when the pharmacy runs out of a prescribed drug. Traditionally, the patient has to run back through crowded grounds to find the doctor."*  
  *"In MedCamp OS, the pharmacist simply clicks 'Report Out of Stock' and types a note. The patient is instantly hoisted to the top of the Doctor's queue with an amber alert badge. The doctor sees the pharmacist's note, prescribes an alternative drug, and updates the file in seconds—all without the patient taking a single step."*

#### Step 5: Public TV Queue Display Board (45 Seconds)
- **URL:** `http://localhost:3000/42/display` (or open sample display)
- **Say:**  
  *"Finally, this is the public display board projected onto waiting hall monitors. It tracks live tokens across Nurse Triage, Doctor Desks, and Pharmacy Pickup in real time with automatic 5-second polling, keeping waiting patients informed and calm."*

---

## 10. Instant Showcase Bypass Credentials

For instant demonstration without manual data entry:

| Setting | Value |
| :--- | :--- |
| **Universal Patient Portal** | `http://localhost:3000/patient-portal` |
| **Demo Camp Code** | `42` |
| **Demo Phone Number** | `555-0199` |
| **Demo Token Number** | `42` |
| **Direct Sample Report URL** | `http://localhost:3000/sample-report` |

---

## 11. Comprehensive Test Suite Matrix

The full 23-test-case verification matrix is maintained in:
- Plain Text Format: [`TEST_CASES.txt`](file:///d:/MedComp/TEST_CASES.txt)
- Markdown Format: [`TEST_CASES.md`](file:///d:/MedComp/TEST_CASES.md)

All 23 test cases (TC-01 through TC-23) have been systematically verified with **100% pass rates**.

---

**Developed for Community Healthcare Innovation**  
*MedCamp OS — Engineered for Speed, Reliability, and Patient Care.*
