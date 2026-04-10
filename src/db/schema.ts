import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  date,
  bigserial,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ─────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['owner', 'staff'])
export const propertyStatusEnum = pgEnum('property_status', ['active', 'inactive', 'maintenance'])
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'awaiting_payment',
  'confirmed',
  'hosting',
  'completed',
  'canceled',
])
export const crmLeadStatusEnum = pgEnum('crm_lead_status', [
  'lead',
  'contacted',
  'proposal_sent',
  'confirmed',
  'completed',
])
export const proposalStatusEnum = pgEnum('proposal_status', ['sent', 'accepted', 'rejected'])
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense'])
export const permissionLevelEnum = pgEnum('permission_level', ['view', 'edit', 'none'])

// ─── Auth Tables (NextAuth v5 / @auth/drizzle-adapter required schema) ──────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true, mode: 'date' }),
  image: text('image'),
  // Custom columns — nullable or default so adapter inserts work without these fields
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').default('owner'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    // providerAccountId uses camelCase accessor — adapter matches by column name 'provider_account_id'
    providerAccountId: text('provider_account_id').notNull(),
    // OAuth token fields: accessors must match @auth/drizzle-adapter DefaultPostgresAccountsTable expectations
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'), // integer (Unix timestamp seconds) — required by @auth/drizzle-adapter type
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true, mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  })
)

// ─── Properties ─────────────────────────────────────────────────────────────

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // rich text HTML (DOMPurify-sanitized before save)
  slug: text('slug').unique().notNull(),
  locationAddress: text('location_address'),
  locationLat: text('location_lat'),
  locationLng: text('location_lng'),
  maxGuests: integer('max_guests').notNull().default(1),
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  beds: integer('beds').notNull().default(1),
  amenities: jsonb('amenities').default([]),
  rules: text('rules'),
  videoUrl: text('video_url'),
  status: propertyStatusEnum('status').default('active').notNull(),
  featured: boolean('featured').default(false).notNull(),
  cleaningFee: integer('cleaning_fee').notNull().default(0), // centavos
  basePrice: integer('base_price').notNull().default(0), // centavos
  minNights: integer('min_nights').default(1).notNull(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const propertyImages = pgTable('property_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('public_id').notNull(), // Cloudinary public ID for deletion
  order: integer('order').notNull().default(0),
  room: text('room'), // e.g. 'sala', 'quarto', 'cozinha', 'área_externa'
  isCover: boolean('is_cover').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const seasonalPricing = pgTable('seasonal_pricing', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  pricePerNight: integer('price_per_night').notNull(), // centavos
})

export const longStayDiscounts = pgTable(
  'long_stay_discounts',
  {
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    minNights: integer('min_nights').notNull(),
    discountPercent: integer('discount_percent').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.propertyId, t.minNights] }),
  })
)

export const blockedDates = pgTable('blocked_dates', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  source: text('source').notNull().default('manual'), // 'manual', 'booking', 'ical:{feed_id}'
  icalUid: text('ical_uid'), // dedup key for iCal imports
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── Guests ──────────────────────────────────────────────────────────────────

export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  cpf: text('cpf'),
  city: text('city'),
  birthDate: date('birth_date'),
  notes: text('notes'),
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id),
  guestId: uuid('guest_id').references(() => guests.id), // nullable — guest may not be in CRM
  // Denormalized guest info (captured at booking time, immutable)
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestWhatsapp: text('guest_whatsapp'),
  guestCount: integer('guest_count').notNull(),
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  nights: integer('nights').notNull(),
  pricePerNight: integer('price_per_night').notNull(), // centavos, server-calculated
  totalPrice: integer('total_price').notNull(), // centavos, includes cleaning fee
  cleaningFee: integer('cleaning_fee').notNull(), // centavos
  // Stripe
  stripeSessionId: text('stripe_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  couponId: uuid('coupon_id').references(() => coupons.id),
  selectedServices: jsonb('selected_services').default([]), // array of { id: string, name: string, price: number, unit: string }
  // Lifecycle timestamps
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  checkInAt: timestamp('check_in_at', { withTimezone: true }),
  checkOutAt: timestamp('check_out_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const processedWebhookEvents = pgTable('processed_webhook_events', {
  stripeEventId: text('stripe_event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Coupons & Services ────────────────────────────────────────────────────────

export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').unique().notNull(),
  discountPercent: integer('discount_percent'), // null if amount
  discountAmount: integer('discount_amount'), // centavos
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0).notNull(),
  validUntil: date('valid_until'),
  isActive: boolean('is_active').default(true).notNull(),
  stripeCouponId: text('stripe_coupon_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const propertyServices = pgTable('property_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // centavos
  unit: text('unit').default('total').notNull(), // 'total', 'per_night', 'per_guest'
  icon: text('icon'), // lucide icon name
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── Financial ────────────────────────────────────────────────────────────────

export const financialTransactions = pgTable('financial_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  type: transactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // centavos, always positive
  category: text('category').notNull(), // 'booking_income', 'cleaning', 'maintenance', 'commission', 'other'
  description: text('description'),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const proposals = pgTable('proposals', {
  id: uuid('id').defaultRandom().primaryKey(),
  guestId: uuid('guest_id')
    .notNull()
    .references(() => guests.id),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id),
  status: proposalStatusEnum('status').default('sent').notNull(),
  totalAmount: integer('total_amount').notNull(), // centavos
  validUntil: date('valid_until').notNull(),
  pdfUrl: text('pdf_url'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── iCal Feeds ───────────────────────────────────────────────────────────────

export const icalFeeds = pgTable('ical_feeds', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  name: text('name').notNull(), // e.g. 'Airbnb', 'Booking.com'
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── CRM ──────────────────────────────────────────────────────────────────────

export const crmLeads = pgTable('crm_leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  guestId: uuid('guest_id').references(() => guests.id),
  propertyId: uuid('property_id').references(() => properties.id),
  status: crmLeadStatusEnum('status').default('lead').notNull(),
  notes: text('notes'),
  estimatedCheckIn: date('estimated_check_in'),
  estimatedCheckOut: date('estimated_check_out'),
  estimatedAmount: integer('estimated_amount'), // centavos
  position: integer('position').default(0).notNull(), // order within status column
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // e.g. 'LOGIN_SUCCESS', 'BOOKING_CREATED', 'PROPERTY_UPDATED'
    entityType: text('entity_type'), // e.g. 'booking', 'property', 'user'
    entityId: text('entity_id'),
    metadata: jsonb('metadata'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index('audit_log_entity_idx').on(t.entityType, t.entityId),
    userIdx: index('audit_log_user_idx').on(t.userId),
  })
)

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'new_booking', 'payment_confirmed', 'checkin_today', 'checkout_pending'
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── Instance Settings ────────────────────────────────────────────────────────

export const instanceSettings = pgTable('instance_settings', {
  id: integer('id').primaryKey().default(1), // singleton row — always id=1
  businessName: text('business_name'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  accentColor: text('accent_color').default('#0071e3'),
  whatsapp: text('whatsapp'),
  instagram: text('instagram'),
  cancellationPolicy: text('cancellation_policy'),
  // Stripe keys (stored encrypted in Phase 5; plaintext in Phase 1 is acceptable — Phase 5 adds encryption)
  stripeSkKey: text('stripe_sk_key'),
  stripePkKey: text('stripe_pk_key'),
  stripeWebhookSecret: text('stripe_webhook_secret'),
  // Resend
  resendApiKey: text('resend_api_key'),
  resendFromEmail: text('resend_from_email'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Staff Permissions ────────────────────────────────────────────────────────

export const staffPermissions = pgTable(
  'staff_permissions',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    properties: permissionLevelEnum('properties').default('none').notNull(),
    bookings: permissionLevelEnum('bookings').default('none').notNull(),
    guests: permissionLevelEnum('guests').default('none').notNull(),
    financial: permissionLevelEnum('financial').default('none').notNull(),
    settings: permissionLevelEnum('settings').default('none').notNull(),
  }
)

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  properties: many(properties),
  auditLogs: many(auditLog),
  notifications: many(notifications),
  staffPermissions: one(staffPermissions),
}))

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  images: many(propertyImages),
  seasonalPricing: many(seasonalPricing),
  longStayDiscounts: many(longStayDiscounts),
  blockedDates: many(blockedDates),
  bookings: many(bookings),
  icalFeeds: many(icalFeeds),
  crmLeads: many(crmLeads),
  proposals: many(proposals),
  services: many(propertyServices),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, { fields: [bookings.propertyId], references: [properties.id] }),
  guest: one(guests, { fields: [bookings.guestId], references: [guests.id] }),
}))

export const guestsRelations = relations(guests, ({ many }) => ({
  bookings: many(bookings),
  crmLeads: many(crmLeads),
  proposals: many(proposals),
}))
