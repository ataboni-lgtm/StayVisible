import type { Client, Post, VoiceProfile, WeeklyIdea } from './types';

export const clients: Client[] = [];
export const posts: Post[] = [];
export const weeklyIdeas: WeeklyIdea[] = [];

export const emptyVoiceProfile: VoiceProfile = {
  toneSummary: '',
  sentenceStyle: '',
  vocabularyStyle: '',
  postLengthPreference: '',
  commonPhrases: [],
  wordsToAvoid: [],
  emojiRules: '',
  hashtagRules: '',
  firstPersonPreference: '',
  personalProfessionalBalance: '',
  examplePost: '',
  dos: [],
  donts: [],
  learningNotes: [],
};

export function getClient(id: string) {
  return clients.find((client) => client.id === id) ?? null;
}

export function getPost(id: string) {
  return posts.find((post) => post.id === id) ?? null;
}
