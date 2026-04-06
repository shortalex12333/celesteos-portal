import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Database, Table2, FileSpreadsheet } from "lucide-react";
import { IMPORT_API_URL } from "../../lib/config";
import type { SourceType } from "../../types/import";

const SOURCE_OPTIONS: { value: SourceType; label: string; desc: string }[] = [
  { value: "idea_yacht", label: "IDEA Yacht", desc: "SQL dump or CSV per table" },
  { value: "seahub", label: "Seahub", desc: "CSV per module" },
  { value: "sealogical", label: "Sealogical", desc: "Excel export per module" },
  { value: "generic", label: "Generic", desc: "CSV or Excel spreadsheet" },
];

const ACCEPTED_EXTENSIONS: Record<string, string[]> = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/sql": [".sql"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  if (name.endsWith(".sql")) return Database;
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return FileSpreadsheet;
  if (name.endsWith(".csv")) return Table2;
  return FileText;
}

interface Props {
  token: string;
  yachtName: string;
}

export default function UploadScreen({ token, yachtName }: Props) {
  const navigate = useNavigate();
  const [source, setSource] = useState<SourceType | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
  const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total

  const onDrop = useCallback((accepted: File[]) => {
    // Check individual file sizes
    const oversized = accepted.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setError(
        `File too large: ${oversized[0].name} (${formatBytes(oversized[0].size)}). Maximum file size is 200 MB.`
      );
      return;
    }

    setFiles((prev) => {
      const next = [...prev, ...accepted];
      const totalSize = next.reduce((s, f) => s + f.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        setError(`Total upload size exceeds 500 MB. Remove some files.`);
        return prev;
      }
      return next;
    });
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_EXTENSIONS,
    multiple: true,
  });

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (!source || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Use XMLHttpRequest for upload progress tracking
      const result = await new Promise<{ import_session_id: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const form = new FormData();
          form.append("source", source);
          files.forEach((f) => form.append("files", f));

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Invalid response from server. No changes were made."));
              }
            } else {
              try {
                const body = JSON.parse(xhr.responseText);
                reject(new Error(body.error || body.detail || `Upload failed (${xhr.status}).`));
              } catch {
                reject(new Error(`Upload failed (${xhr.status}). No changes were made.`));
              }
            }
          };

          xhr.onerror = () => reject(new Error("Network error. Check your connection."));
          xhr.ontimeout = () => reject(new Error("Upload timed out. Try a smaller file."));

          const devYachtId = import.meta.env.DEV
            ? import.meta.env.VITE_IMPORT_DEV_YACHT_ID
            : undefined;

          xhr.open("POST", `${IMPORT_API_URL}/api/import/upload`);
          xhr.timeout = 120000; // 2 minutes
          if (devYachtId) {
            xhr.setRequestHeader("X-Import-Dev-Token", devYachtId);
          } else {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
          xhr.send(form);
        }
      );

      navigate(`/import/${result.import_session_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. No changes were made."
      );
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const canUpload = source !== "" && files.length > 0 && !uploading;

  return (
    <div className="panel-premium fade-in">
      {/* Glass header */}
      <div className="glass-hdr">
        <span className="glass-hdr-title">Import</span>
        <span className="glass-hdr-meta">
          {yachtName || "Upload vessel data"}
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Source selection */}
        <label className="label-brand" htmlFor="source-select">
          Source system
        </label>
        <select
          id="source-select"
          className="select-premium"
          value={source}
          onChange={(e) => setSource(e.target.value as SourceType)}
          style={{ marginBottom: "20px" }}
        >
          <option value="" disabled>
            Select source PMS
          </option>
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.desc}
            </option>
          ))}
        </select>

        {/* Magnetic snap drop zone */}
        <label className="label-brand">Export files</label>
        <div
          {...getRootProps()}
          className={`drop-zone ${isDragActive ? "active" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload size={24} className="drop-icon" />
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: isDragActive ? "var(--mark)" : "var(--txt2)",
              margin: "0 0 6px",
              transition: "color 120ms",
            }}
          >
            {isDragActive ? "Release to upload" : "Drop files here or browse"}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--txt-ghost)",
              margin: 0,
              fontFamily: "var(--font-mono)",
            }}
          >
            .csv .xlsx .xls .sql .zip
          </p>
        </div>

        {/* File cards (snapped after drop) */}
        {files.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "12px",
            }}
          >
            {files.map((file, i) => {
              const Icon = getFileIcon(file.name);
              return (
                <div key={`${file.name}-${i}`} className="file-card">
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      background: "var(--teal-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} style={{ color: "var(--mark)" }} />
                  </div>
                  <span
                    className="mono"
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "var(--txt)",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: "11px",
                      color: "var(--txt-ghost)",
                      flexShrink: 0,
                    }}
                  >
                    {formatBytes(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "4px",
                      cursor: "pointer",
                      color: "var(--txt-ghost)",
                      flexShrink: 0,
                      display: "flex",
                      borderRadius: "4px",
                      transition: "background 60ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--red-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--red)",
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        )}

        {/* Upload button + progress */}
        <div style={{ marginTop: "20px" }}>
          {uploading && uploadProgress < 100 && (
            <div style={{ marginBottom: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--txt2)" }}>
                  Uploading...
                </span>
                <span
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--txt3)" }}
                >
                  {uploadProgress}%
                </span>
              </div>
              <div
                style={{
                  height: "3px",
                  width: "100%",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress}%`,
                    borderRadius: "2px",
                    background: "var(--mark)",
                    transition: "width 200ms ease",
                  }}
                />
              </div>
            </div>
          )}
          <button
            className="btn-brand"
            onClick={handleUpload}
            disabled={!canUpload}
            style={{
              width: "100%",
              transition: "opacity 120ms, box-shadow 200ms",
              boxShadow: canUpload
                ? "0 0 20px rgba(58,124,157,0.2)"
                : "none",
            }}
          >
            {uploading
              ? uploadProgress >= 100
                ? "Analysing..."
                : "Uploading..."
              : "Upload and analyse"}
          </button>
        </div>
      </div>
    </div>
  );
}
