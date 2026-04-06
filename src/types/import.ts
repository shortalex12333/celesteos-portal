// Import pipeline types — matches backend API contracts
// See: docs/plans/ONBOARDING_IMPORT_PIPELINE_PLAN.md §4

export type SourceType = 'idea_yacht' | 'seahub' | 'sealogical' | 'generic';

export type ImportStatus =
  | 'pending'
  | 'detecting'
  | 'mapping'
  | 'preview'
  | 'importing'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export type ConfidenceLevel = 'green' | 'amber' | 'red';

export type WarningSeverity = 'info' | 'amber' | 'red';

export type MappingAction = 'map' | 'skip';

// --- Detection result (from parse & detect) ---

export interface DetectedColumn {
  source_name: string;
  suggested_target?: string | null;
  confidence?: number;
  action?: MappingAction;
  sample_values: string[];
  inferred_type?: string;
}

export interface DetectedFile {
  filename: string;
  domain: string;
  encoding_detected: string;
  delimiter_detected: string;
  header_row: number;
  row_count: number;
  date_format_detected: string;
  columns: DetectedColumn[];
  warnings: ImportWarning[];
}

export interface DetectedDocument {
  filename: string;
  size_bytes: number;
  type: string;
  domain_hint?: string;
  storage_path?: string;
}

export interface DetectionResult {
  source_detected: SourceType;
  data_files: DetectedFile[];
  documents: DetectedDocument[];
  unclassified: { filename: string; size_bytes?: number }[];
}

// --- Column vocabulary ---

export interface DomainVocabulary {
  mappable: string[];
  auto_set: string[];
  required: string[];
}

export type CelesteVocabulary = Record<string, DomainVocabulary>;

// --- Import session (GET /api/import/session/:id) ---

export interface ImportSession {
  id: string;
  yacht_id: string;
  source: SourceType;
  status: ImportStatus;
  file_paths: string[];
  detection_result: DetectionResult | null;
  celeste_vocabulary: CelesteVocabulary | null;
  column_map: ColumnMap[] | null;
  preview_summary: PreviewSummary | null;
  records_created: Record<string, number> | null;
  warnings: ImportWarning[] | null;
  created_at: string;
  completed_at: string | null;
  rolled_back_at?: string | null;
  rollback_available_until?: string | null;
}

// --- Column mapping (POST confirm-mapping) ---

export interface ColumnMapping {
  source: string;
  target: string | null;
  action: MappingAction;
  date_format?: string;
  transform?: string;
}

export interface ColumnMap {
  file: string;
  domain: string;
  columns: ColumnMapping[];
}

// --- Preview (from dry-run) ---

export interface DomainSummary {
  total: number;
  new: number;
  duplicates: number;
  errors: number;
  warnings_count: number;
  orphaned?: number;
}

export interface ImportWarning {
  domain?: string;
  row?: number;
  field: string;
  message: string;
  severity: WarningSeverity;
}

export interface PreviewSummary {
  domains: Record<string, DomainSummary>;
  total_records: number;
  can_commit: boolean;
  warnings: ImportWarning[];
  first_10: Record<string, Record<string, unknown>[]>;
}

// --- API responses ---

export interface UploadResponse {
  import_session_id: string;
  status: ImportStatus;
  files_received: string[];
  message: string;
}

export interface ConfirmMappingResponse {
  status: string;
  message: string;
}

export interface DryRunResponse {
  status: ImportStatus;
  preview_summary: PreviewSummary;
}

export interface CommitResponse {
  status: ImportStatus;
  records_created: Record<string, number>;
  message: string;
  rollback_available_until: string;
}

export interface RollbackResponse {
  status: ImportStatus;
  records_deleted: Record<string, number>;
  message: string;
}
