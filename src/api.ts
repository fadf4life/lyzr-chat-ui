// Lyzr agent API client.

const LYZR_API = {
  url: 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
  apiKey: 'sk-default-oxJP2NVhizJeiowoZy4zGCzpjfX3TAEp',
  userId: 'amtuk119@gmail.com',
  agentId: '6a80a66a3cff96f7d1224f47',
  sessionId: '6a80a66a3cff96f7d1224f47-x7uti9kx',
};

// Extract assistant text from an unknown Lyzr response shape.
function extractReply(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['response', 'message', 'output', 'answer', 'reply', 'text']) {
      const value = record[key];
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const nested = extractReply(value);
        if (nested) return nested;
      }
    }
  }
  return '';
}

export async function sendChatMessage(text: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(LYZR_API.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LYZR_API.apiKey,
      },
      body: JSON.stringify({
        user_id: LYZR_API.userId,
        agent_id: LYZR_API.agentId,
        session_id: LYZR_API.sessionId,
        message: text,
      }),
    });
  } catch {
    throw new Error('Could not reach the GenAI Mentor service. Check your connection.');
  }

  const raw = await response.text();

  if (!response.ok) {
    // Lyzr reports problems as {"detail": "..."} — surface that exact reason.
    try {
      const data = JSON.parse(raw) as { detail?: unknown };
      if (typeof data.detail === 'string' && data.detail) {
        throw new Error(data.detail);
      }
    } catch (err) {
      if (err instanceof Error && !(err instanceof SyntaxError)) throw err;
    }
    throw new Error(`The service returned an error (HTTP ${response.status}).`);
  }

  let reply = '';
  try {
    reply = extractReply(JSON.parse(raw));
  } catch {
    reply = raw; // Non-JSON success body — show it as-is.
  }

  return reply || 'GenAI Mentor returned an empty response. Please try again.';
}
