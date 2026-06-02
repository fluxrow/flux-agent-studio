/**
 * Workspace-scoped localStorage adapters for Phase 15 compliance entities.
 *
 * Decoupled from the Runtime / CRM. When the matching Supabase tables land,
 * swap this module for a server-backed implementation without touching pages.
 */
import type {
  AuditAction,
  AuditLogEntry,
  ComplianceDocKind,
  ComplianceDocument,
  ConsentChannel,
  ConsentRecord,
  ConsentRegime,
  ConsentStatus,
  CredentialProvider,
  CredentialRecord,
  CredentialStatus,
} from "./types";
import { emitComplianceEvent } from "./events";

const WS = () => {
  try {
    return localStorage.getItem("fluxbot:activeWorkspace") || "ws_default";
  } catch {
    return "ws_default";
  }
};

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
};

const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const now = () => new Date().toISOString();

/* ---------------- Compliance documents ---------------- */

const DOCS_KEY = (ws: string) => `fluxbot:compliance:docs:${ws}`;

const DEFAULT_DOCS: Record<ComplianceDocKind, { title: string; body: string }> = {
  privacy: {
    title: "Política de Privacidade",
    body: `# Política de Privacidade\n\nA FluxBot processa dados pessoais em conformidade com a LGPD e o GDPR. Esta política descreve quais dados coletamos, como utilizamos e quais são seus direitos.\n\n## Dados coletados\n- Identificadores fornecidos voluntariamente em conversas\n- Metadados de sessão (navegador, idioma, fuso horário)\n- Eventos de interação com o bot\n\n## Bases legais\n- Consentimento\n- Execução de contrato\n- Interesse legítimo\n\n## Seus direitos\nVocê pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados a qualquer momento.`,
  },
  terms: {
    title: "Termos de Uso",
    body: `# Termos de Uso\n\nAo utilizar a plataforma FluxBot você concorda com os termos abaixo.\n\n## Uso aceitável\nÉ proibido utilizar a plataforma para envio de spam, conteúdo ilegal ou ofensivo.\n\n## Disponibilidade\nA FluxBot oferece o serviço "como está", buscando alta disponibilidade mas sem garantia absoluta.\n\n## Limitação de responsabilidade\nA FluxBot não se responsabiliza por perdas indiretas decorrentes do uso da plataforma.`,
  },
  data_deletion: {
    title: "Exclusão de Dados",
    body: `# Solicitação de Exclusão de Dados\n\nPara solicitar a exclusão dos seus dados, envie um e-mail para privacy@fluxbot.app contendo:\n\n- Nome completo\n- E-mail utilizado\n- Identificador do visitante (quando disponível)\n\nProcessamos solicitações em até 15 dias corridos, conforme exigido pela LGPD.`,
  },
};

export function getComplianceDocs(): ComplianceDocument[] {
  const ws = WS();
  const stored = read<ComplianceDocument[]>(DOCS_KEY(ws), []);
  if (stored.length === 3) return stored;
  const kinds: ComplianceDocKind[] = ["privacy", "terms", "data_deletion"];
  const seeded: ComplianceDocument[] = kinds.map((kind) => {
    const existing = stored.find((d) => d.kind === kind);
    if (existing) return existing;
    return {
      id: uid("doc"),
      workspaceId: ws,
      kind,
      title: DEFAULT_DOCS[kind].title,
      body: DEFAULT_DOCS[kind].body,
      version: 1,
      updatedAt: now(),
    };
  });
  write(DOCS_KEY(ws), seeded);
  return seeded;
}

export function getComplianceDoc(kind: ComplianceDocKind): ComplianceDocument {
  return getComplianceDocs().find((d) => d.kind === kind)!;
}

export function updateComplianceDoc(
  kind: ComplianceDocKind,
  patch: { title?: string; body?: string; updatedBy?: string },
): ComplianceDocument {
  const ws = WS();
  const docs = getComplianceDocs();
  const idx = docs.findIndex((d) => d.kind === kind);
  const updated: ComplianceDocument = {
    ...docs[idx],
    ...patch,
    version: docs[idx].version + 1,
    updatedAt: now(),
  };
  docs[idx] = updated;
  write(DOCS_KEY(ws), docs);
  const evt =
    kind === "privacy" ? "privacy_updated"
      : kind === "terms" ? "terms_updated"
      : "data_deletion_updated";
  emitComplianceEvent(evt, { docId: updated.id, version: updated.version });
  recordAudit({
    action: kind === "privacy" ? "privacy_updated" : kind === "terms" ? "terms_updated" : "privacy_updated",
    target: updated.id,
    metadata: { kind, version: updated.version },
  });
  return updated;
}

/* ---------------- Consent ---------------- */

const CONSENT_KEY = (ws: string) => `fluxbot:compliance:consent:${ws}`;

export function listConsents(): ConsentRecord[] {
  return read<ConsentRecord[]>(CONSENT_KEY(WS()), []);
}

export function recordConsent(input: {
  visitorId: string;
  regime: ConsentRegime;
  channel: ConsentChannel;
  status: ConsentStatus;
  policyVersion?: number;
  origin?: string;
  userAgent?: string;
}): ConsentRecord {
  const ws = WS();
  const entry: ConsentRecord = {
    id: uid("cnst"),
    workspaceId: ws,
    recordedAt: now(),
    ...input,
  };
  const all = listConsents();
  all.unshift(entry);
  write(CONSENT_KEY(ws), all.slice(0, 500));
  emitComplianceEvent(input.status === "granted" ? "consent_granted" : "consent_revoked", {
    visitorId: input.visitorId,
    regime: input.regime,
    channel: input.channel,
  });
  recordAudit({
    action: input.status === "granted" ? "consent_granted" : "consent_revoked",
    target: input.visitorId,
    metadata: { regime: input.regime, channel: input.channel },
  });
  return entry;
}

/* ---------------- Audit log ---------------- */

const AUDIT_KEY = (ws: string) => `fluxbot:compliance:audit:${ws}`;

export function listAuditLogs(limit = 200): AuditLogEntry[] {
  return read<AuditLogEntry[]>(AUDIT_KEY(WS()), []).slice(0, limit);
}

export function recordAudit(input: {
  action: AuditAction;
  actor?: string;
  target?: string;
  metadata?: Record<string, unknown>;
}): AuditLogEntry {
  const ws = WS();
  const entry: AuditLogEntry = {
    id: uid("aud"),
    workspaceId: ws,
    actor: input.actor ?? "system",
    action: input.action,
    target: input.target,
    metadata: input.metadata,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    at: now(),
  };
  const all = read<AuditLogEntry[]>(AUDIT_KEY(ws), []);
  all.unshift(entry);
  write(AUDIT_KEY(ws), all.slice(0, 1000));
  // Avoid recursive audit_log_created loop — only emit the bus event.
  emitComplianceEvent("audit_log_created", { action: entry.action, target: entry.target });
  return entry;
}

/* ---------------- Credentials ---------------- */

const CREDS_KEY = (ws: string) => `fluxbot:compliance:credentials:${ws}`;

export function listCredentials(): CredentialRecord[] {
  return read<CredentialRecord[]>(CREDS_KEY(WS()), []);
}

const mask = (v: string) => {
  if (!v) return "";
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 3)}•••••${v.slice(-4)}`;
};

export function addCredential(input: {
  provider: CredentialProvider;
  label: string;
  rawValue: string;
}): CredentialRecord {
  const ws = WS();
  const entry: CredentialRecord = {
    id: uid("cred"),
    workspaceId: ws,
    provider: input.provider,
    label: input.label,
    maskedValue: mask(input.rawValue),
    status: "pending",
    createdAt: now(),
  };
  const all = listCredentials();
  all.unshift(entry);
  write(CREDS_KEY(ws), all);
  emitComplianceEvent("credential_added", { provider: input.provider, id: entry.id });
  recordAudit({ action: "credential_added", target: entry.id, metadata: { provider: input.provider } });
  return entry;
}

export function removeCredential(id: string): void {
  const ws = WS();
  const all = listCredentials().filter((c) => c.id !== id);
  write(CREDS_KEY(ws), all);
  emitComplianceEvent("credential_removed", { id });
  recordAudit({ action: "credential_removed", target: id });
}

export function setCredentialStatus(id: string, status: CredentialStatus): void {
  const ws = WS();
  const all = listCredentials().map((c) =>
    c.id === id ? { ...c, status, lastValidatedAt: now() } : c,
  );
  write(CREDS_KEY(ws), all);
}

export function rotateCredential(id: string, newRawValue: string): void {
  const ws = WS();
  const all = listCredentials().map((c) =>
    c.id === id
      ? { ...c, maskedValue: mask(newRawValue), rotatedAt: now(), status: "pending" as CredentialStatus }
      : c,
  );
  write(CREDS_KEY(ws), all);
  emitComplianceEvent("credential_rotated", { id });
  recordAudit({ action: "credential_rotated", target: id });
}
