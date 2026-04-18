import { env } from '../config/env';

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

export async function reviewCode(code: string, language: string): Promise<string> {
  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.togetherApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Review the code for bugs, security issues, performance problems, and style. Format your response with clear sections: Bugs, Security, Performance, Style. Be concise and actionable.',
        },
        {
          role: 'user',
          content: `Language: ${language}\n\nCode:\n${code}`,
        },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Together.ai API error: ${response.status} ${body}`);
  }

  const data: any = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? 'No review returned.';
}
