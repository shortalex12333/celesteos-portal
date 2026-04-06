import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { createImportApi } from "../../lib/importApi";
import { getAuth } from "../../lib/auth";
import { ImportError } from "../../lib/importApi";
import type { ImportSession as ImportSessionType } from "../../types/import";
import ImportLayout from "./ImportLayout";
import ImportProgress from "./ImportProgress";
import DetectingScreen from "./DetectingScreen";
import MappingScreen from "./MappingScreen";
import PreviewScreen from "./PreviewScreen";
import CommitScreen from "./CommitScreen";
import RollbackScreen from "./RollbackScreen";

const POLL_STATUSES = new Set(["pending", "detecting", "importing"]);
const WIDE_STATUSES = new Set(["mapping", "preview"]);

export default function ImportSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ImportSessionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const auth = getAuth();
  if (!auth) return <Navigate to="/" replace />;

  const handleAuthExpired = useCallback(() => {
    setAuthExpired(true);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const api = createImportApi(auth.token, handleAuthExpired);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchSession() {
      try {
        const data = await api.getSession(sessionId!);
        setSession(data);
        setError(null);

        if (!POLL_STATUSES.has(data.status) && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (err) {
        if (err instanceof ImportError && err.isAuthError) return;
        if (err instanceof ImportError && err.status === 404) {
          setError("This import session no longer exists or has expired.");
        } else {
          setError(
            err instanceof ImportError
              ? err.detail
              : "Failed to load import session."
          );
        }
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }

    fetchSession();
    pollRef.current = setInterval(fetchSession, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId]);

  // Auth expired — redirect to sign in
  if (authExpired) {
    return (
      <ImportLayout>
        <div className="panel-premium fade-in">
          <div className="glass-hdr">
            <span className="glass-hdr-title" style={{ color: "var(--amber)" }}>
              Session expired
            </span>
          </div>
          <div style={{ padding: "24px" }}>
            <p style={{ fontSize: "13px", color: "var(--txt2)", margin: "0 0 16px" }}>
              Your session has expired. Sign in again to continue.
            </p>
            <Link
              to="/"
              className="btn-brand"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </ImportLayout>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <ImportLayout>
        <div className="panel-premium fade-in">
          <div className="glass-hdr">
            <span className="glass-hdr-title" style={{ color: "var(--red)" }}>
              Error
            </span>
          </div>
          <div style={{ padding: "24px" }}>
            <p style={{ color: "var(--red)", fontSize: "13px", margin: "0 0 16px" }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-brand"
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                style={{ flex: 1 }}
              >
                Retry
              </button>
              <Link
                to="/import"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "44px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-sub)",
                  color: "var(--txt3)",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Start over
              </Link>
            </div>
          </div>
        </div>
      </ImportLayout>
    );
  }

  // Loading state with shimmer
  if (!session) {
    return (
      <ImportLayout>
        <div className="panel-premium">
          <div className="glass-hdr">
            <span className="glass-hdr-title">Import</span>
          </div>
          <div style={{ padding: "24px" }}>
            <div className="shimmer-row" style={{ width: "60%", marginBottom: "8px" }} />
            <div className="shimmer-row" style={{ width: "40%" }} />
          </div>
        </div>
      </ImportLayout>
    );
  }

  const isWide = WIDE_STATUSES.has(session.status);

  function renderScreen() {
    if (!session) return null;

    switch (session.status) {
      case "pending":
      case "detecting":
        return <DetectingScreen session={session} />;

      case "mapping":
        return (
          <MappingScreen
            session={session}
            api={api}
            onUpdate={setSession}
          />
        );

      case "preview":
        return (
          <PreviewScreen
            session={session}
            api={api}
            onUpdate={setSession}
          />
        );

      case "importing":
        return <CommitScreen session={session} />;

      case "completed":
        return (
          <CommitScreen
            session={session}
            api={api}
            onUpdate={setSession}
          />
        );

      case "rolled_back":
        return (
          <RollbackScreen
            session={session}
            api={api}
            onUpdate={setSession}
          />
        );

      case "failed":
        return (
          <div className="panel-premium fade-in">
            <div className="glass-hdr">
              <span className="glass-hdr-title" style={{ color: "var(--red)" }}>
                Failed
              </span>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "var(--txt2)", margin: "0 0 16px" }}>
                Import failed. No changes were made to your vessel data.
              </p>
              <Link
                to="/import"
                className="btn-brand"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                Try again with a new file
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <ImportLayout wide={isWide}>
      <ImportProgress status={session.status} />
      {renderScreen()}
    </ImportLayout>
  );
}
