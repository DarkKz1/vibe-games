export interface Player {
  id: string;
  name: string;
  emoji: string;
  score: number;
}

export interface AnswerEntry {
  id: string;
  text: string;
  authorId: string | 'ai'; // 'ai' for the bot fake
  votes: string[];         // ids of players who voted
}

export interface Round {
  prompt: string;
  answers: AnswerEntry[]; // includes ai fake
  voted: string[];        // ids of players who already voted
  scoredOut: boolean;
}

export type Phase =
  | 'lobby'        // adding players
  | 'intro'        // round intro splash
  | 'answer'       // pass-phone, each player writes answer
  | 'wait_ai'      // calling /api/quiplash to add fake + prepare vote
  | 'vote'         // pass-phone, each player votes
  | 'reveal'       // who said what + AI reveal + scores
  | 'final';       // overall leaderboard

export interface QuiplashState {
  phase: Phase;
  roundIdx: number;
  totalRounds: number;
  players: Player[];
  rounds: Round[];
  currentAuthorIdx: number; // index for pass-phone answer
  currentVoterIdx: number;  // index for pass-phone vote
}
