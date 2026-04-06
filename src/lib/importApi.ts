import { IMPORT_API_URL } from './config';
import { clearAuth } from './auth';
import type {
  SourceType,
  ColumnMap,
  ImportSession,
  UploadResponse,
  ConfirmMappingResponse,
  DryRunResponse,
  CommitResponse,
  RollbackResponse,
} from '../types/import';

export class ImportError extends Error {
  status: number;
  detail: string;
  isAuthError: boolean;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.isAuthError = status === 401 || status === 403;
  }
}

async function parseErrorBody(resp: Response): Promise<string> {
  try {
    const body = await resp.json();
    return body.error || body.detail || body.message || `${resp.status} ${resp.statusText}`;
  } catch {
    return `${resp.status} ${resp.statusText}`;
  }
}

// In production: JWT from 2FA contains yacht_id — multi-tenant, per-user.
// In local dev only: VITE_IMPORT_DEV_YACHT_ID bypasses JWT for testing.
// The dev header is stripped by backend in production (IMPORT_DEV_MODE is never set on Render).
export function createImportApi(token: string, onAuthExpired?: () => void) {
  if (!token && !import.meta.env.DEV) {
    throw new Error('Import API requires an auth token.');
  }

  const devYachtId = import.meta.env.DEV
    ? import.meta.env.VITE_IMPORT_DEV_YACHT_ID
    : undefined;
  const authHeaders: Record<string, string> = devYachtId
    ? { 'X-Import-Dev-Token': devYachtId }
    : { Authorization: `Bearer ${token}` };

  async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const resp = await fetch(url, {
      ...init,
      headers: { ...authHeaders, ...init?.headers },
    });

    if (!resp.ok) {
      const detail = await parseErrorBody(resp);

      // Handle auth expiry: clear stored token, notify caller
      if (resp.status === 401) {
        clearAuth();
        onAuthExpired?.();
        throw new ImportError(401, 'Session expired. Redirecting to sign in.');
      }
      if (resp.status === 403) {
        throw new ImportError(403, 'Access denied. This import session belongs to a different vessel.');
      }

      throw new ImportError(resp.status, detail);
    }

    let data: T;
    try {
      data = await resp.json();
    } catch {
      throw new ImportError(resp.status, 'Invalid response from server. No changes were made.');
    }
    return data;
  }

  return {
    upload(source: SourceType, files: File[]): Promise<UploadResponse> {
      const form = new FormData();
      form.append('source', source);
      files.forEach((f) => form.append('files', f));
      return request<UploadResponse>(
        `${IMPORT_API_URL}/api/import/upload`,
        { method: 'POST', body: form }
      );
    },

    getSession(id: string): Promise<ImportSession> {
      return request<ImportSession>(
        `${IMPORT_API_URL}/api/import/session/${id}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
    },

    confirmMapping(id: string, mappings: ColumnMap[]): Promise<ConfirmMappingResponse> {
      return request<ConfirmMappingResponse>(
        `${IMPORT_API_URL}/api/import/session/${id}/confirm-mapping`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mappings }),
        }
      );
    },

    dryRun(id: string): Promise<DryRunResponse> {
      return request<DryRunResponse>(
        `${IMPORT_API_URL}/api/import/session/${id}/dry-run`,
        { method: 'POST' }
      );
    },

    commit(id: string): Promise<CommitResponse> {
      return request<CommitResponse>(
        `${IMPORT_API_URL}/api/import/session/${id}/commit`,
        { method: 'POST' }
      );
    },

    rollback(id: string): Promise<RollbackResponse> {
      return request<RollbackResponse>(
        `${IMPORT_API_URL}/api/import/session/${id}/rollback`,
        { method: 'POST' }
      );
    },
  };
}

export type ImportApi = ReturnType<typeof createImportApi>;
