import { useCallback, useMemo, useState } from 'react';
import { decodeJwt } from 'jose';

const ONE_MINUTE_IN_MS = 60 * 1000;

const getEndpoint = () => {
  return import.meta.env.VITE_LIVEKIT_CONN_DETAILS_ENDPOINT || 'https://cloud-api.livekit.io/api/sandbox/connection-details';
};

const getSandboxId = () => {
  return import.meta.env.VITE_LIVEKIT_SANDBOX_ID || 'shift-gears-demo-17gfi0';
};

const getAgentName = () => {
  return import.meta.env.VITE_LIVEKIT_AGENT_NAME || '';
};

const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const payload = decodeJwt(token);
    if (!payload?.exp) {
      return true;
    }

    const expiresAt = payload.exp * 1000 - ONE_MINUTE_IN_MS;
    return Date.now() > expiresAt;
  } catch (error) {
    console.error('[useLiveKitConnection] Failed to decode token:', error);
    return true;
  }
};

const useLiveKitConnection = () => {
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = useMemo(() => getEndpoint(), []);
  const sandboxId = useMemo(() => getSandboxId(), []);
  const agentName = useMemo(() => getAgentName(), []);

  const fetchConnectionDetails = useCallback(async (metadata = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(endpoint, window.location.origin);

      // Build payload with room config and metadata
      const payload = {
        ...(agentName && {
          room_config: {
            agents: [{ agent_name: agentName }],
          },
        }),
        ...(Object.keys(metadata).length > 0 && { metadata }),
      };

      const body = Object.keys(payload).length > 0 ? JSON.stringify(payload) : '{}';

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sandbox-Id': sandboxId,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connection details (${response.status})`);
      }

      const data = await response.json();
      setConnectionDetails(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown LiveKit connection error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, sandboxId, agentName]);

  const ensureConnectionDetails = useCallback(async (metadata = {}) => {
    if (!connectionDetails) {
      return fetchConnectionDetails(metadata);
    }

    if (isTokenExpired(connectionDetails.participantToken)) {
      return fetchConnectionDetails(metadata);
    }

    return connectionDetails;
  }, [connectionDetails, fetchConnectionDetails]);

  return {
    connectionDetails,
    isLoading,
    error,
    ensureConnectionDetails,
    refreshConnectionDetails: fetchConnectionDetails,
  };
};

export default useLiveKitConnection;
