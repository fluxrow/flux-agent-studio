/**
 * BuilderContext — single source of truth for the visual editor.
 *
 * Holds a Flow (blocks + connections + metadata) that mirrors exactly the
 * shape consumed by the Runtime Engine. Every visual change updates this
 * state, and a serialized snapshot is what the Simulator / Preview run.
 *
 * Phase Sprint 2 additions:
 *   - addBlock / moveBlock / removeBlock
 *   - addConnection / removeConnection
 *   - persistence: save() + autosave with status (idle/saving/saved/error)
 *   - viewport zoom + center API
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Block,
  BlockConfig,
  BlockType,
  Connection,
  Flow,
  FlowMetadata,
  ID,
} from "@/types";
import {
  validateFlow,
  type ValidationReport,
  serializeFlow,
  type SerializedFlow,
} from "@/runtime";
import { persistence } from "@/domain/persistence";

interface BuilderState {
  flow: Flow;
  selectedBlockId: ID | null;
  dirty: boolean;
}

type Action =
  | { type: "load"; flow: Flow }
  | { type: "select"; id: ID | null }
  | { type: "updateBlock"; id: ID; patch: Partial<Block> }
  | { type: "updateConfig"; id: ID; config: Partial<BlockConfig> }
  | { type: "updateMetadata"; patch: Partial<FlowMetadata> }
  | { type: "setStatus"; status: FlowMetadata["status"] }
  | { type: "addBlock"; block: Block }
  | { type: "removeBlock"; id: ID }
  | { type: "moveBlock"; id: ID; x: number; y: number }
  | { type: "addConnection"; connection: Connection }
  | { type: "removeConnection"; id: ID }
  | { type: "markSaved" }
  | { type: "publish" };

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "load":
      return { flow: action.flow, selectedBlockId: action.flow.blocks[0]?.id ?? null, dirty: false };
    case "select":
      return { ...state, selectedBlockId: action.id };
    case "updateBlock":
      return {
        ...state,
        dirty: true,
        flow: {
          ...state.flow,
          blocks: state.flow.blocks.map((b) =>
            b.id === action.id ? { ...b, ...action.patch, updatedAt: new Date().toISOString() } : b,
          ),
        },
      };
    case "updateConfig":
      return {
        ...state,
        dirty: true,
        flow: {
          ...state.flow,
          blocks: state.flow.blocks.map((b) =>
            b.id === action.id
              ? { ...b, config: { ...b.config, ...action.config }, updatedAt: new Date().toISOString() }
              : b,
          ),
        },
      };
    case "updateMetadata":
      return {
        ...state,
        dirty: true,
        flow: {
          ...state.flow,
          metadata: {
            ...(state.flow.metadata as FlowMetadata),
            ...action.patch,
            lastEditedAt: new Date().toISOString(),
          },
        },
      };
    case "setStatus":
      return {
        ...state,
        dirty: true,
        flow: {
          ...state.flow,
          metadata: {
            ...(state.flow.metadata as FlowMetadata),
            status: action.status,
            lastEditedAt: new Date().toISOString(),
          },
        },
      };
    case "addBlock":
      return {
        ...state,
        dirty: true,
        selectedBlockId: action.block.id,
        flow: { ...state.flow, blocks: [...state.flow.blocks, action.block] },
      };
    case "removeBlock":
      return {
        ...state,
        dirty: true,
        selectedBlockId: state.selectedBlockId === action.id ? null : state.selectedBlockId,
        flow: {
          ...state.flow,
          blocks: state.flow.blocks.filter((b) => b.id !== action.id),
          connections: state.flow.connections.filter(
            (c) => c.fromBlockId !== action.id && c.toBlockId !== action.id,
          ),
        },
      };
    case "moveBlock":
      return {
        ...state,
        dirty: true,
        flow: {
          ...state.flow,
          blocks: state.flow.blocks.map((b) =>
            b.id === action.id ? { ...b, position: { x: action.x, y: action.y } } : b,
          ),
        },
      };
    case "addConnection":
      return {
        ...state,
        dirty: true,
        flow: { ...state.flow, connections: [...state.flow.connections, action.connection] },
      };
    case "removeConnection":
      return {
        ...state,
        dirty: true,
        flow: {
          ...state.flow,
          connections: state.flow.connections.filter((c) => c.id !== action.id),
        },
      };
    case "markSaved":
      return { ...state, dirty: false };
    case "publish": {
      const nextVersion = (state.flow.metadata?.version ?? 0) + 1;
      const md: FlowMetadata = {
        ...(state.flow.metadata as FlowMetadata),
        status: "published",
        version: nextVersion,
        lastEditedAt: new Date().toISOString(),
      };
      return {
        ...state,
        dirty: false,
        flow: {
          ...state.flow,
          metadata: md,
          publishedVersion: nextVersion,
          versions: [
            ...(state.flow.versions ?? []),
            { version: nextVersion, status: "published", createdAt: md.lastEditedAt },
          ],
        },
      };
    }
    default:
      return state;
  }
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BuilderContextValue {
  state: BuilderState;
  flow: Flow;
  selectedBlock: Block | null;
  validation: ValidationReport;
  serialized: SerializedFlow;
  selectBlock: (id: ID | null) => void;
  updateBlock: (id: ID, patch: Partial<Block>) => void;
  updateConfig: (id: ID, config: Partial<BlockConfig>) => void;
  updateMetadata: (patch: Partial<FlowMetadata>) => void;
  setStatus: (status: FlowMetadata["status"]) => void;
  addBlock: (type: BlockType, position: { x: number; y: number }) => Block;
  removeBlock: (id: ID) => void;
  moveBlock: (id: ID, x: number, y: number) => void;
  addConnection: (from: ID, to: ID, condition?: string) => Connection | null;
  removeConnection: (id: ID) => void;
  publish: () => void;
  outgoing: (id: ID) => Connection[];
  incoming: (id: ID) => Connection[];
  /* persistence */
  saveStatus: SaveStatus;
  saveError: string | null;
  save: () => Promise<void>;
  /* viewport */
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  centerRequest: number;
  requestCenter: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

const emptyFlow: Flow = {
  botId: "",
  blocks: [],
  connections: [],
  variables: [],
  metadata: { name: "", version: 1, status: "draft", lastEditedAt: new Date().toISOString() },
};

const blockDefaults: Record<BlockType, { label: string; config: BlockConfig }> = {
  start:     { label: "Início",        config: {} },
  message:   { label: "Mensagem",      config: { text: "" } },
  input:     { label: "Pergunta",      config: { text: "", variable: "" } },
  choice:    { label: "Escolha",       config: { variable: "", options: [] } },
  condition: { label: "Condição",      config: { variable: "", operator: "equals", value: "" } },
  ai:        { label: "Bloco de IA",   config: {} },
  webhook:   { label: "Webhook",       config: { url: "" } },
  delay:     { label: "Aguardar",      config: { delayMs: 1000 } },
  end:       { label: "Fim",           config: { text: "" } },
};

const newId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `b_${Math.random().toString(36).slice(2)}_${Date.now()}`);

export function BuilderProvider({ flow, children }: { flow: Flow | null | undefined; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { flow: flow ?? emptyFlow, selectedBlockId: null, dirty: false });

  useEffect(() => {
    if (flow) dispatch({ type: "load", flow });
  }, [flow]);

  const validation = useMemo(() => validateFlow(state.flow), [state.flow]);
  const serialized = useMemo(() => serializeFlow(state.flow), [state.flow]);
  const selectedBlock =
    state.flow.blocks.find((b) => b.id === state.selectedBlockId) ?? state.flow.blocks[0] ?? null;

  const selectBlock = useCallback((id: ID | null) => dispatch({ type: "select", id }), []);
  const updateBlock = useCallback((id: ID, patch: Partial<Block>) => dispatch({ type: "updateBlock", id, patch }), []);
  const updateConfig = useCallback((id: ID, config: Partial<BlockConfig>) => dispatch({ type: "updateConfig", id, config }), []);
  const updateMetadata = useCallback((patch: Partial<FlowMetadata>) => dispatch({ type: "updateMetadata", patch }), []);
  const setStatus = useCallback((status: FlowMetadata["status"]) => dispatch({ type: "setStatus", status }), []);
  const publish = useCallback(() => dispatch({ type: "publish" }), []);

  const addBlock = useCallback(
    (type: BlockType, position: { x: number; y: number }) => {
      const now = new Date().toISOString();
      const d = blockDefaults[type];
      const block: Block = {
        id: newId(),
        botId: state.flow.botId,
        type,
        label: d.label,
        position,
        config: { ...d.config },
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: "addBlock", block });
      return block;
    },
    [state.flow.botId],
  );
  const removeBlock = useCallback((id: ID) => dispatch({ type: "removeBlock", id }), []);
  const moveBlock = useCallback((id: ID, x: number, y: number) => dispatch({ type: "moveBlock", id, x, y }), []);

  const addConnection = useCallback(
    (from: ID, to: ID, condition?: string) => {
      if (from === to) return null;
      const exists = state.flow.connections.some(
        (c) => c.fromBlockId === from && c.toBlockId === to,
      );
      if (exists) return null;
      const now = new Date().toISOString();
      const conn: Connection = {
        id: newId(),
        botId: state.flow.botId,
        fromBlockId: from,
        toBlockId: to,
        condition,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: "addConnection", connection: conn });
      return conn;
    },
    [state.flow.connections, state.flow.botId],
  );
  const removeConnection = useCallback((id: ID) => dispatch({ type: "removeConnection", id }), []);

  const outgoing = useCallback(
    (id: ID) => state.flow.connections.filter((c) => c.fromBlockId === id),
    [state.flow.connections],
  );
  const incoming = useCallback(
    (id: ID) => state.flow.connections.filter((c) => c.toBlockId === id),
    [state.flow.connections],
  );

  /* ----- persistence ----- */
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingRef = useRef(false);

  const save = useCallback(async () => {
    if (savingRef.current) return;
    if (!state.flow.botId) return;
    savingRef.current = true;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      await persistence.flows.saveBlocks(state.flow.botId, state.flow.blocks);
      await persistence.flows.saveConnections(state.flow.botId, state.flow.connections);
      dispatch({ type: "markSaved" });
      setSaveStatus("saved");
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err?.message ?? "Falha ao salvar");
      throw err;
    } finally {
      savingRef.current = false;
    }
  }, [state.flow.botId, state.flow.blocks, state.flow.connections]);

  // Debounced autosave
  useEffect(() => {
    if (!state.dirty) return;
    const t = setTimeout(() => {
      save().catch(() => {/* surfaced via saveStatus */});
    }, 1500);
    return () => clearTimeout(t);
  }, [state.dirty, state.flow.blocks, state.flow.connections, save]);

  /* ----- viewport ----- */
  const [zoom, setZoom] = useState(1);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2))), []);
  const resetZoom = useCallback(() => setZoom(1), []);
  const [centerRequest, setCenterRequest] = useState(0);
  const requestCenter = useCallback(() => setCenterRequest((n) => n + 1), []);

  const value: BuilderContextValue = {
    state,
    flow: state.flow,
    selectedBlock,
    validation,
    serialized,
    selectBlock,
    updateBlock,
    updateConfig,
    updateMetadata,
    setStatus,
    addBlock,
    removeBlock,
    moveBlock,
    addConnection,
    removeConnection,
    publish,
    outgoing,
    incoming,
    saveStatus,
    saveError,
    save,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    centerRequest,
    requestCenter,
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used inside BuilderProvider");
  return ctx;
}
