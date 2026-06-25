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
}

export interface Post {
  id: string;
  clientId: string;
  clientName: string;
  topic: string;
  type: string;
  caption: string;
  hashtags: string[];
  status: PostStatus;
  updatedAt: string;
}

export interface WeeklyIdea {
  id: string;
  clientId: string;
  clientName: string;
  topic: string;
  reason: string;
  angle: string;
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
