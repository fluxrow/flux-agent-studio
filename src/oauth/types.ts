import type { ConnectedAccount, OAuthProviderId, ConnectedAccountStatus } from "@/types/connectedAccount";

export type { OAuthProviderId, ConnectedAccount, ConnectedAccountStatus };

export interface OAuthConnectInput {
  accountName?: string;
}

export interface OAuthConnectResult {
  accountName: string;
  accountIdentifier: string;
  status: ConnectedAccountStatus;
  meta?: Record<string, unknown>;
}

/**
 * OAuthProvider — contract every provider adapter must honour.
 * Stub adapters fulfil the interface without making real network calls,
 * so future real OAuth flows can be dropped in without touching consumers.
 */
export interface OAuthProvider {
  id: OAuthProviderId;
  label: string;
  description: string;

  connect(input?: OAuthConnectInput): Promise<OAuthConnectResult>;
  disconnect(account: ConnectedAccount): Promise<void>;
  refresh(account: ConnectedAccount): Promise<OAuthConnectResult>;
  getStatus(account: ConnectedAccount): Promise<ConnectedAccountStatus>;
}
