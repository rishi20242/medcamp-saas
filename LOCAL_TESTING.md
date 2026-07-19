# Local Verification Guide

This guide outlines the 5-step End-to-End (E2E) verification process to test the complete Medical Camp Automation flow locally with a native PostgreSQL database.

## Prerequisites

1. **PostgreSQL Installation**: Ensure you have PostgreSQL installed natively on your host machine (Windows/Mac). You should not be using Docker.
2. **Environment Configuration**: A `.env` file should exist in the root of the `MedComp` directory with the following variable configured to your local PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/medcamp?schema=public"
   ```
3. **Database Preparation**: 
   - Open a terminal in the project root.
   - Run `npx prisma db push` to synchronize your database schema.
4. **Start Development Server**:
   - Run `npm run dev` to start the Next.js server.

---

## 5-Step E2E Verification Process

### Step 1: Patient Registration (`/register`)
1. Navigate to [http://localhost:3000/register](http://localhost:3000/register).
2. Fill out the mandatory fields (First Name, Age, Gender, Contact Phone) marked with red asterisks.
3. You can optionally provide Height, Weight, Blood Pressure, and Pulse here.
4. Submit the registration form.
5. **Expected Outcome**: The page will display a success state and provide you with a **Token ID** (e.g., #101). Note this Token ID for the next steps. The patient is now in the `REGISTERED` status.

### Step 2: Nurse Triage (`/nurse`)
1. Navigate to [http://localhost:3000/nurse](http://localhost:3000/nurse).
2. Enter the **Token ID** you received in Step 1 into the search bar and click "Lookup".
3. **Expected Outcome**: The patient's details should appear. If you provided vitals during registration, they will be pre-filled.
4. Add or update the Height, Weight, Blood Pressure, and Pulse fields.
5. Click "Save Vitals & Send to Doctor".
6. **Expected Outcome**: A success message is displayed. The patient has been moved to the `TRIAGE` status.

### Step 3: Doctor Consultation (`/doctor`)
1. Navigate to [http://localhost:3000/doctor](http://localhost:3000/doctor).
2. Look at the **Queue (Doctor)** sidebar on the left. You should see your patient's Token ID listed as Pending.
3. Click on the patient's card in the queue to select them.
4. **Expected Outcome**: The main panel will display the patient's vitals collected by the nurse.
5. Fill in the "Symptoms" and "Diagnosis".
6. Use the "Prescriptions" form to add at least one medication (e.g., Paracetamol 500mg, 1-1-1, 3 Days) and click "Add".
7. Click "Send to Pharmacy".
8. **Expected Outcome**: The form clears, and the patient disappears from the Doctor's queue. The patient has been moved to the `DOCTOR` status.

### Step 4: Pharmacy Dispensation (`/pharmacy`)
1. Navigate to [http://localhost:3000/pharmacy](http://localhost:3000/pharmacy).
2. Look at the **Pending Dispensation** sidebar on the left. Your patient's Token ID should be listed.
3. Click on the patient's card.
4. **Expected Outcome**: The diagnosis and prescription details from the doctor are displayed.
5. Check the "Dispensed" checkbox for each prescribed medication.
6. Once all medications are checked, the "Mark as Completed & Handover" button will become active. Click it.
7. **Expected Outcome**: The patient disappears from the pharmacy queue. The patient has been moved to the `COMPLETED` status.

### Step 5: Public Monitor Display (`/display`)
1. Open a new window or monitor and navigate to [http://localhost:3000/display](http://localhost:3000/display).
2. **Doctor Chamber**: Watch as new patients move from `REGISTERED` to `TRIAGE`, their tokens will appear in the "Next in line (Doctor)" section and eventually the "Token" display when a doctor selects them.
3. **Pharmacy Pickup**: Watch as the doctor sends patients to the pharmacy. Their tokens will appear under "Pharmacy Pickup".
4. **Real-time Updates**: This board automatically refreshes every 5 seconds, providing a live overview of the camp's operational flow without manual intervention.

---

## Troubleshooting

- **Database Connection Errors**: Double-check the `DATABASE_URL` in your `.env` file. Ensure `YOUR_PASSWORD` is replaced with your actual PostgreSQL postgres user password.
- **Queue Not Updating**: Ensure the Next.js server is running without errors. The displays poll the server every 5 seconds, so changes may take a few moments to reflect.
