import { useState } from 'react';
import { useGame } from '../store';

export function VoteScreen() {
  const players = useGame((s) => s.players);
  const idx = useGame((s) => s.currentVoterIdx);
  const roundIdx = useGame((s) => s.roundIdx);
  const rounds = useGame((s) => s.rounds);
  const vote = useGame((s) => s.vote);
  const nextPhase = useGame((s) => s.nextPhase);
  const [handed, setHanded] = useState(false);

  const player = players[idx];
  const round = rounds[roundIdx];

  if (idx >= players.length) {
    nextPhase('attribute');
    return null;
  }

  if (!handed) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-slide-up">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted mb-4">ГОЛОСУЕТ</div>
        <div className="text-[88px] leading-none mb-2 animate-wiggle">{player.emoji}</div>
        <div className="font-display font-extrabold text-[36px] text-paper" style={{ letterSpacing: '-0.03em' }}>
          {player.name}
        </div>
        <div className="font-mono text-[11px] tracking-[0.24em] text-muted mt-3 text-center max-w-[280px]">
          выбери лучший ответ.
          <br />
          <span className="round-tint">+50</span> если угадаешь AI.
        </div>
        <button
          onClick={() => setHanded(true)}
          className="mt-10 h-16 px-8 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight active:scale-[0.98] transition-transform round-ring"
        >
          ВЫБИРАЮ →
        </button>
      </div>
    );
  }

  const handlePick = (answerId: string) => {
    vote(answerId);
    setHanded(false);
  };

  return (
    <div className="h-full flex flex-col p-6 animate-slide-up">
      <div className="pt-2 pb-3 flex items-center gap-3">
        <span className="text-3xl">{player.emoji}</span>
        <div>
          <div className="font-display font-bold text-paper text-[17px]">{player.name}</div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
            ВЫБИРАЕТ · {idx + 1}/{players.length}
          </div>
        </div>
      </div>

      <div className="bg-paper text-ink rounded-3xl p-4 card-shadow mb-3">
        <div className="font-mono text-[9px] tracking-[0.3em] text-muted mb-1">ВОПРОС</div>
        <div className="font-display font-bold text-[17px] leading-tight" style={{ letterSpacing: '-0.01em' }}>
          {round.prompt}
        </div>
      </div>

      <div className="flex-1 overflow-auto -mx-1 px-1">
        <div className="flex flex-col gap-3 pb-3">
          {round.answers.map((a, i) => (
            <button
              key={a.id}
              onClick={() => handlePick(a.id)}
              className="text-left bg-smoke active:bg-[#22232a] active:scale-[0.99] transition-all rounded-2xl px-5 py-4"
              style={{
                animation: `slideUp 280ms cubic-bezier(.2,.8,.2,1) both ${i * 60}ms`,
              }}
            >
              <div className="font-mono text-[9px] tracking-[0.3em] text-muted mb-1">
                ВАРИАНТ {String.fromCharCode(65 + i)}
              </div>
              <div className="font-display font-semibold text-paper text-[17px] leading-snug">
                {a.text}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
