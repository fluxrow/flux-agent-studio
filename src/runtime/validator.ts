/**
 * Flow Validator — runs a static analysis pass on any Flow before it is
 * handed to the RuntimeEngine. Pure TypeScript, no React.
 */
import type { Block, Connection, Flow, ID } from "@/types";

export type ValidationSeverity = "error" | "warning";

export type ValidationCode =
  | "missing_start"
  | "missing_end"
  | "multiple_starts"
  | "block_no_outgoing"
  | "block_orphan"
  | "condition_no_branches"
  | "condition_invalid"
  | "choice_no_options"
  | "input_no_variable"
  | "variable_unused"
  | "variable_undefined"
  | "potential_loop";

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: ValidationCode;
  message: string;
  blockId?: ID;
  variable?: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  all: ValidationIssue[];
}

const VAR_TOKEN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function collectInterpolatedVars(text?: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_TOKEN.source, "g");
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

function outgoing(connections: Connection[], blockId: ID): Connection[] {
  return connections.filter((c) => c.fromBlockId === blockId);
}

function incoming(connections: Connection[], blockId: ID): Connection[] {
  return connections.filter((c) => c.toBlockId === blockId);
}

/** Detect simple cycles using DFS. */
function hasCycle(blocks: Block[], connections: Connection[]): ID[] | null {
  const graph = new Map<ID, ID[]>();
  blocks.forEach((b) => graph.set(b.id, []));
  connections.forEach((c) => graph.get(c.fromBlockId)?.push(c.toBlockId));

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<ID, number>();
  blocks.forEach((b) => color.set(b.id, WHITE));
  const stack: ID[] = [];

  const visit = (id: ID): ID[] | null => {
    color.set(id, GRAY);
    stack.push(id);
    for (const next of graph.get(id) ?? []) {
      const c = color.get(next);
      if (c === GRAY) return [...stack, next];
      if (c === WHITE) {
        const r = visit(next);
        if (r) return r;
      }
    }
    stack.pop();
    color.set(id, BLACK);
    return null;
  };

  for (const b of blocks) {
    if (color.get(b.id) === WHITE) {
      const r = visit(b.id);
      if (r) return r;
    }
  }
  return null;
}

export function validateFlow(flow: Flow): ValidationReport {
  const issues: ValidationIssue[] = [];
  const { blocks, connections } = flow;

  /* ---- Start / End ---- */
  const starts = blocks.filter((b) => b.type === "start");
  const ends = blocks.filter((b) => b.type === "end");

  if (starts.length === 0)
    issues.push({ severity: "error", code: "missing_start", message: "Nenhum bloco Start encontrado." });
  if (starts.length > 1)
    issues.push({
      severity: "error",
      code: "multiple_starts",
      message: `Existem ${starts.length} blocos Start. Deve haver apenas um.`,
    });
  if (ends.length === 0)
    issues.push({ severity: "warning", code: "missing_end", message: "Nenhum bloco End definido — o fluxo terminará no primeiro caminho vazio." });

  /* ---- Per-block checks ---- */
  const declaredVars = new Set((flow.variables ?? []).map((v) => v.name));
  const assignedVars = new Set<string>();
  const usedVars = new Set<string>();

  for (const b of blocks) {
    const outs = outgoing(connections, b.id);
    const ins = incoming(connections, b.id);

    // Orphan (no inputs, not start)
    if (ins.length === 0 && b.type !== "start") {
      issues.push({
        severity: "warning",
        code: "block_orphan",
        message: `Bloco "${b.label}" não recebe nenhuma conexão.`,
        blockId: b.id,
      });
    }

    // Missing outgoing (unless terminal)
    if (outs.length === 0 && b.type !== "end") {
      issues.push({
        severity: "error",
        code: "block_no_outgoing",
        message: `Bloco "${b.label}" não possui conexão de saída.`,
        blockId: b.id,
      });
    }

    // Type-specific
    if (b.type === "condition") {
      const branches = new Set(outs.map((c) => (c.condition ?? "").toLowerCase()));
      if (!branches.has("true") || !branches.has("false")) {
        issues.push({
          severity: "error",
          code: "condition_no_branches",
          message: `Condição "${b.label}" precisa de saídas "true" e "false".`,
          blockId: b.id,
        });
      }
      const variable = String(b.config.variable ?? "");
      if (!variable) {
        issues.push({
          severity: "error",
          code: "condition_invalid",
          message: `Condição "${b.label}" não define a variável a ser avaliada.`,
          blockId: b.id,
        });
      } else {
        usedVars.add(variable);
      }
      if (!b.config.operator) {
        issues.push({
          severity: "error",
          code: "condition_invalid",
          message: `Condição "${b.label}" não define operador.`,
          blockId: b.id,
        });
      }
    }

    if (b.type === "choice") {
      const options = (b.config.options as string[] | undefined) ?? [];
      if (options.length < 2) {
        issues.push({
          severity: "error",
          code: "choice_no_options",
          message: `Escolha "${b.label}" precisa de pelo menos duas opções.`,
          blockId: b.id,
        });
      }
      const variable = String(b.config.variable ?? "");
      if (variable) assignedVars.add(variable);
    }

    if (b.type === "input") {
      const variable = String(b.config.variable ?? "");
      if (!variable) {
        issues.push({
          severity: "error",
          code: "input_no_variable",
          message: `Input "${b.label}" não define variável de saída.`,
          blockId: b.id,
        });
      } else {
        assignedVars.add(variable);
      }
    }

    // Interpolated variables in any text/prompt
    collectInterpolatedVars(b.config.text as string | undefined).forEach((v) =>
      usedVars.add(v),
    );
    collectInterpolatedVars(b.config.prompt as string | undefined).forEach((v) =>
      usedVars.add(v),
    );
  }

  /* ---- Variable cross-checks ---- */
  for (const v of usedVars) {
    if (!assignedVars.has(v) && !declaredVars.has(v)) {
      issues.push({
        severity: "warning",
        code: "variable_undefined",
        message: `Variável {{${v}}} é utilizada mas nunca preenchida.`,
        variable: v,
      });
    }
  }
  for (const v of declaredVars) {
    if (!usedVars.has(v) && !assignedVars.has(v)) {
      issues.push({
        severity: "warning",
        code: "variable_unused",
        message: `Variável "${v}" declarada mas nunca utilizada.`,
        variable: v,
      });
    }
  }

  /* ---- Loop detection ---- */
  const cycle = hasCycle(blocks, connections);
  if (cycle) {
    issues.push({
      severity: "warning",
      code: "potential_loop",
      message: `Loop potencialmente infinito detectado: ${cycle.join(" → ")}.`,
    });
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return { valid: errors.length === 0, errors, warnings, all: issues };
}
