/**
 * BuilderContext — single source of truth for the visual editor.
 *
 * Holds a Flow (blocks + connections + metadata) that mirrors exactly the
 * shape consumed by the Runtime Engine. Every visual change updates this
 * state, and a serialized snapshot is what the Simulator / Preview run.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Block,
  BlockConfig,
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
  publish: () => void;
  outgoing: (id: ID) => Connection[];
  incoming: (id: ID) => Connection[];
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

const emptyFlow: Flow = {
  botId: "",
  blocks: [],
  connections: [],
  variables: [],
  metadata: { name: "", version: 1, status: "draft", lastEditedAt: new Date().toISOString() },
};

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

  const outgoing = useCallback(
    (id: ID) => state.flow.connections.filter((c) => c.fromBlockId === id),
    [state.flow.connections],
  );
  const incoming = useCallback(
    (id: ID) => state.flow.connections.filter((c) => c.toBlockId === id),
    [state.flow.connections],
  );

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
    publish,
    outgoing,
    incoming,
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used inside BuilderProvider");
  return ctx;
}
