import { useGame } from '../store';

export function Reveal() {
  const players = useGame((s) => s.players);
  const roundIdx = useGame((s) => s.roundIdx);
  const totalRounds = useGame((s) => s.totalRounds);
  const rounds = useGame((s) => s.rounds);
  const nextRound = useGame((s) => s.nextRound);

  const round = rounds[roundIdx];
  const sortedAnswers = [...round.answers].sort((a, b) => b.votes.length - a.votes.length);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // attribution accuracy per voter
  const accuracyByVoter: Record<string, { correct: number; total: number }> = {};
  for (const p of players) accuracyByVoter[p.id] = { correct: 0, total: 0 };
  for (const [voterId, mapping] of Object.entries(round.attributions)) {
    for (const [answerId, predicted] of Object.entries(mapping)) {
      const ans = round.answers.find((a) => a.id === answerId);
      if (!ans || ans.authorId === voterId) continue;
      accuracyByVoter[voterId].total += 1;
      if (predicted === ans.authorId) accuracyByVoter[voterId].correct += 1;
    }
  }

  const authorLabel = (authorId: string | 'ai') => {
    if (authorId === 'ai') return { name: 'AI', emoji: '🤖', isAi: true };
    const p = players.find((pp) => pp.id === authorId);
    return { name: p?.name || '?', emoji: p?.emoji || '?', isAi: false };
  };

  return (
    <div className="h-full flex flex-col p-6 animate-slide-up">
      <div className="pt-2 pb-3 text-center">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted">
          РАУНД {roundIdx + 1} · РАЗОБЛАЧЕНИЕ
        </div>
        <h2 className="font-display font-extrabold text-[26px] mt-1 text-paper" style={{ letterSpacing: '-0.02em' }}>
          {round.prompt}
        </h2>
      </div>

      <div className="flex-1 overflow-auto -mx-1 px-1">
        <div className="flex flex-col gap-3 pb-3">
          {sortedAnswers.map((a, i) => {
            const author = authorLabel(a.authorId);
            return (
              <div
                key={a.id}
                className="rounded-2xl px-5 py-4"
                style={{
                  background: author.isAi ? 'rgba(255, 210, 63, 0.10)' : '#1A1A1D',
                  border: author.isAi ? '1px solid rgba(255, 210, 63, 0.4)' : '1px solid transparent',
                  animation: `slideUp 280ms cubic-bezier(.2,.8,.2,1) both ${i * 80}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{author.emoji}</span>
                    <span
                      className="font-display font-bold text-[15px]"
                      style={{ color: author.isAi ? 'var(--round)' : 'var(--paper)' }}
                    >
                      {author.name}
                    </span>
                    {author.isAi && (
                      <span className="font-mono text-[9px] tracking-[0.3em] text-ink bg-sun px-2 py-0.5 rounded-full">
                        FAKE
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] tracking-[0.16em] text-muted">
                    {a.votes.length === 0 ? '— голосов' : a.votes.length === 1 ? '1 голос' : `${a.votes.length} голосов`}
                  </div>
                </div>
                <div className="font-display font-semibold text-paper text-[17px] leading-snug">
                  {a.text}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 mb-3">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted text-center mb-2">
            СЧЁТ
          </div>
          <div className="flex flex-col gap-1.5">
            {sortedPlayers.map((p, i) => {
              const acc = accuracyByVoter[p.id];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{
                    background: i === 0 ? 'rgba(255, 210, 63, 0.10)' : '#1A1A1D',
                  }}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="flex-1 font-display font-bold text-paper text-[15px]">{p.name}</span>
                  {acc && acc.total > 0 && (
                    <span className="font-mono text-[10px] tracking-[0.14em] text-muted mr-2">
                      {acc.correct}/{acc.total}
                    </span>
                  )}
                  <span
                    className="font-mono font-bold text-[15px]"
                    style={{ color: i === 0 ? 'var(--round)' : 'var(--paper)' }}
                  >
                    {p.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={nextRound}
        className="h-16 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight active:scale-[0.98] transition-transform round-ring"
      >
        {roundIdx + 1 < totalRounds ? 'СЛЕДУЮЩИЙ РАУНД →' : 'ИТОГИ →'}
      </button>
    </div>
  );
}
