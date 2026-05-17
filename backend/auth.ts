import { URLSearchParams } from "url";

export function getGoogleAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: redirectUri
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function handleGoogleCallback(code: string, state: string) {
  const redirectUri = state || `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed");
  }

  const idToken = tokenData.id_token;
  const payloadBase64 = idToken.split('.')[1];
  const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
  const userProfile = JSON.parse(decodedPayload);

  return {
    accessToken: tokenData.access_token,
    user: {
      name: userProfile.name,
      email: userProfile.email,
      avatar: userProfile.picture
    }
  };
}
