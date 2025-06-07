import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { code, submissionId } = await req.json();

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_API_KEY';

  if (OPENAI_API_KEY === 'YOUR_API_KEY') {
    console.warn('OpenAI API key not found. Using mock streaming data.');
    const refactoredCode = `// Refactored code (mock):\n${code.replace('console.log', 'console.warn')}`;
    if (submissionId) {
        await dbConnect();
        await Submission.findByIdAndUpdate(submissionId, { refactoredCode });
    }
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of refactoredCode) {
          controller.enqueue(new TextEncoder().encode(char));
          await new Promise(resolve => setTimeout(resolve, 25));
        }
        controller.close();
      },
    });
    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const model = new ChatOpenAI({ 
    apiKey: OPENAI_API_KEY, 
    model: "gpt-4",
    streaming: true,
  });
  const parser = new StringOutputParser();
  const chain = model.pipe(parser);

  try {
    const stream = await chain.stream([
      new HumanMessage(`Please refactor the following code. Return only the raw, refactored code, without any markdown fences, explanations, or other surrounding text.\n\nCode:\n\`\`\`\n${code}\n\`\`\``),
    ]);
    
    if (submissionId) {
      const [dbStream, clientStream] = stream.tee();
      
      dbConnect().then(async () => {
          const reader = dbStream.getReader();
          let refactoredCode = '';
          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              refactoredCode += value;
          }
          await Submission.findByIdAndUpdate(submissionId, { refactoredCode });
      });

      return new NextResponse(clientStream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return new NextResponse(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error('Error calling AI model:', error);
    return NextResponse.json({ error: 'Failed to refactor code.' }, { status: 500 });
  }
} 