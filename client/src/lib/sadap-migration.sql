-- Run this in your Supabase SQL editor

-- 1. Link verified clinic patients to user profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sadap_patient_id INTEGER;

-- 2. Link doctors in Supabase CMS to their clinic MIS ID
--    Set this per-doctor in the Supabase dashboard after running this migration
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sadap_doctor_id INTEGER;

-- 3. Track the MIS appointment ID so we can cancel via SADAP API
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sadap_appointment_id INTEGER;
