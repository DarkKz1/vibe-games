import { useEffect, useState } from 'react';
import { useGame } from '../store';

const LOADING_MSGS = [
  'AI читает ваши ответы…',
  'AI завидует…',
  'AI пишет свой ответ…',
  'AI пробует звучать как человек…',
  'AI скрывает следы…',
];

export function WaitAI() {
  const rounds = useGame((s) => s.rounds);
  const roundIdx = useGame((s) => s.roundIdx);
  const addAiFake = useGame((s) => s.addAiFake);
  const shuffleAnswers = useGame((s) => s.shuffleAnswers);
  const nextPhase = useGame((s) => s.nextPhase);

  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MSGS.length), 900);

    const round = rounds[roundIdx];
    if (!round) return;
    const startedAt = Date.now();
    const minDelay = 2200;

    const proceed = (text: string) => {
      const wait = Math.max(0, minDelay - (Date.now() - startedAt));
      setTimeout(() => {
        addAiFake(text);
        shuffleAnswers();
        nextPhase('vote');
      }, wait);
    };

    fetch('/api/quiplash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'fake',
        prompt: round.prompt,
        humanAnswers: round.answers.map((a) => a.text),
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        const fake = (d?.fake || '').toString().trim();
        if (!fake) throw new Error('empty');
        proceed(fake);
      })
      .catch(() => {
        const fb = [
          'мне стыдно, но я погуглил это в школе',
          'мама запретила, но я всё равно сделал',
          'я думал что я один такой',
          'хочу, но боюсь что засмеют',
        ];
        proceed(fb[Math.floor(Math.random() * fb.length)]);
      });

    return () => clearInterval(tick);
  }, [rounds, roundIdx, addAiFake, shuffleAnswers, nextPhase]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-[80px] leading-none animate-wiggle">🤖</div>
      <div className="font-display font-extrabold text-[28px] mt-4 round-tint" style={{ letterSpacing: '-0.02em' }}>
        AI в деле
      </div>
      <div className="font-mono text-[12px] tracking-[0.2em] text-muted mt-3 min-h-[20px]">
        {LOADING_MSGS[msgIdx]}
      </div>

      <div className="mt-10 w-3/4 h-[2px] rounded bg-smoke overflow-hidden">
        <div className="h-full round-bg animate-pulse" style={{ width: '70%' }} />
      </div>
    </div>
  );
}
