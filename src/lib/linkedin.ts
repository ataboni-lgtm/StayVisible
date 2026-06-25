/**
 * LinkedIn publishing must use LinkedIn's official OAuth flow.
 * Personal profile posting requires the appropriate LinkedIn product access and permissions.
 * Never scrape LinkedIn, automate a browser, or store a member's password.
 */
export function getLinkedInAuthUrl(): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID ?? '';
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI ?? '';
  const params = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri, scope: 'openid profile email w_member_social', state: crypto.randomUUID() });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export async function exchangeCodeForToken(_code: string): Promise<never> {
  // Exchange the authorization code only on the server. Persist encrypted tokens in a secure store.
  throw new Error('LinkedIn OAuth is a placeholder. Configure approved LinkedIn app access before enabling.');
}

export async function createLinkedInPost(_accessToken: string, _authorUrn: string, _content: string): Promise<never> {
  // Only invoke after the client has explicitly approved the exact final caption.
  throw new Error('LinkedIn publishing is disabled until official OAuth permissions are configured.');
}
