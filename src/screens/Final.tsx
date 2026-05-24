import { useGame } from '../store';

const TITLES = ['ЦАРЬ БАЗАРА', 'ХОЗЯИН СЛОВА', 'МАСТЕР ЛЖИ', 'ТИХАЯ СИЛА'];

export function Final() {
  const players = useGame((s) => s.players);
  const reset = useGame((s) => s.reset);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="h-full flex flex-col p-6 animate-slide-up">
      <div className="text-center pt-4">
        <div className="font-mono text-[11px] tracking-[0.3em] text-muted">— ФИНАЛ —</div>
        <h1 className="font-display font-extrabold text-[44px] leading-none mt-2 text-paper" style={{ letterSpacing: '-0.04em' }}>
          ИТОГ
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-paper text-ink rounded-3xl p-6 card-shadow w-full text-center animate-pop">
          <div className="text-[80px] leading-none">{winner?.emoji}</div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted mt-2">ПОБЕДИТЕЛЬ</div>
          <div className="font-display font-extrabold text-[40px] mt-1" style={{ letterSpacing: '-0.03em' }}>
            {winner?.name}
          </div>
          <div className="font-display font-bold text-[28px] mt-1 round-tint" style={{ letterSpacing: '-0.02em' }}>
            {winner?.score} очков
          </div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-muted mt-3">
            {TITLES[Math.floor(Math.random() * TITLES.length)]}
          </div>

          <div className="mt-6 border-t border-chalk pt-4">
            <div className="font-mono text-[9px] tracking-[0.3em] text-muted mb-2">ОСТАЛЬНЫЕ</div>
            <div className="flex flex-col gap-1.5">
              {sorted.slice(1).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-[15px]">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{p.emoji}</span>
                    <span className="font-display font-semibold text-ink">{p.name}</span>
                  </span>
                  <span className="font-mono font-bold text-ink">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={reset}
        className="h-16 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight active:scale-[0.98] transition-transform round-ring"
      >
        ЕЩЁ РАЗ →
      </button>
    </div>
  );
}
