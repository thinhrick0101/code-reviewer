import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  // IMPORTANT: Replace with your actual OpenAI API key
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_API_KEY';

  if (OPENAI_API_KEY === 'YOUR_API_KEY') {
    console.warn('OpenAI API key not found. Using mock data.');
    // Mock data when API key is not available
    const review = {
      style: 'good',
      performance: 'excellent',
      security: 'ok',
      suggestions: [
        'Consider adding more comments to your code.',
        'You could improve the performance of this function by using a different algorithm.',
      ],
    };
    await new Promise(resolve => setTimeout(resolve, 2000));
    return NextResponse.json(review);
  }

  const parser = new JsonOutputFunctionsParser();
  const model = new ChatOpenAI({ apiKey: OPENAI_API_KEY, model: "gpt-4" });

  const runnable = model.bind({
    functions: [
      {
        name: "code_review",
        description: "Reviews a piece of code and provides feedback on style, performance, and security.",
        parameters: {
          type: "object",
          properties: {
            style: {
              type: "string",
              description: "Feedback on the code style."
            },
            performance: {
              type: "string",
              description: "Feedback on the code performance."
            },
            security: {
              type: "string",
              description: "Feedback on the code security."
            },
            suggestions: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Suggestions for improvement."
            }
          },
          required: ["style", "performance", "security", "suggestions"]
        }
      }
    ],
    function_call: { name: "code_review" }
  }).pipe(parser);

  try {
    const result = await runnable.invoke([
      new HumanMessage(`Please review the following code:\n\n\`\`\`\n${code}\n\`\`\``),
    ]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calling AI model:', error);
    return NextResponse.json({ error: 'Failed to review code.' }, { status: 500 });
  }
} 