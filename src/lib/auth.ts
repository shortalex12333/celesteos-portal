// Auth state for the import flow.
// After 2FA verification, the registration backend returns:
//   import_token: JWT signed with MASTER_SUPABASE_JWT_SECRET
//   yacht_name: display name
//   yacht_id: UUID (in the token payload)
//
// This module stores the token in sessionStorage (cleared on tab close)
// and provides helpers to check auth state.

const TOKEN_KEY = "celeste_import_token";
const YACHT_KEY = "celeste_yacht_name";
const EMAIL_KEY = "celeste_user_email";

export interface AuthState {
  token: string;
  yachtName: string;
  email: string;
}

export function storeAuth(token: string, yachtName: string, email: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(YACHT_KEY, yachtName);
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function getAuth(): AuthState | null {
  // Dev mode bypass: if VITE_IMPORT_DEV_YACHT_ID is set, fake auth state
  // so we can reach /import without going through registration/2FA
  const devYachtId = import.meta.env.VITE_IMPORT_DEV_YACHT_ID;
  if (import.meta.env.DEV && devYachtId) {
    return { token: "dev-bypass", yachtName: "Test Vessel", email: "dev@celeste7.ai" };
  }

  const token = sessionStorage.getItem(TOKEN_KEY);
  const yachtName = sessionStorage.getItem(YACHT_KEY);
  const email = sessionStorage.getItem(EMAIL_KEY);
  if (!token) return null;
  return { token, yachtName: yachtName || "", email: email || "" };
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(YACHT_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}
