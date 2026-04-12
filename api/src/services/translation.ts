import { env } from '../config/env';

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

interface TranslationResult {
  translatedCode: string;
  tokensUsed: number;
}

export async function translateCode(
  sourceCode: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<TranslationResult> {
  const systemPrompt = `You are an expert code translator. Translate the given code from ${sourceLanguage} to ${targetLanguage}. 
Rules:
- Output ONLY the translated code, no explanations or markdown fences.
- Preserve the logic, structure, and comments (translated to the target language idioms).
- Use idiomatic patterns for the target language.
- If the source code has imports, translate them to the equivalent packages/modules in the target language.`;

  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.togetherApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sourceCode },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Together.ai API error: ${response.status} ${body}`);
  }

  const data: any = await response.json();
  const translatedCode = data.choices?.[0]?.message?.content?.trim() ?? '';
  const tokensUsed = data.usage?.total_tokens ?? 0;

  return { translatedCode, tokensUsed };
}
