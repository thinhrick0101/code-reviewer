import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const explanation = await ragService.getExplanation(question);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error in RAG API:', error);
    return NextResponse.json({ error: 'Failed to get explanation' }, { status: 500 });
  }
} 