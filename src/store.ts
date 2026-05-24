import { create } from 'zustand';
import type { AnswerEntry, Phase, QuiplashState, Round } from './types';

// store wraps QuiplashState + actions

let _id = 0;
const nextId = () => String(++_id);

const TOTAL_ROUNDS = 2;

interface Store extends QuiplashState {
  addPlayer: (name: string, emoji: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  nextPhase: (p: Phase) => void;
  setPrompt: (prompt: string) => void;
  submitAnswer: (text: string) => void;
  addAiFake: (text: string) => void;
  shuffleAnswers: () => void;
  vote: (answerId: string) => void;
  submitAttribution: (mapping: Record<string, string>) => void;
  scoreRound: () => void;
  nextRound: () => void;
  reset: () => void;
}

const initial = (): QuiplashState => ({
  phase: 'lobby',
  roundIdx: 0,
  totalRounds: TOTAL_ROUNDS,
  players: [],
  rounds: [],
  currentAuthorIdx: 0,
  currentVoterIdx: 0,
  currentAttribIdx: 0,
});

export const useGame = create<Store>((set, get) => ({
  ...initial(),

  addPlayer: (name, emoji) => set((s) => ({
    players: s.players.length >= 4
      ? s.players
      : [...s.players, { id: nextId(), name: name.slice(0, 14) || `Гость ${s.players.length + 1}`, emoji, score: 0 }],
  })),
  removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  startGame: () => {
    const s = get();
    if (s.players.length < 2) return;
    set({
      phase: 'intro',
      roundIdx: 0,
      rounds: Array.from({ length: TOTAL_ROUNDS }, () => ({
        prompt: '',
        answers: [],
        voted: [],
        attributions: {},
        attributed: [],
        scoredOut: false,
      } as Round)),
      currentAuthorIdx: 0,
      currentVoterIdx: 0,
      currentAttribIdx: 0,
    });
  },
  nextPhase: (p) => set({ phase: p }),
  setPrompt: (prompt) => set((s) => {
    const r = [...s.rounds];
    r[s.roundIdx] = { ...r[s.roundIdx], prompt };
    return { rounds: r };
  }),
  submitAnswer: (text) => set((s) => {
    const r = [...s.rounds];
    const round = { ...r[s.roundIdx] };
    const authorId = s.players[s.currentAuthorIdx].id;
    const entry: AnswerEntry = {
      id: nextId(),
      text: text.slice(0, 100),
      authorId,
      votes: [],
    };
    round.answers = [...round.answers, entry];
    r[s.roundIdx] = round;
    return {
      rounds: r,
      currentAuthorIdx: s.currentAuthorIdx + 1,
    };
  }),
  addAiFake: (text) => set((s) => {
    const r = [...s.rounds];
    const round = { ...r[s.roundIdx] };
    const entry: AnswerEntry = {
      id: nextId(),
      text: text.slice(0, 120),
      authorId: 'ai',
      votes: [],
    };
    round.answers = [...round.answers, entry];
    r[s.roundIdx] = round;
    return { rounds: r };
  }),
  shuffleAnswers: () => set((s) => {
    const r = [...s.rounds];
    const round = { ...r[s.roundIdx] };
    round.answers = [...round.answers].sort(() => Math.random() - 0.5);
    r[s.roundIdx] = round;
    return { rounds: r };
  }),
  vote: (answerId) => set((s) => {
    const r = [...s.rounds];
    const round = { ...r[s.roundIdx] };
    const voterId = s.players[s.currentVoterIdx].id;
    if (round.voted.includes(voterId)) return s;
    round.answers = round.answers.map((a) =>
      a.id === answerId ? { ...a, votes: [...a.votes, voterId] } : a
    );
    round.voted = [...round.voted, voterId];
    r[s.roundIdx] = round;
    return {
      rounds: r,
      currentVoterIdx: s.currentVoterIdx + 1,
    };
  }),
  submitAttribution: (mapping) => set((s) => {
    const r = [...s.rounds];
    const round = { ...r[s.roundIdx] };
    const voterId = s.players[s.currentAttribIdx].id;
    if (round.attributed.includes(voterId)) return s;
    round.attributions = { ...round.attributions, [voterId]: mapping };
    round.attributed = [...round.attributed, voterId];
    r[s.roundIdx] = round;
    return {
      rounds: r,
      currentAttribIdx: s.currentAttribIdx + 1,
    };
  }),
  scoreRound: () => set((s) => {
    const r = [...s.rounds];
    const round = { ...r[s.roundIdx] };
    if (round.scoredOut) return s;
    const players = s.players.map((p) => ({ ...p }));

    // base: each vote your answer received = +100
    for (const a of round.answers) {
      if (a.authorId === 'ai') continue;
      const author = players.find((p) => p.id === a.authorId);
      if (author) author.score += a.votes.length * 100;
    }

    // bonus: voted for AI fake = +50 (you spotted it)
    const aiAns = round.answers.find((a) => a.authorId === 'ai');
    if (aiAns) {
      for (const voterId of aiAns.votes) {
        const p = players.find((pp) => pp.id === voterId);
        if (p) p.score += 50;
      }
    }

    // attribution bonus: +25 per correct authorship guess (excluding self)
    for (const [voterId, mapping] of Object.entries(round.attributions)) {
      const voter = players.find((p) => p.id === voterId);
      if (!voter) continue;
      for (const [answerId, predicted] of Object.entries(mapping)) {
        const ans = round.answers.find((a) => a.id === answerId);
        if (!ans) continue;
        // can't earn by guessing your own answer
        if (ans.authorId === voterId) continue;
        if (predicted === ans.authorId) voter.score += 25;
      }
    }

    round.scoredOut = true;
    r[s.roundIdx] = round;
    return { rounds: r, players };
  }),
  nextRound: () => set((s) => {
    const nextIdx = s.roundIdx + 1;
    if (nextIdx >= s.totalRounds) {
      return { phase: 'final' };
    }
    return {
      roundIdx: nextIdx,
      phase: 'intro',
      currentAuthorIdx: 0,
      currentVoterIdx: 0,
      currentAttribIdx: 0,
    };
  }),
  reset: () => set(initial()),
}));
