export type TypeState = { role: number; len: number; deleting: boolean };

export const initialTypeState: TypeState = { role: 0, len: 0, deleting: false };

const TYPE_MS = 90;
const DELETE_MS = 45;
const HOLD_MS = 1600;
const NEXT_MS = 400;

/** One tick of the type/delete loop: the next state and how long to wait before the tick after it. */
export function typewriterStep(state: TypeState, roles: string[]): { state: TypeState; delay: number } {
  const word = roles[state.role];
  if (!state.deleting) {
    if (state.len < word.length) return { state: { ...state, len: state.len + 1 }, delay: TYPE_MS };
    return { state: { ...state, deleting: true }, delay: HOLD_MS };
  }
  if (state.len > 0) return { state: { ...state, len: state.len - 1 }, delay: DELETE_MS };
  return { state: { role: (state.role + 1) % roles.length, len: 0, deleting: false }, delay: NEXT_MS };
}
