import { useGame } from './store';
import { Lobby } from './screens/Lobby';
import { Intro } from './screens/Intro';
import { AnswerScreen } from './screens/AnswerScreen';
import { WaitAI } from './screens/WaitAI';
import { VoteScreen } from './screens/VoteScreen';
import { Reveal } from './screens/Reveal';
import { Final } from './screens/Final';

const ROUND_ACCENTS = ['#FFD23F', '#FF4365', '#3DD5FF', '#9EFF00'];

export default function App() {
  const phase = useGame((s) => s.phase);
  const roundIdx = useGame((s) => s.roundIdx);
  const accent = ROUND_ACCENTS[roundIdx % ROUND_ACCENTS.length];

  return (
    <div className="stage bg-grain" style={{ ['--round' as string]: accent } as React.CSSProperties}>
      <div className="phone">
        {phase === 'lobby'   && <Lobby />}
        {phase === 'intro'   && <Intro />}
        {phase === 'answer'  && <AnswerScreen />}
        {phase === 'wait_ai' && <WaitAI />}
        {phase === 'vote'    && <VoteScreen />}
        {phase === 'reveal'  && <Reveal />}
        {phase === 'final'   && <Final />}
      </div>
    </div>
  );
}
