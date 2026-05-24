import { useEffect, useState } from 'react';
import { useGame } from '../store';

export function Intro() {
  const roundIdx = useGame((s) => s.roundIdx);
  const totalRounds = useGame((s) => s.totalRounds);
  const setPrompt = useGame((s) => s.setPrompt);
  const nextPhase = useGame((s) => s.nextPhase);
  const [prompt, setLocalPrompt] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLocalPrompt(null);
    setError(false);
    fetch('/api/quiplash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'prompt', round: roundIdx + 1 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancel) return;
        const p = (d?.prompt || '').toString();
        if (!p) throw new Error('empty');
        setLocalPrompt(p);
        setPrompt(p);
      })
      .catch(() => {
        if (cancel) return;
        const fallback = [
          'Самое глупое, что ты делал на парах',
          'Что нельзя говорить на первом свидании в Алматы',
          'Худшая идея для нового стартапа',
          'То, что ты гуглил в 3 ночи и потом удалил',
          'Как бы ты назвал свою autobiography',
        ];
        const p = fallback[roundIdx % fallback.length];
        setLocalPrompt(p);
        setPrompt(p);
        setError(true);
      });
    return () => { cancel = true; };
  }, [roundIdx, setPrompt]);

  return (
    <div className="h-full flex flex-col p-6 animate-slide-up">
      <div className="text-center pt-4">
        <div className="font-mono text-[11px] tracking-[0.32em] text-muted">
          РАУНД {roundIdx + 1} / {totalRounds}
        </div>
        <h2 className="font-display font-extrabold text-[42px] leading-none mt-3 round-tint" style={{ letterSpacing: '-0.03em' }}>
          {roundIdx === 0 ? 'погнали!' : 'ещё один?'}
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center px-2">
        {prompt === null ? (
          <div className="text-center text-muted animate-pulse font-mono text-sm tracking-[0.2em]">
            AI пишет вопрос…
          </div>
        ) : (
          <div className="bg-paper text-ink rounded-3xl p-6 card-shadow w-full animate-pop">
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted mb-3">ВОПРОС РАУНДА</div>
            <div className="font-display font-bold text-[22px] leading-tight" style={{ letterSpacing: '-0.02em' }}>
              {prompt}
            </div>
            {error && (
              <div className="font-mono text-[9px] tracking-[0.2em] text-muted mt-4 opacity-60">
                ⚠ fallback prompt
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => nextPhase('answer')}
        disabled={prompt === null}
        className="h-16 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight disabled:opacity-40 active:scale-[0.98] transition-transform round-ring"
      >
        ПЕРЕДАЁМ ТЕЛЕФОН →
      </button>
    </div>
  );
}
