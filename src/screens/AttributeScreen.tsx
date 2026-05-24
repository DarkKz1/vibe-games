import { useEffect, useState } from 'react';
import { useGame } from '../store';

export function AttributeScreen() {
  const players = useGame((s) => s.players);
  const idx = useGame((s) => s.currentAttribIdx);
  const roundIdx = useGame((s) => s.roundIdx);
  const rounds = useGame((s) => s.rounds);
  const submitAttribution = useGame((s) => s.submitAttribution);
  const scoreRound = useGame((s) => s.scoreRound);
  const nextPhase = useGame((s) => s.nextPhase);

  const [handed, setHanded] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const player = players[idx];
  const round = rounds[roundIdx];

  useEffect(() => {
    if (idx >= players.length) {
      scoreRound();
      nextPhase('reveal');
    }
  }, [idx, players.length, scoreRound, nextPhase]);

  if (idx >= players.length) return null;

  if (!handed) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-slide-up">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted mb-4">УГАДАЙ АВТОРОВ</div>
        <div className="text-[88px] leading-none mb-2 animate-wiggle">{player.emoji}</div>
        <div className="font-display font-extrabold text-[36px] text-paper" style={{ letterSpacing: '-0.03em' }}>
          {player.name}
        </div>
        <div className="font-mono text-[11px] tracking-[0.22em] text-muted mt-3 text-center max-w-[290px] leading-snug">
          сопоставь каждый ответ с автором.
          <br />
          <span className="round-tint">+25</span> за каждое угадывание.
        </div>
        <button
          onClick={() => {
            // pre-fill self answers (can't guess own)
            const seed: Record<string, string> = {};
            round.answers.forEach((a) => {
              if (a.authorId === player.id) seed[a.id] = player.id;
            });
            setMapping(seed);
            setHanded(true);
          }}
          className="mt-10 h-16 px-8 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight active:scale-[0.98] transition-transform round-ring"
        >
          ПОЕХАЛИ →
        </button>
      </div>
    );
  }

  const choices: { id: string; emoji: string; name: string; isAi: boolean }[] = [
    ...players.map((p) => ({ id: p.id, emoji: p.emoji, name: p.name, isAi: false })),
    { id: 'ai', emoji: '🤖', name: 'AI', isAi: true },
  ];

  const setChoice = (answerId: string, authorId: string) => {
    setMapping((m) => ({ ...m, [answerId]: authorId }));
  };

  const isOwn = (answerId: string): boolean => {
    const a = round.answers.find((x) => x.id === answerId);
    return !!a && a.authorId === player.id;
  };

  const allFilled = round.answers.every((a) => isOwn(a.id) || mapping[a.id]);

  const send = () => {
    if (!allFilled) return;
    submitAttribution(mapping);
    setMapping({});
    setHanded(false);
  };

  return (
    <div className="h-full flex flex-col p-5 animate-slide-up">
      <div className="pt-1 pb-2 flex items-center gap-3">
        <span className="text-3xl">{player.emoji}</span>
        <div>
          <div className="font-display font-bold text-paper text-[16px]">{player.name}</div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
            АТРИБУЦИЯ · {idx + 1}/{players.length}
          </div>
        </div>
      </div>

      <div className="bg-paper text-ink rounded-2xl p-3 card-shadow mb-2">
        <div className="font-mono text-[9px] tracking-[0.3em] text-muted">ВОПРОС</div>
        <div className="font-display font-bold text-[15px] leading-tight" style={{ letterSpacing: '-0.01em' }}>
          {round.prompt}
        </div>
      </div>

      <div className="flex-1 overflow-auto -mx-1 px-1">
        <div className="flex flex-col gap-3 pb-3">
          {round.answers.map((a, i) => {
            const own = isOwn(a.id);
            return (
              <div
                key={a.id}
                className="rounded-2xl p-3"
                style={{
                  background: own ? 'rgba(255,255,255,0.04)' : '#1A1A1D',
                  border: own ? '1px dashed rgba(255,255,255,0.18)' : '1px solid transparent',
                }}
              >
                <div className="font-mono text-[9px] tracking-[0.3em] text-muted mb-1">
                  ВАРИАНТ {String.fromCharCode(65 + i)}{own && ' · ТВОЙ'}
                </div>
                <div className="font-display font-semibold text-paper text-[15px] leading-snug mb-2">
                  {a.text}
                </div>
                {!own && (
                  <div className="flex flex-wrap gap-1.5">
                    {choices.filter((c) => c.id !== player.id).map((c) => {
                      const active = mapping[a.id] === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setChoice(a.id, c.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-display font-semibold transition-all"
                          style={{
                            background: active ? 'var(--round)' : 'transparent',
                            color: active ? '#0A0A0B' : '#F7F5F0',
                            border: active ? '1px solid var(--round)' : '1px solid rgba(255,255,255,0.18)',
                          }}
                        >
                          <span>{c.emoji}</span>
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={send}
        disabled={!allFilled}
        className="h-14 rounded-2xl font-display font-extrabold text-[18px] round-bg text-ink tracking-tight disabled:opacity-30 active:scale-[0.98] transition-transform round-ring mt-2"
      >
        ОТПРАВИТЬ →
      </button>
    </div>
  );
}
