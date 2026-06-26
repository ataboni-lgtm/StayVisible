export type ClientStatus = 'Onboarding Needed' | 'Active' | 'Paused';
export type PostStatus =
  | 'Idea'
  | 'Draft'
  | 'Generated'
  | 'Sent for Approval'
  | 'Changes Requested'
  | 'Approved'
  | 'Posted'
  | 'Rejected';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  industry: string;
  location: string;
  linkedInUrl: string;
  targetAudience: string;
  topics: string[];
  topicsToAvoid: string[];
  notificationMethod: 'Email' | 'Text' | 'Both';
  status: ClientStatus;
  initials: string;
  portalAccessEnabled: boolean;
  portalPasswordSet: boolean;
}

export interface Post {
  id: string;
  clientId: string;
  postOpportunityId?: string;
  clientName: string;
  topic: string;
  type: string;
  caption: string;
  hashtags: string[];
  status: PostStatus;
  scheduledFor?: string;
  postedAt?: string;
  updatedAt: string;
}

export interface PostOpportunity {
  id: string;
  clientId: string;
  postType: string;
  topic: string;
  date?: string;
  location?: string;
  mentions?: string;
  mainTakeaway: string;
  notes?: string;
  tone?: string;
  callToAction?: string;
  photoContext?: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  token: string;
  postId: string;
  clientId: string;
  status: 'active' | 'closed';
  action?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyIdea {
  id: string;
  clientId: string;
  clientName: string;
  topic: string;
  reason: string;
  angle: string;
  status?: PostStatus;
}

export interface VoiceProfile {
  toneSummary: string;
  sentenceStyle: string;
  vocabularyStyle: string;
  postLengthPreference: string;
  commonPhrases: string[];
  wordsToAvoid: string[];
  emojiRules: string;
  hashtagRules: string;
  firstPersonPreference: string;
  personalProfessionalBalance: string;
  examplePost: string;
  dos: string[];
  donts: string[];
  learningNotes: string[];
}

export interface StoredData {
  clients: Client[];
  posts: Post[];
  weeklyIdeas: WeeklyIdea[];
  postOpportunities: PostOpportunity[];
  approvals: Approval[];
  voiceProfiles: Record<string, VoiceProfile>;
}
