import { useState } from 'react';
import { useGame } from '../store';

export function AnswerScreen() {
  const players = useGame((s) => s.players);
  const idx = useGame((s) => s.currentAuthorIdx);
  const roundIdx = useGame((s) => s.roundIdx);
  const rounds = useGame((s) => s.rounds);
  const submitAnswer = useGame((s) => s.submitAnswer);
  const nextPhase = useGame((s) => s.nextPhase);

  const [text, setText] = useState('');
  const [handed, setHanded] = useState(false); // pass-phone splash before this player sees

  const player = players[idx];
  const prompt = rounds[roundIdx]?.prompt || '';

  // when all players have answered → move to wait_ai
  if (idx >= players.length) {
    nextPhase('wait_ai');
    return null;
  }

  if (!handed) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-slide-up">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted mb-4">ТЕЛЕФОН ПЕРЕХОДИТ К</div>
        <div className="text-[88px] leading-none mb-2 animate-wiggle">{player.emoji}</div>
        <div className="font-display font-extrabold text-[36px] text-paper" style={{ letterSpacing: '-0.03em' }}>
          {player.name}
        </div>
        <div className="font-mono text-[11px] tracking-[0.24em] text-muted mt-3">
          остальные — отвернитесь!
        </div>
        <button
          onClick={() => setHanded(true)}
          className="mt-10 h-16 px-8 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight active:scale-[0.98] transition-transform round-ring"
        >
          ЭТО Я →
        </button>
      </div>
    );
  }

  const canSubmit = text.trim().length >= 1 && text.trim().length <= 100;

  const send = () => {
    if (!canSubmit) return;
    submitAnswer(text.trim());
    setText('');
    setHanded(false);
  };

  return (
    <div className="h-full flex flex-col p-6 animate-slide-up">
      <div className="pt-2 pb-3 flex items-center gap-3">
        <span className="text-3xl">{player.emoji}</span>
        <div>
          <div className="font-display font-bold text-paper text-[17px]">{player.name}</div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
            ОТВЕТ {idx + 1} ИЗ {players.length}
          </div>
        </div>
      </div>

      <div className="bg-paper text-ink rounded-3xl p-5 card-shadow mb-3">
        <div className="font-mono text-[9px] tracking-[0.3em] text-muted mb-2">ВОПРОС</div>
        <div className="font-display font-bold text-[19px] leading-snug" style={{ letterSpacing: '-0.01em' }}>
          {prompt}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="пиши без стыда…"
        maxLength={100}
        autoFocus
        className="flex-1 bg-smoke text-paper rounded-2xl px-4 py-4 outline-none font-display font-semibold text-[18px] placeholder:text-muted resize-none"
        style={{ minHeight: 120 }}
      />
      <div className="flex justify-between mt-2 mb-3 font-mono text-[10px] tracking-[0.2em] text-muted">
        <span>{text.length}/100</span>
        <span className="opacity-70">короче = смешнее</span>
      </div>

      <button
        onClick={send}
        disabled={!canSubmit}
        className="h-16 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight disabled:opacity-30 active:scale-[0.98] transition-transform round-ring"
      >
        ОТПРАВИТЬ →
      </button>
    </div>
  );
}
