/**
 * Builds the conferenceData payload for Google Meet creation.
 * Passed to events.insert with conferenceDataVersion=1.
 */
export function buildMeetConferenceData(requestId: string): Record<string, unknown> {
  return {
    createRequest: {
      requestId,
      conferenceSolutionKey: { type: "hangoutsMeet" },
    },
  };
}

/** Extracts the Meet link from a Google Calendar event response. */
export function extractMeetLink(eventData: Record<string, unknown>): string | undefined {
  const conf = eventData.conferenceData as
    | { entryPoints?: Array<{ entryPointType?: string; uri?: string }> }
    | undefined;
  return conf?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;
}
