import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SOURCE_FILE = path.join(process.cwd(), 'messages/en.json');
const TARGET_LANGS = ['vi', 'ko', 'ja', 'zh'];

async function translateContent(content: any, targetLang: string): Promise<any> {
  console.log(`Creating translation for: ${targetLang}...`);
  
  const prompt = `
    You are a professional crypto translator.
    Translate the following JSON content from English to ${targetLang}.
    
    Rules:
    1. Keep keys exactly the same.
    2. Translate values naturally for crypto traders.
    3. Keep technical terms (Long, Short, Leverage, Margin) standard if commonly used in English, otherwise use the standard local crypto term.
    4. Return ONLY valid JSON.
    
    JSON:
    ${JSON.stringify(content, null, 2)}
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apexrebate.com',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedContent = JSON.parse(data.choices[0].message.content);
    return translatedContent;
  } catch (error) {
    console.error(`Translation failed for ${targetLang}:`, error);
    return null;
  }
}

async function main() {
  if (!OPENROUTER_API_KEY) {
    console.error('Missing OPENROUTER_API_KEY');
    process.exit(1);
  }

  const sourceContent = JSON.parse(await fs.readFile(SOURCE_FILE, 'utf-8'));

  for (const lang of TARGET_LANGS) {
    const targetFile = path.join(process.cwd(), `messages/${lang}.json`);
    let existingContent = {};
    
    try {
      existingContent = JSON.parse(await fs.readFile(targetFile, 'utf-8'));
    } catch (e) {
      // File doesn't exist or invalid
    }

    // Deep merge or check missing keys logic here
    // For simplicity in this script, we re-translate everything to ensure consistency
    // In production, you'd diff keys to save tokens.
    
    const translated = await translateContent(sourceContent, lang);
    
    if (translated) {
      await fs.writeFile(targetFile, JSON.stringify(translated, null, 2));
      console.log(`✅ Saved messages/${lang}.json`);
    }
  }
}

main();
