import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  // IMPORTANT: Replace with your actual OpenAI API key
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_API_KEY';

  if (OPENAI_API_KEY === 'YOUR_API_KEY') {
    console.warn('OpenAI API key not found. Using mock data.');
    // Mock data when API key is not available
    const refactoredCode = `// Refactored code:\n${code.replace('console.log', 'console.warn')}`;
    await new Promise(resolve => setTimeout(resolve, 2000));
    return NextResponse.json({ refactoredCode });
  }

  const model = new ChatOpenAI({ apiKey: OPENAI_API_KEY, model: "gpt-4" });
  const parser = new StringOutputParser();
  const runnable = model.pipe(parser);

  try {
    const result = await runnable.invoke([
      new HumanMessage(`Please refactor the following code:\n\n\`\`\`\n${code}\n\`\`\``),
    ]);
    return NextResponse.json({ refactoredCode: result });
  } catch (error) {
    console.error('Error calling AI model:', error);
    return NextResponse.json({ error: 'Failed to refactor code.' }, { status: 500 });
  }
} 