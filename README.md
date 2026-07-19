# MedCamp OS

**An automated, high-velocity, multi-tenant SaaS platform optimized for community medical camp workflows in India.**

## 1. Project Header & Executive Summary

MedCamp OS represents a paradigm shift in how high-volume, temporary medical camps are managed. Historically, medical camps rely on chaotic paper-based routing or disjointed spreadsheet systems that break down under pressure. MedCamp OS solves this by orchestrating a seamless digital assembly line.

**Architecture Summary:** The platform transitions traditional patient self-registration via physical QR codes into a highly structured, decentralized series of clinic terminals. Instead of a centralized bottleneck, patients scan a camp-specific QR code to self-register via their mobile devices. Their digital token then flows autonomously through dedicated, isolated terminals (Nurse Triage, Doctor Clinical Desk, Pharmacy Dispensation) deployed across the camp. This multi-tenant architecture ensures that concurrent camps run entirely sandboxed workflows without data contamination, eliminating physical paperwork and drastically accelerating patient throughput.

---

## 2. Technology Stack & Architecture Blueprint

- **Frontend & Core Server Framework:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React Icons.
- **Database & ORM Layer:** PostgreSQL connected seamlessly via Prisma ORM.
- **State & Connectivity:** 
  - **Server Actions:** Utilized for secure, API-less database mutations directly from React components.
  - **Browser Local-First Caching:** Optimized for high-density local environment testing, ensuring snappy UI responses even under fluctuating network conditions.
  - **Session Management:** Isolated session cookie management frameworks to maintain strict multi-tenant boundaries between distinct camp environments.

---

## 3. Complete App Component Workflow

The application is structured around 6 core, isolated route architectures:

### `/[campCode]/admin/setup` (Institutional Onboarding Hub)
The foundational gateway where organizations (e.g., "Apollo Hospitals Medical Camp") bootstrap their session. It establishes the Chief Organizer, configures camp metadata, and provisions unique Staff IDs with alphanumeric password rules. It also features a dynamic mid-camp doctor provisioning engine to seamlessly add staff during live operations without system restarts.

### `/[campCode]/register` (Patient Registration Engine)
A mobile-optimized patient onboarding form engineered for speed. It enforces a strict 10-digit Indian phone validation loop to maintain data hygiene. If a matching duplicate phone number is detected in the active database, the system provides an immediate full-rights edit override path, allowing returning patients to update their vitals rather than generating ghost duplicate records.

### `/[campCode]/nurse` (Triage Terminal)
Designed for rapid clinical intake, featuring a high-density sticky sidebar tracking active registration queues. Nurses can fetch patient details via intuitive card clicks or manual Token ID queries. The terminal allows for the rapid updating of fundamental vitals (Height, Weight, Pulse, BP), instantly escalating the patient to the doctor's queue upon save.

### `/[campCode]/doctor` (Clinical Desk)
A highly advanced interface integrating:
- Symptom quick-preset buttons for rapid charting.
- A custom "+" data incrementor drawer for custom conditions.
- A real-time keypress macro engine that intuitively converts numerical inputs into medical frequencies (e.g., typing '101' auto-formats to '1-0-1').
- Patient background tabs displaying historical allergy indicators and triage vitals.
- A strict safety modal validation box before finalizing the diagnosis and passing data to the pharmacy.

### `/[campCode]/pharmacy` (Dispensation Counter)
Maps real-time incoming doctor prescriptions to a dispensing checklist. It enforces a mandatory safety handover confirmation window to ensure complete prescription fulfillment before marking the patient's camp journey as "COMPLETED".

### `/[campCode]/report` (Final Clinical Canvas)
A public-facing, highly optimized canvas page displaying the patient's complete journey. It acts as a single-page A4 print container incorporating dynamic hospital branding, beautifully styled clinical table maps with deep JSON parsing boundaries for complex prescriptions, and an empathetic closing slogan ("Wish you a speedy recovery!").

---

## 4. Advanced Systems Engineering Patches

- **Prisma Connection Pooling & Atomic Transactions:** Designed to handle 100+ concurrent patient QR check-in traffic surges safely. We utilize Prisma `$transaction` blocks to guarantee atomic database mutations, preventing race conditions, network slot starvation, or server deadlocks during peak intake hours.
- **Global Dark Mode Engine:** Powered by a custom React context provider (`next-themes`) tracking system-level display criteria (prefers-color-scheme) while retaining persistent local overrides, ensuring optimal viewing for staff in varying physical camp lighting conditions.
- **Data Visibility Paradigm (Hybrid Security):** Staff authorization keys and passwords are encrypted and hashed securely via `bcrypt`. However, patient clinical parameters and queue statuses are stored as plain searchable metadata fields. This ensures immediate administrative lookup and real-time dashboard analytics without the overhead of heavy decryption cycles on every render.

---

## 5. Local Environment E2E Testing Protocol

To execute a complete End-to-End multi-tenant simulation locally, follow this terminal execution guide:

1. **Configure Environment Variables:**
   Update your local `.env` file with your PostgreSQL connection string.
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/medcamp?schema=public"
   ```

2. **Push Structural Schema Migrations:**
   Synchronize the Prisma schema with your local database instance to build the required tables.
   ```bash
   npx prisma db push
   ```

3. **Execute Concurrent Multi-Tenant Simulation:**
   Start the Next.js development server.
   ```bash
   npm run dev
   ```
   Open multiple browser instances using isolated incognito/private windows on `localhost:3000`. Navigate to `/[campCode]/admin/setup` in each window using different camp codes (e.g., `/APOLLO-01/admin/setup` and `/THIYA-99/admin/setup`) to simulate and verify isolated concurrent data matrices.

4. **Baseline Cold-Boot Reset:**
   To drop tables and force a clean baseline simulation setup, utilize Prisma's database reset command.
   ```bash
   npx prisma db push --force-reset
   ```
