import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_SYSTEM = `Ты — генератор вопросов для русскоязычной пасс-фон вечеринки.
Каждый вопрос — это short, sharp, чуть провокационная подсказка,
на которую игроки придумывают забавные ответы.

Стиль:
- по-русски (можно смешать с английским или казахским иногда)
- 6–14 слов, одна фраза
- молодёжный, gen-z, чуть тёмный юмор, но без расизма/жести
- свежий, не баянистый
- темы: учёба, отношения, родители, KZ-локалитеты, поп-культура, абсурд, бытовуха
- НЕ начинай с "что", если можно. Лучше императив, конструкция, ситуация.

Примеры:
- "Самый странный комплимент, который ты слышал."
- "То, что ты гуглил в 3 ночи и удалил из истории."
- "Худший возможный нейминг для AI-стартапа в Алматы."
- "Признание, после которого мама перестанет тебя любить."
- "Ситуация, где ты притворился что понял шутку."

Верни ТОЛЬКО JSON: {"prompt": "<вопрос>"}
Никакого markdown, никаких объяснений.`;

const FAKE_SYSTEM = `Ты пишешь ответ в пасс-фон игре под видом одного из игроков.
Тебе дают вопрос и ВСЕ ответы реальных игроков. Цель — написать ответ так,
чтобы голосующие НЕ догадались что это AI.

КАК СЛИВАТЬСЯ С НИМИ (это критично):
1. ЗЕРКАЛЬ ИХ ДЛИНУ. Если все ответы короткие (3-6 слов) — твой тоже короткий. Если длинные — длинный.
2. ЗЕРКАЛЬ ИХ ЯЗЫК. Если они смешивают русский с английским или казахским — ты тоже. Если только русский — только русский.
3. ЗЕРКАЛЬ ИХ ОРФОГРАФИЮ. Если они пишут lowercase без точек — ты тоже. Если игроки делают опечатки или сокращения — ты тоже.
4. ЗЕРКАЛЬ ИХ ВАЙБ. Если они sarcastic — ты sarcastic. Если sincere — ты sincere. Если absurd — ты absurd.
5. НЕ БУДЬ ИДЕАЛЬНЫМ. Идеальная грамматика — палит. Будь слегка кривым.
6. НЕ ПОВТОРЯЙ их слова буквально, но твой ответ должен звучать как от того же круга людей.
7. Избегай эмодзи если игроки их не использовали.

ЧТО ПИСАТЬ:
- Свой собственный ответ на вопрос, не комментарий к чужим
- 4–14 слов обычно (но повторяй их длину)
- Тон под их компанию

Верни ТОЛЬКО JSON: {"fake": "<твой ответ>"}`;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method' }), { status: 405 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'no_api_key' }), { status: 500 });
  }

  let body = {};
  try { body = await req.json(); } catch {}

  try {
    if (body.kind === 'prompt') {
      const round = Number(body.round || 1);
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: PROMPT_SYSTEM,
        messages: [{ role: 'user', content: `Сгенерируй вопрос #${round}. Новый, не из примеров.` }],
      });
      const text = (msg.content || []).map((b) => b.type === 'text' ? b.text : '').join('').trim();
      const parsed = parseJson(text);
      const prompt = (parsed?.prompt || '').toString().slice(0, 180);
      if (!prompt) throw new Error('empty_prompt');
      return json({ prompt });
    }

    if (body.kind === 'fake') {
      const prompt = String(body.prompt || '').slice(0, 240);
      const humanAnswers = Array.isArray(body.humanAnswers)
        ? body.humanAnswers.map((s) => String(s).slice(0, 120))
        : [];
      const user = `ВОПРОС: ${prompt}\n\nОТВЕТЫ ИГРОКОВ:\n${humanAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nТвой ответ под человека:`;
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: FAKE_SYSTEM,
        messages: [{ role: 'user', content: user }],
      });
      const text = (msg.content || []).map((b) => b.type === 'text' ? b.text : '').join('').trim();
      const parsed = parseJson(text);
      const fake = (parsed?.fake || '').toString().slice(0, 160);
      if (!fake) throw new Error('empty_fake');
      return json({ fake });
    }

    return json({ error: 'unknown_kind' }, 400);
  } catch (err) {
    console.error('quiplash error', err);
    return json({ error: 'generation_failed', detail: String(err?.message || err) }, 502);
  }
};

function parseJson(text) {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const config = { path: '/api/quiplash' };
