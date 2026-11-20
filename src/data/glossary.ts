// Plain-language definitions shown on hover/focus/tap. Keys are matched case-sensitively as whole words;
// the first occurrence in each string is marked.
export const glossary: Record<string, string> = {
  MCP: 'Model Context Protocol: a standard way to expose tools and data to an AI model, so an agent can call them.',
  pgvector: 'A PostgreSQL extension that stores embeddings and finds the nearest ones, used here for retrieval.',
  RAG: 'Retrieval-augmented generation: fetch relevant passages first, then have the model answer from them.',
  'Brier score': 'Mean squared error of probability forecasts. Lower is better; 0.25 is a coin flip.',
  'Brier skill': 'How much a forecast improves on a baseline Brier score, as a percentage.',
  KVM: 'Kernel-based Virtual Machine: the Linux kernel feature that runs guest code on the real CPU.',
  MMIO: 'Memory-mapped I/O: a device that appears as memory; touching it causes a VM exit in minivmm.',
  CPace: 'A password-authenticated key exchange: two devices agree on a key from a short code without exposing it to offline guessing.',
  'AES-GCM': 'An authenticated encryption mode: it hides the data and detects tampering.',
  MAD: 'Median absolute deviation: a spread measure that ignores outliers better than standard deviation.',
  'Amanatides-Woo': 'A fast way to step a ray through grid cells in order, visiting only the cells it crosses.',
  recall: 'Of the people who truly have the condition, the share the model flags.',
  JWT: 'JSON Web Token: a signed token a server hands out to prove who you are on later requests.',
  'Web Locks': 'A browser API that lets tabs of the same site take turns on a named lock.',
  'advisory lock': 'A PostgreSQL lock the application defines itself, used to make sure only one job runs.',
  GDELT: 'A public dataset of news events worldwide, updated every 15 minutes.',
  PWA: 'Progressive web app: a site that installs like an app and can work offline.',
  'cross-validation': 'Repeatedly training on part of the data and testing on the rest, to estimate performance without the test set.',
};
