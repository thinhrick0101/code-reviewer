import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const submissions = await Submission.find({}).sort({ createdAt: -1 });
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
} 