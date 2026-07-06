/**
 * Production Bootstrap
 *
 * Idempotent, non-destructive provisioning for a fresh production database.
 * Unlike the development seed (seed.ts), this creates NO demo content and
 * NEVER deletes data. It is safe to run on every deploy.
 *
 * It provisions the minimum required to make the studio operable:
 *  - ONE admin user (from ADMIN_EMAIL / ADMIN_PASSWORD)
 *  - ONE instructor profile coupled to that admin user. Course creation resolves
 *    the instructor via the logged-in admin's own profile
 *    (admin-courses.service.ts::resolveInstructorId), so without this the
 *    required Course.instructorId FK cannot be satisfied through the UI.
 *  - ONE location (Session.locationId is required; the name/address are
 *    placeholders the admin edits later via the admin UI)
 *  - the default cancellation policy (isDefault: true), so refunds are not
 *    silently computed as 0.
 *
 * Because the admin upsert also promotes an existing account to ADMIN, this
 * doubles as the admin-provisioning path: point ADMIN_EMAIL at an account that
 * registered itself through the normal flow and it becomes the studio admin
 * (its password is left untouched).
 *
 * Run (compiled) via the container entrypoint, or locally with:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... tsx apps/api/prisma/bootstrap.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const MIN_ADMIN_PASSWORD_LENGTH = 10;

/** Stable id shared with the dev seed so any code referencing it resolves. */
const DEFAULT_POLICY_ID = 'default-policy';

/** Passwords that must never protect a production admin account. */
const BANNED_ADMIN_PASSWORDS = new Set(['admin123', 'password', 'changeme']);

interface BootstrapConfig {
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  locationName: string;
  locationAddress: string | null;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `${name} is required for the production bootstrap but was not set.`,
    );
  }
  return value.trim();
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : fallback;
}

function readConfig(): BootstrapConfig {
  const adminEmail = requireEnv('ADMIN_EMAIL').toLowerCase();
  const adminPassword = requireEnv('ADMIN_PASSWORD');

  if (adminPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD is too short (${adminPassword.length} chars, need >= ${MIN_ADMIN_PASSWORD_LENGTH}).`,
    );
  }
  if (BANNED_ADMIN_PASSWORDS.has(adminPassword.toLowerCase())) {
    throw new Error(
      'ADMIN_PASSWORD is a well-known weak password. Choose a strong, unique one.',
    );
  }

  const rawAddress = process.env['LOCATION_ADDRESS'];
  return {
    adminEmail,
    adminPassword,
    adminFirstName: optionalEnv('ADMIN_FIRST_NAME', 'Daniela'),
    adminLastName: optionalEnv('ADMIN_LAST_NAME', 'Tanzmoment'),
    locationName: optionalEnv('LOCATION_NAME', 'Tanzmoment Studio'),
    locationAddress:
      typeof rawAddress === 'string' && rawAddress.trim() !== ''
        ? rawAddress.trim()
        : null,
  };
}

async function ensureAdmin(config: BootstrapConfig): Promise<string> {
  const passwordHash = await bcrypt.hash(config.adminPassword, BCRYPT_ROUNDS);

  // On update we deliberately do NOT touch passwordHash: an existing account
  // may have a password the owner already set. We only guarantee the ADMIN
  // role and a verified email so the account can reach the admin UI.
  const admin = await prisma.user.upsert({
    where: { email: config.adminEmail },
    update: {
      role: UserRole.ADMIN,
      emailVerified: true,
      // Re-activate in case the promoted account was previously deactivated;
      // login rejects inactive accounts, which would lock the new admin out.
      isActive: true,
    },
    create: {
      email: config.adminEmail,
      passwordHash,
      firstName: config.adminFirstName,
      lastName: config.adminLastName,
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  console.log(`  ✅ Admin user: ${admin.email} (role ${admin.role})`);
  return admin.id;
}

async function ensureInstructor(adminUserId: string): Promise<void> {
  // Coupled to the admin user by userId so resolveInstructorId() picks it up
  // automatically. Display data is intentionally minimal and admin-editable.
  await prisma.instructor.upsert({
    where: { userId: adminUserId },
    update: {},
    create: {
      userId: adminUserId,
      expertise: [],
    },
  });

  console.log('  ✅ Instructor profile coupled to admin user');
}

async function ensureLocation(config: BootstrapConfig): Promise<void> {
  // Provision a single placeholder location only when none exists yet. Keying an
  // upsert on the (mutable) name would create a duplicate once the admin renames
  // it, breaking the "safe to run on every deploy" contract.
  const existing = await prisma.location.findFirst();
  if (existing) {
    console.log(`  ✅ Location already present: ${existing.name}`);
    return;
  }

  const location = await prisma.location.create({
    data: {
      name: config.locationName,
      address: config.locationAddress,
      isActive: true,
    },
  });

  console.log(`  ✅ Location created: ${location.name}`);
}

async function ensureDefaultCancellationPolicy(): Promise<void> {
  const policy = await prisma.cancellationPolicy.upsert({
    where: { id: DEFAULT_POLICY_ID },
    update: {},
    create: {
      id: DEFAULT_POLICY_ID,
      name: 'Standard 48h Policy',
      description:
        'Full refund up to 48 hours before session start. ' +
        '50% refund between 24-48 hours. No refund within 24 hours.',
      fullRefundHours: 48,
      partialRefundHours: 24,
      partialRefundPercent: 50,
      isDefault: true,
    },
  });

  console.log(`  ✅ Default cancellation policy: ${policy.name}`);
}

async function main(): Promise<void> {
  console.log('🚀 Running production bootstrap (idempotent, non-destructive)...');

  const config = readConfig();

  const adminUserId = await ensureAdmin(config);
  await ensureInstructor(adminUserId);
  await ensureLocation(config);
  await ensureDefaultCancellationPolicy();

  console.log('✅ Bootstrap complete.');
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Bootstrap failed: ${message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
