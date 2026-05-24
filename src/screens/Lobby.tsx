import { useState } from 'react';
import { useGame } from '../store';

const EMOJIS = ['🐺', '🦊', '🐧', '🦉', '🐙', '🦋', '🐢', '🦄', '🐝', '🐰', '🦁', '🐯', '🐨', '🐼', '👻', '👽', '🤖', '🎃'];

export function Lobby() {
  const players = useGame((s) => s.players);
  const addPlayer = useGame((s) => s.addPlayer);
  const removePlayer = useGame((s) => s.removePlayer);
  const startGame = useGame((s) => s.startGame);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

  const canAdd = name.trim().length > 0 && players.length < 4;
  const canStart = players.length >= 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    addPlayer(name.trim(), emoji);
    setName('');
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="pt-2 pb-4 text-center animate-slide-up">
        <div className="font-mono text-[11px] tracking-[0.32em] text-muted">— PASS-PHONE PARTY —</div>
        <h1 className="font-display text-[64px] leading-none font-extrabold mt-1 text-paper" style={{ letterSpacing: '-0.04em' }}>
          БАЗАР<span className="round-tint">.</span>
        </h1>
        <p className="text-muted text-sm mt-3 max-w-[280px] mx-auto leading-snug">
          AI задаёт <span className="text-paper font-semibold">странный вопрос</span>. Вы пишете ответ.
          AI добавляет <span className="round-tint font-semibold">фальшивку</span>. Голосуете.
          Угадал фальшивку — куш.
        </p>
      </div>

      <div className="flex-1 overflow-auto -mx-2 px-2">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted text-center mb-3">
          ИГРОКИ · {players.length}/4
        </div>
        {players.length === 0 && (
          <div className="text-center text-muted text-sm py-8 animate-pulse">
            добавь хотя бы 2-х
          </div>
        )}
        <div className="flex flex-col gap-2 mb-4">
          {players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-smoke animate-pop"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-2xl">{p.emoji}</span>
              <span className="flex-1 font-display font-bold text-paper text-[17px]">{p.name}</span>
              <button
                onClick={() => removePlayer(p.id)}
                className="text-muted text-xl font-sans hover:text-flame transition-colors"
                aria-label="remove"
              >×</button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEmoji(EMOJIS[(EMOJIS.indexOf(emoji) + 1) % EMOJIS.length])}
            className="text-3xl w-14 h-14 rounded-2xl bg-smoke flex items-center justify-center"
            aria-label="change emoji"
          >
            {emoji}
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="имя…"
            maxLength={14}
            className="flex-1 bg-smoke text-paper rounded-2xl px-4 h-14 outline-none font-display font-semibold text-[18px] placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!canAdd}
            className="h-14 w-14 rounded-2xl font-mono font-bold text-[22px] round-bg text-ink disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={startGame}
          disabled={!canStart}
          className="h-16 rounded-2xl font-display font-extrabold text-[20px] round-bg text-ink tracking-tight disabled:opacity-30 active:scale-[0.98] transition-transform round-ring"
        >
          {canStart ? 'НАЧАТЬ →' : 'минимум 2 игрока'}
        </button>
        <div className="text-center text-muted text-[11px] font-mono tracking-[0.2em] pb-1">
          2 РАУНДА · ~5 МИНУТ
        </div>
      </form>
    </div>
  );
}
