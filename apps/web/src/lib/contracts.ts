/**
 * Aleo Contract Configuration
 *
 * Deployed contract addresses and configuration for Aleo Privacy Hub
 */

export const CONTRACTS = {
  // PrivyMessage - Anonymous messaging
  // Deployed: 2026-01-22
  privymsg: {
    programId: 'privymsg_v1.aleo',
    deploymentTx: 'at1vcyrvgqmtgjxx6atv3f9zfts0ypc85uunnc35s5cumhmqcgvv5rq96xsj2',
    functions: {
      sendMessage: 'send_message',
      markRead: 'mark_read',
      deleteMessage: 'delete_message',
    },
  },

  // PrivyPoll - Anonymous voting
  // Deployed: 2026-01-22
  privypoll: {
    programId: 'privypoll_v1.aleo',
    deploymentTx: 'at1hkdj7fhtgdkwwt3pss4kx0azug05p2hx7hj234p8pa0qnwrw8y9sfhwmp9',
    functions: {
      createPoll: 'create_poll',
      vote: 'vote',
      endPoll: 'end_poll',
    },
  },

  // PrivyNotes - Encrypted notes
  // Deployed: 2026-01-22
  privynotes: {
    programId: 'privynotes_v1.aleo',
    deploymentTx: 'at13pt0a0n8urr0vlvz3a27m6ljmjrnhry7uysqclkd46yn6xt7cqgs32us58',
    functions: {
      createNote: 'create_note',
      updateNote: 'update_note',
      togglePin: 'toggle_pin',
      deleteNote: 'delete_note',
    },
  },
} as const;

// Network configuration
export const NETWORK = {
  name: 'testnet',
  endpoint: 'https://api.explorer.provable.com/v1',
  explorerUrl: 'https://testnet.aleo.info',
} as const;

// Helper to get explorer URL for a transaction
export function getTransactionUrl(txId: string): string {
  return `${NETWORK.explorerUrl}/transaction/${txId}`;
}

// Helper to get explorer URL for a program
export function getProgramUrl(programId: string): string {
  return `${NETWORK.explorerUrl}/program/${programId}`;
}
