const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// User API
export const userApi = {
  create: (address: string) =>
    fetchApi('/api/user', {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),
};

// Message API
export const messageApi = {
  send: (data: {
    messageId: string;
    recipientAddress: string;
    senderHash: string;
    encryptedContent: string;
    txId: string;
  }) =>
    fetchApi('/api/message/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInbox: (address: string) =>
    fetchApi<any[]>(`/api/message/inbox/${address}`),
};

// Poll API
export const pollApi = {
  create: (data: {
    pollId: string;
    question: string;
    options: string[];
    creatorAddress: string;
    endBlock: number;
    txId: string;
  }) =>
    fetchApi('/api/poll/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (pollId: string) =>
    fetchApi<any>(`/api/poll/${pollId}`),

  getAll: () =>
    fetchApi<any[]>('/api/polls'),

  vote: (pollId: string, data: {
    voterAddress: string;
    optionIndex: number;
    nullifier: string;
    txId: string;
  }) =>
    fetchApi(`/api/poll/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Notes API
export const notesApi = {
  create: (data: {
    noteId: string;
    ownerAddress: string;
    txId: string;
  }) =>
    fetchApi('/api/notes/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (address: string) =>
    fetchApi<any[]>(`/api/notes/${address}`),

  get: (noteId: string) =>
    fetchApi<any>(`/api/notes/get/${noteId}`),

  update: (noteId: string, data: {
    isPinned?: boolean;
    txId?: string;
  }) =>
    fetchApi(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (noteId: string) =>
    fetchApi(`/api/notes/${noteId}`, {
      method: 'DELETE',
    }),
};
