import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const clientStatus = pgEnum('client_status', ['Onboarding Needed', 'Active', 'Paused']);
export const postStatus = pgEnum('post_status', [
  'Idea',
  'Draft',
  'Generated',
  'Sent for Approval',
  'Changes Requested',
  'Approved',
  'Posted',
  'Rejected',
]);
export const notificationMethod = pgEnum('notification_method', ['Email', 'Text', 'Both']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const admins = pgTable('admins', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  ...timestamps,
});

export const clients = pgTable(
  'clients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminId: uuid('admin_id')
      .notNull()
      .references(() => admins.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    jobTitle: text('job_title'),
    industry: text('industry'),
    location: text('location'),
    linkedInProfileUrl: text('linkedin_profile_url'),
    targetAudience: text('target_audience'),
    topics: text('topics').array().notNull().default([]),
    topicsToAvoid: text('topics_to_avoid').array().notNull().default([]),
    preferredNotificationMethod: notificationMethod('preferred_notification_method').notNull().default('Email'),
    status: clientStatus('status').notNull().default('Onboarding Needed'),
    recentActivityNotes: text('recent_activity_notes'),
    portalAccessEnabled: boolean('portal_access_enabled').notNull().default(false),
    portalPasswordHash: text('portal_password_hash'),
    ...timestamps,
  },
  (table) => ({
    adminIdx: index('clients_admin_id_idx').on(table.adminId),
    statusIdx: index('clients_status_idx').on(table.status),
  }),
);

export const voiceProfiles = pgTable(
  'voice_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    toneSummary: text('tone_summary'),
    sentenceStyle: text('sentence_style'),
    vocabularyStyle: text('vocabulary_style'),
    postLengthPreference: text('post_length_preference'),
    commonPhrases: text('common_phrases').array().notNull().default([]),
    wordsToAvoid: text('words_to_avoid').array().notNull().default([]),
    emojiRules: text('emoji_rules'),
    hashtagRules: text('hashtag_rules'),
    firstPersonPreference: text('first_person_preference'),
    personalProfessionalBalance: text('personal_professional_balance'),
    examplePost: text('example_post'),
    dos: text('dos').array().notNull().default([]),
    donts: text('donts').array().notNull().default([]),
    learningNotes: text('learning_notes').array().notNull().default([]),
    sourceAnswers: jsonb('source_answers').$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (table) => ({
    clientUniqueIdx: uniqueIndex('voice_profiles_client_id_idx').on(table.clientId),
  }),
);

export const postOpportunities = pgTable(
  'post_opportunities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    postType: text('post_type').notNull(),
    topicName: text('topic_name').notNull(),
    eventDate: date('event_date'),
    location: text('location'),
    peopleCompaniesToMention: text('people_companies_to_mention').array().notNull().default([]),
    mainTakeaway: text('main_takeaway'),
    notes: text('notes'),
    photoContext: text('photo_context'),
    desiredTone: text('desired_tone'),
    callToAction: text('call_to_action'),
    status: postStatus('status').notNull().default('Idea'),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('opportunities_client_id_idx').on(table.clientId),
    statusIdx: index('opportunities_status_idx').on(table.status),
  }),
);

export const photos = pgTable(
  'photos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    postOpportunityId: uuid('post_opportunity_id').references(() => postOpportunities.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    altText: text('alt_text'),
    context: text('context'),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('photos_client_id_idx').on(table.clientId),
  }),
);

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    postOpportunityId: uuid('post_opportunity_id').references(() => postOpportunities.id, { onDelete: 'set null' }),
    variantLabel: text('variant_label'),
    caption: text('caption').notNull().default(''),
    hashtags: text('hashtags').array().notNull().default([]),
    selected: boolean('selected').notNull().default(false),
    status: postStatus('status').notNull().default('Draft'),
    scheduledFor: date('scheduled_for'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    postedAt: timestamp('posted_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('posts_client_id_idx').on(table.clientId),
    statusIdx: index('posts_status_idx').on(table.status),
    scheduledForIdx: index('posts_scheduled_for_idx').on(table.scheduledFor),
  }),
);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    approvalToken: text('approval_token').notNull().unique(),
    action: text('action'),
    feedback: text('feedback'),
    isActive: boolean('is_active').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    postIdx: index('approvals_post_id_idx').on(table.postId),
    clientIdx: index('approvals_client_id_idx').on(table.clientId),
    tokenIdx: index('approvals_token_idx').on(table.approvalToken),
  }),
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
    postOpportunityId: uuid('post_opportunity_id').references(() => postOpportunities.id, { onDelete: 'cascade' }),
    approvalId: uuid('approval_id').references(() => approvals.id, { onDelete: 'set null' }),
    notificationType: text('notification_type').notNull().default('general'),
    channel: text('channel').notNull(),
    recipient: text('recipient').notNull(),
    providerMessageId: text('provider_message_id'),
    status: text('status').notNull().default('queued'),
    errorMessage: text('error_message'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('notifications_client_id_idx').on(table.clientId),
    postIdx: index('notifications_post_id_idx').on(table.postId),
    opportunityIdx: index('notifications_opportunity_id_idx').on(table.postOpportunityId),
  }),
);

export const socialAccounts = pgTable(
  'social_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('linkedin'),
    providerAccountId: text('provider_account_id'),
    accessTokenEncrypted: text('access_token_encrypted'),
    refreshTokenEncrypted: text('refresh_token_encrypted'),
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    scopes: text('scopes').array().notNull().default([]),
    status: text('status').notNull().default('disconnected'),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('social_accounts_client_id_idx').on(table.clientId),
    providerUniqueIdx: uniqueIndex('social_accounts_client_provider_idx').on(table.clientId, table.provider),
  }),
);

export const editFeedback = pgTable(
  'edit_feedback',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    originalCaption: text('original_caption'),
    finalCaption: text('final_caption'),
    feedback: text('feedback'),
    feedbackType: text('feedback_type'),
    extractedLearning: text('extracted_learning'),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('edit_feedback_client_id_idx').on(table.clientId),
    postIdx: index('edit_feedback_post_id_idx').on(table.postId),
  }),
);

export const weeklyIdeas = pgTable(
  'weekly_ideas',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    weekOf: date('week_of').notNull(),
    suggestedTopic: text('suggested_topic').notNull(),
    whyItWorks: text('why_it_works'),
    suggestedAngle: text('suggested_angle'),
    sourceContext: jsonb('source_context').$type<Record<string, unknown>>().notNull().default({}),
    status: postStatus('status').notNull().default('Idea'),
    postOpportunityId: uuid('post_opportunity_id').references(() => postOpportunities.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (table) => ({
    clientIdx: index('weekly_ideas_client_id_idx').on(table.clientId),
    statusIdx: index('weekly_ideas_status_idx').on(table.status),
  }),
);
