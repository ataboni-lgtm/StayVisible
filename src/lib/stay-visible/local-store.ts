import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Approval, Client, Post, PostOpportunity, StoredData, VoiceProfile, WeeklyIdea } from './types';
import { emptyVoiceProfile } from './demo-data';

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'stay-visible.json');

const initialData: StoredData = {
  clients: [],
  posts: [],
  weeklyIdeas: [],
  postOpportunities: [],
  approvals: [],
  voiceProfiles: {},
};

export async function readStore(): Promise<StoredData> {
  if (hasDatabase()) return readDatabaseStore();
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredData>;
    return {
      clients: (parsed.clients ?? []).map((client) => ({
        ...client,
        portalAccessEnabled: client.portalAccessEnabled ?? false,
        portalPasswordSet: client.portalPasswordSet ?? Boolean((client as Client & { portalPasswordHash?: string }).portalPasswordHash),
      })),
      posts: parsed.posts ?? [],
      weeklyIdeas: parsed.weeklyIdeas ?? [],
      postOpportunities: parsed.postOpportunities ?? [],
      approvals: parsed.approvals ?? [],
      voiceProfiles: parsed.voiceProfiles ?? {},
    };
  } catch {
    await writeStore(initialData);
    return initialData;
  }
}

export async function writeStore(data: StoredData) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`);
}

export async function upsertClient(input: Omit<Client, 'id' | 'initials' | 'portalPasswordSet'> & { id?: string; portalPassword?: string }) {
  if (hasDatabase()) return upsertDatabaseClient(input);
  const data = await readStore();
  const existingClient = data.clients.find((item) => item.id === input.id);
  const client: Client = {
    ...input,
    id: input.id ?? randomUUID(),
    initials: `${input.firstName[0] ?? ''}${input.lastName[0] ?? ''}`.toUpperCase(),
    portalAccessEnabled: input.portalAccessEnabled,
    portalPasswordSet: Boolean(input.portalPassword || (existingClient as Client & { portalPasswordHash?: string } | undefined)?.portalPasswordHash),
  };
  if (input.portalPassword) (client as Client & { portalPasswordHash?: string }).portalPasswordHash = hashPortalPassword(input.portalPassword);
  else if ((existingClient as Client & { portalPasswordHash?: string } | undefined)?.portalPasswordHash) {
    (client as Client & { portalPasswordHash?: string }).portalPasswordHash = (existingClient as Client & { portalPasswordHash?: string }).portalPasswordHash;
  }
  const index = data.clients.findIndex((item) => item.id === client.id);
  if (index >= 0) data.clients[index] = client;
  else data.clients.push(client);
  await writeStore(data);
  return sanitizeClient(client);
}

export async function authenticateClientPortal(email: string, password: string) {
  if (hasDatabase()) return authenticateDatabaseClientPortal(email, password);
  const data = await readStore();
  const client = data.clients.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.status !== 'Paused' && item.portalAccessEnabled);
  const hash = (client as Client & { portalPasswordHash?: string } | undefined)?.portalPasswordHash;
  if (!client || !hash || !verifyPortalPassword(password, hash)) return null;
  return sanitizeClient(client);
}

export async function saveVoiceProfile(clientId: string, profile: Partial<VoiceProfile>, onboarding: Record<string, unknown>) {
  if (hasDatabase()) return saveDatabaseVoiceProfile(clientId, profile, onboarding);
  const data = await readStore();
  data.voiceProfiles[clientId] = {
    ...emptyVoiceProfile,
    ...data.voiceProfiles[clientId],
    ...normalizeVoiceProfile(profile),
    learningNotes: data.voiceProfiles[clientId]?.learningNotes ?? [],
  };
  data.clients = data.clients.map((client) => client.id === clientId ? { ...client, status: 'Active' } : client);
  await writeStore(data);
  return { profile: data.voiceProfiles[clientId], onboarding };
}

export async function saveGeneratedPosts(input: Omit<PostOpportunity, 'id' | 'status' | 'createdAt' | 'updatedAt'>, options: Array<{ label: string; content: string }>) {
  if (hasDatabase()) return saveDatabaseGeneratedPosts(input, options);
  const data = await readStore();
  const now = new Date().toISOString();
  const client = data.clients.find((item) => item.id === input.clientId);
  const opportunity: PostOpportunity = {
    ...input,
    id: randomUUID(),
    status: 'Generated',
    createdAt: now,
    updatedAt: now,
  };
  const posts: Post[] = options.map((option) => ({
    id: randomUUID(),
    clientId: input.clientId,
    clientName: client ? `${client.firstName} ${client.lastName}` : 'Client',
    topic: input.topic,
    type: input.postType,
    caption: option.content,
    hashtags: extractHashtags(option.content),
    status: 'Generated',
    updatedAt: 'Just now',
  }));
  data.postOpportunities.unshift(opportunity);
  data.posts.unshift(...posts);
  await writeStore(data);
  return { opportunity, posts };
}

export async function savePostIdea(input: Omit<PostOpportunity, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  if (hasDatabase()) return saveDatabasePostIdea(input);
  const data = await readStore();
  const now = new Date().toISOString();
  const client = data.clients.find((item) => item.id === input.clientId);
  const opportunity: PostOpportunity = {
    ...input,
    id: randomUUID(),
    status: 'Idea',
    createdAt: now,
    updatedAt: now,
  };
  const post: Post = {
    id: randomUUID(),
    clientId: input.clientId,
    postOpportunityId: opportunity.id,
    clientName: client ? `${client.firstName} ${client.lastName}` : 'Client',
    topic: input.topic,
    type: input.postType,
    caption: input.mainTakeaway || input.notes || '',
    hashtags: [],
    status: 'Idea',
    updatedAt: 'Just now',
  };
  data.postOpportunities.unshift(opportunity);
  data.posts.unshift(post);
  await writeStore(data);
  return { opportunity, post };
}

export async function updatePost(postId: string, patch: Partial<Post>) {
  if (hasDatabase()) return updateDatabasePost(postId, patch);
  const data = await readStore();
  const post = data.posts.find((item) => item.id === postId);
  if (!post) return null;
  Object.assign(post, patch, { updatedAt: 'Just now' });
  await writeStore(data);
  return post;
}

export async function createApproval(postId: string) {
  if (hasDatabase()) return createDatabaseApproval(postId);
  const data = await readStore();
  const post = data.posts.find((item) => item.id === postId);
  if (!post) return null;
  const now = new Date().toISOString();
  const approval: Approval = {
    id: randomUUID(),
    token: randomBytes(32).toString('hex'),
    postId,
    clientId: post.clientId,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  data.approvals.unshift(approval);
  post.status = 'Sent for Approval';
  post.updatedAt = 'Just now';
  await writeStore(data);
  return approval;
}

export async function respondToApproval(token: string, caption: string, action: string, feedback?: string) {
  if (hasDatabase()) return respondToDatabaseApproval(token, caption, action, feedback);
  const data = await readStore();
  const approval = data.approvals.find((item) => item.token === token && item.status === 'active');
  if (!approval) return null;
  const post = data.posts.find((item) => item.id === approval.postId);
  if (!post) return null;
  const now = new Date().toISOString();
  approval.status = 'closed';
  approval.action = action;
  approval.feedback = feedback;
  approval.updatedAt = now;
  post.caption = caption;
  post.status = action.startsWith('approve') ? 'Approved' : action === 'reject' ? 'Rejected' : 'Changes Requested';
  post.updatedAt = 'Just now';
  if (feedback) {
    const profile = data.voiceProfiles[approval.clientId] ?? emptyVoiceProfile;
    data.voiceProfiles[approval.clientId] = {
      ...profile,
      learningNotes: [...profile.learningNotes, `Client feedback: ${feedback}`],
    };
  }
  await writeStore(data);
  return { approval, post };
}

export async function saveWeeklyIdeas(clientId: string, ideas: Array<Omit<WeeklyIdea, 'id' | 'clientId' | 'clientName'>>, sourceContext: Record<string, unknown> = {}) {
  if (hasDatabase()) return saveDatabaseWeeklyIdeas(clientId, ideas, sourceContext);
  const data = await readStore();
  const client = data.clients.find((item) => item.id === clientId);
  if (!client) return [];
  const saved = ideas.map((idea) => ({
    ...idea,
    id: randomUUID(),
    clientId,
    clientName: `${client.firstName} ${client.lastName}`,
    status: idea.status ?? 'Idea' as const,
  }));
  data.weeklyIdeas.unshift(...saved);
  await writeStore(data);
  return saved;
}

function extractHashtags(content: string) {
  return Array.from(content.matchAll(/#([\w-]+)/g)).map((match) => match[1]);
}

function normalizeVoiceProfile(profile: Partial<VoiceProfile>) {
  return {
    toneSummary: profile.toneSummary ?? '',
    sentenceStyle: profile.sentenceStyle ?? '',
    vocabularyStyle: profile.vocabularyStyle ?? '',
    postLengthPreference: profile.postLengthPreference ?? '',
    commonPhrases: profile.commonPhrases ?? [],
    wordsToAvoid: profile.wordsToAvoid ?? [],
    emojiRules: profile.emojiRules ?? '',
    hashtagRules: profile.hashtagRules ?? '',
    firstPersonPreference: profile.firstPersonPreference ?? '',
    personalProfessionalBalance: profile.personalProfessionalBalance ?? '',
    examplePost: profile.examplePost ?? '',
    dos: profile.dos ?? [],
    donts: profile.donts ?? [],
  };
}

function hasDatabase() {
  return Boolean(process.env.DB_CONNECTION_STRING);
}

async function getDbContext() {
  const [{ db }, schema, { eq: eqOperator }] = await Promise.all([
    import('@/lib/db/db'),
    import('@/lib/stay-visible/schema'),
    import('drizzle-orm'),
  ]);
  return { db, schema, eq: eqOperator };
}

async function readDatabaseStore(): Promise<StoredData> {
  const { db, schema } = await getDbContext();
  const [clientRows, postRows, ideaRows, opportunityRows, approvalRows, profileRows] = await Promise.all([
    db.select().from(schema.clients),
    db.select().from(schema.posts),
    db.select().from(schema.weeklyIdeas),
    db.select().from(schema.postOpportunities),
    db.select().from(schema.approvals),
    db.select().from(schema.voiceProfiles),
  ]);
  return {
    clients: clientRows.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone ?? '',
      company: client.company ?? '',
      jobTitle: client.jobTitle ?? '',
      industry: client.industry ?? '',
      location: client.location ?? '',
      linkedInUrl: client.linkedInProfileUrl ?? '',
      targetAudience: client.targetAudience ?? '',
      topics: client.topics,
      topicsToAvoid: client.topicsToAvoid,
      notificationMethod: client.preferredNotificationMethod,
      status: client.status,
      initials: `${client.firstName[0] ?? ''}${client.lastName[0] ?? ''}`.toUpperCase(),
      portalAccessEnabled: client.portalAccessEnabled,
      portalPasswordSet: Boolean(client.portalPasswordHash),
    })),
    posts: postRows.map((post) => ({
      id: post.id,
      clientId: post.clientId,
      postOpportunityId: post.postOpportunityId ?? undefined,
      clientName: clientRows.find((client) => client.id === post.clientId) ? `${clientRows.find((client) => client.id === post.clientId)!.firstName} ${clientRows.find((client) => client.id === post.clientId)!.lastName}` : 'Client',
      topic: opportunityRows.find((item) => item.id === post.postOpportunityId)?.topicName ?? 'LinkedIn post',
      type: opportunityRows.find((item) => item.id === post.postOpportunityId)?.postType ?? post.variantLabel ?? 'General Update',
      caption: post.caption,
      hashtags: post.hashtags,
      status: post.status,
      updatedAt: post.updatedAt.toISOString(),
    })),
    weeklyIdeas: ideaRows.map((idea) => ({
      id: idea.id,
      clientId: idea.clientId,
      clientName: clientRows.find((client) => client.id === idea.clientId) ? `${clientRows.find((client) => client.id === idea.clientId)!.firstName} ${clientRows.find((client) => client.id === idea.clientId)!.lastName}` : 'Client',
      topic: idea.suggestedTopic,
      reason: idea.whyItWorks ?? '',
      angle: idea.suggestedAngle ?? '',
    })),
    postOpportunities: opportunityRows.map((opportunity) => ({
      id: opportunity.id,
      clientId: opportunity.clientId,
      postType: opportunity.postType,
      topic: opportunity.topicName,
      date: opportunity.eventDate ?? undefined,
      location: opportunity.location ?? undefined,
      mentions: opportunity.peopleCompaniesToMention.join(', '),
      mainTakeaway: opportunity.mainTakeaway ?? '',
      notes: opportunity.notes ?? undefined,
      photoContext: opportunity.photoContext ?? undefined,
      tone: opportunity.desiredTone ?? undefined,
      callToAction: opportunity.callToAction ?? undefined,
      status: opportunity.status,
      createdAt: opportunity.createdAt.toISOString(),
      updatedAt: opportunity.updatedAt.toISOString(),
    })),
    approvals: approvalRows.map((approval) => ({
      id: approval.id,
      token: approval.approvalToken,
      postId: approval.postId,
      clientId: approval.clientId,
      status: approval.isActive ? 'active' : 'closed',
      action: approval.action ?? undefined,
      feedback: approval.feedback ?? undefined,
      createdAt: approval.createdAt.toISOString(),
      updatedAt: approval.updatedAt.toISOString(),
    })),
    voiceProfiles: Object.fromEntries(profileRows.map((profile) => [profile.clientId, {
      toneSummary: profile.toneSummary ?? '',
      sentenceStyle: profile.sentenceStyle ?? '',
      vocabularyStyle: profile.vocabularyStyle ?? '',
      postLengthPreference: profile.postLengthPreference ?? '',
      commonPhrases: profile.commonPhrases,
      wordsToAvoid: profile.wordsToAvoid,
      emojiRules: profile.emojiRules ?? '',
      hashtagRules: profile.hashtagRules ?? '',
      firstPersonPreference: profile.firstPersonPreference ?? '',
      personalProfessionalBalance: profile.personalProfessionalBalance ?? '',
      examplePost: profile.examplePost ?? '',
      dos: profile.dos,
      donts: profile.donts,
      learningNotes: profile.learningNotes,
    }])),
  };
}

async function upsertDatabaseClient(input: Omit<Client, 'id' | 'initials' | 'portalPasswordSet'> & { id?: string; portalPassword?: string }) {
  const { db, schema } = await getDbContext();
  const clientId = input.id ?? randomUUID();
  const passwordHash = input.portalPassword ? hashPortalPassword(input.portalPassword) : undefined;
  const values = {
    id: clientId,
    adminId: await ensureLocalAdmin(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    company: input.company,
    jobTitle: input.jobTitle,
    industry: input.industry,
    location: input.location,
    linkedInProfileUrl: input.linkedInUrl,
    targetAudience: input.targetAudience,
    topics: input.topics,
    topicsToAvoid: input.topicsToAvoid,
    preferredNotificationMethod: input.notificationMethod,
    status: input.status,
    portalAccessEnabled: input.portalAccessEnabled,
    ...(passwordHash ? { portalPasswordHash: passwordHash } : {}),
  };
  const [row] = await db.insert(schema.clients).values(values).onConflictDoUpdate({ target: schema.clients.id, set: values }).returning();
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    jobTitle: row.jobTitle ?? '',
    industry: row.industry ?? '',
    location: row.location ?? '',
    linkedInUrl: row.linkedInProfileUrl ?? '',
    targetAudience: row.targetAudience ?? '',
    topics: row.topics,
    topicsToAvoid: row.topicsToAvoid,
    notificationMethod: row.preferredNotificationMethod,
    status: row.status,
    initials: `${row.firstName[0] ?? ''}${row.lastName[0] ?? ''}`.toUpperCase(),
    portalAccessEnabled: row.portalAccessEnabled,
    portalPasswordSet: Boolean(row.portalPasswordHash),
  };
}

async function authenticateDatabaseClientPortal(email: string, password: string) {
  const { db, schema } = await getDbContext();
  const rows = await db.select().from(schema.clients);
  const row = rows.find((client) => client.email.toLowerCase() === email.trim().toLowerCase());
  if (!row || row.status === 'Paused' || !row.portalAccessEnabled || !row.portalPasswordHash) return null;
  if (!verifyPortalPassword(password, row.portalPasswordHash)) return null;
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    jobTitle: row.jobTitle ?? '',
    industry: row.industry ?? '',
    location: row.location ?? '',
    linkedInUrl: row.linkedInProfileUrl ?? '',
    targetAudience: row.targetAudience ?? '',
    topics: row.topics,
    topicsToAvoid: row.topicsToAvoid,
    notificationMethod: row.preferredNotificationMethod,
    status: row.status,
    initials: `${row.firstName[0] ?? ''}${row.lastName[0] ?? ''}`.toUpperCase(),
    portalAccessEnabled: row.portalAccessEnabled,
    portalPasswordSet: true,
  };
}

function sanitizeClient(client: Client) {
  const { portalPasswordHash: _portalPasswordHash, ...safeClient } = client as Client & { portalPasswordHash?: string };
  return safeClient;
}

function hashPortalPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPortalPassword(password: string, storedHash: string) {
  const [scheme, salt, hash] = storedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function saveDatabaseVoiceProfile(clientId: string, profile: Partial<VoiceProfile>, _onboarding: Record<string, unknown>) {
  const { db, schema, eq } = await getDbContext();
  const values = {
    clientId,
    ...normalizeVoiceProfile(profile),
  };
  const [row] = await db.insert(schema.voiceProfiles).values(values).onConflictDoUpdate({ target: schema.voiceProfiles.clientId, set: values }).returning();
  await db.update(schema.clients).set({ status: 'Active' }).where(eq(schema.clients.id, clientId));
  return { profile: { ...emptyVoiceProfile, ...row } as VoiceProfile };
}

async function saveDatabaseGeneratedPosts(input: Omit<PostOpportunity, 'id' | 'status' | 'createdAt' | 'updatedAt'>, options: Array<{ label: string; content: string }>) {
  const { db, schema } = await getDbContext();
  const [opportunity] = await db.insert(schema.postOpportunities).values({
    clientId: input.clientId,
    postType: input.postType,
    topicName: input.topic,
    eventDate: input.date || null,
    location: input.location,
    peopleCompaniesToMention: input.mentions ? input.mentions.split(',').map((item) => item.trim()).filter(Boolean) : [],
    mainTakeaway: input.mainTakeaway,
    notes: input.notes,
    photoContext: input.photoContext,
    desiredTone: input.tone,
    callToAction: input.callToAction,
    status: 'Generated',
  }).returning();
  const rows = await db.insert(schema.posts).values(options.map((option) => ({
    clientId: input.clientId,
    postOpportunityId: opportunity.id,
    variantLabel: option.label,
    caption: option.content,
    hashtags: extractHashtags(option.content),
    status: 'Generated' as const,
  }))).returning();
  const store = await readDatabaseStore();
  return { opportunity: store.postOpportunities.find((item) => item.id === opportunity.id)!, posts: rows.map((row) => store.posts.find((post) => post.id === row.id)!) };
}

async function saveDatabasePostIdea(input: Omit<PostOpportunity, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const { db, schema } = await getDbContext();
  const [opportunity] = await db.insert(schema.postOpportunities).values({
    clientId: input.clientId,
    postType: input.postType,
    topicName: input.topic,
    eventDate: input.date || null,
    location: input.location,
    peopleCompaniesToMention: input.mentions ? input.mentions.split(',').map((item) => item.trim()).filter(Boolean) : [],
    mainTakeaway: input.mainTakeaway,
    notes: input.notes,
    photoContext: input.photoContext,
    desiredTone: input.tone,
    callToAction: input.callToAction,
    status: 'Idea',
  }).returning();
  const [postRow] = await db.insert(schema.posts).values({
    clientId: input.clientId,
    postOpportunityId: opportunity.id,
    variantLabel: 'Saved idea',
    caption: input.mainTakeaway || input.notes || '',
    hashtags: [],
    status: 'Idea',
  }).returning();
  const store = await readDatabaseStore();
  return {
    opportunity: store.postOpportunities.find((item) => item.id === opportunity.id)!,
    post: store.posts.find((post) => post.id === postRow.id)!,
  };
}

async function updateDatabasePost(postId: string, patch: Partial<Post>) {
  const { db, schema, eq } = await getDbContext();
  const values: { caption?: string; status?: Post['status'] } = {};
  if (patch.caption) values.caption = patch.caption;
  if (patch.status) values.status = patch.status;
  const [row] = await db.update(schema.posts).set(values).where(eq(schema.posts.id, postId)).returning();
  if (!row) return null;
  const store = await readDatabaseStore();
  return store.posts.find((post) => post.id === postId) ?? null;
}

async function createDatabaseApproval(postId: string) {
  const { db, schema, eq } = await getDbContext();
  const store = await readDatabaseStore();
  const post = store.posts.find((item) => item.id === postId);
  if (!post) return null;
  const [row] = await db.insert(schema.approvals).values({
    postId,
    clientId: post.clientId,
    approvalToken: randomBytes(32).toString('hex'),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }).returning();
  await db.update(schema.posts).set({ status: 'Sent for Approval' }).where(eq(schema.posts.id, postId));
  return {
    id: row.id,
    token: row.approvalToken,
    postId: row.postId,
    clientId: row.clientId,
    status: row.isActive ? 'active' as const : 'closed' as const,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function respondToDatabaseApproval(token: string, caption: string, action: string, feedback?: string) {
  const { db, schema, eq } = await getDbContext();
  const [approval] = await db.select().from(schema.approvals).where(eq(schema.approvals.approvalToken, token)).limit(1);
  if (!approval || !approval.isActive) return null;
  const postStatus = action.startsWith('approve') ? 'Approved' : action === 'reject' ? 'Rejected' : 'Changes Requested';
  await db.update(schema.posts).set({ caption, status: postStatus }).where(eq(schema.posts.id, approval.postId));
  await db.update(schema.approvals).set({ isActive: false, action, feedback, respondedAt: new Date() }).where(eq(schema.approvals.id, approval.id));
  if (feedback) {
    const store = await readDatabaseStore();
    const profile = store.voiceProfiles[approval.clientId] ?? emptyVoiceProfile;
    await db.update(schema.voiceProfiles).set({ learningNotes: [...profile.learningNotes, `Client feedback: ${feedback}`] }).where(eq(schema.voiceProfiles.clientId, approval.clientId));
  }
  return { approval, post: { id: approval.postId } };
}

async function saveDatabaseWeeklyIdeas(clientId: string, ideas: Array<Omit<WeeklyIdea, 'id' | 'clientId' | 'clientName'>>, sourceContext: Record<string, unknown>) {
  const { db, schema } = await getDbContext();
  const weekOf = startOfWeekIso();
  const rows = await db.insert(schema.weeklyIdeas).values(ideas.map((idea) => ({
    clientId,
    weekOf,
    suggestedTopic: idea.topic,
    whyItWorks: idea.reason,
    suggestedAngle: idea.angle,
    sourceContext,
    status: 'Idea' as const,
  }))).returning();
  const store = await readDatabaseStore();
  return rows.map((row) => store.weeklyIdeas.find((idea) => idea.id === row.id)!).filter(Boolean);
}

function startOfWeekIso(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy.toISOString().slice(0, 10);
}

async function ensureLocalAdmin() {
  const { db, schema } = await getDbContext();
  const id = '00000000-0000-4000-8000-000000000001';
  await db.insert(schema.admins).values({ id, fullName: 'Local Admin', email: 'local@stayvisible.local' }).onConflictDoNothing();
  return id;
}
