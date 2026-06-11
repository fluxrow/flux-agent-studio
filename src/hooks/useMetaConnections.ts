import { useState, useEffect, useCallback } from "react";
import { metaConnectionService } from "@/channels/meta/connection";
import type { MetaChannelConnection, CreateMetaConnectionInput } from "@/channels/meta/types";

export function useMetaConnections() {
  const [connections, setConnections] = useState<MetaChannelConnection[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await metaConnectionService.list();
      setConnections(data);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar conexões Meta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (input: CreateMetaConnectionInput) => {
    try {
      const conn = await metaConnectionService.create(input);
      setConnections(prev => [...prev.filter(item => item.id !== conn.id), conn]);
      return conn;
    } finally {
      await load();
    }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await metaConnectionService.remove(id);
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  return { connections, loading, error, refresh: load, create, remove };
}
