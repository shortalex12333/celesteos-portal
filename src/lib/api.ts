import { API_BASE_URL } from "./config";

export interface VerifyResponse {
  success: boolean;
  download_url?: string;
  yacht_name?: string;
  yacht_id?: string;
  platform?: string;
  import_token?: string;
  error?: string;
  attempts_remaining?: number;
}

export async function requestDownloadCode(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const resp = await fetch(`${API_BASE_URL}/api/request-download-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return resp.json();
}

export async function verifyDownloadCode(
  email: string,
  code: string
): Promise<VerifyResponse> {
  const resp = await fetch(`${API_BASE_URL}/api/verify-download-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return resp.json();
}

export interface InviteRequest {
  email: string;
  name: string;
  rank: string;
}

export async function sendInvites(
  token: string,
  invitees: InviteRequest[]
): Promise<{ success: boolean; error?: string }> {
  const resp = await fetch(`${API_BASE_URL}/api/invite-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invitees }),
  });
  return resp.json();
}
