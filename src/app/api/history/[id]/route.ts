import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';
import { headers } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // This line forces the route to be dynamic
  headers();
  
  const id = params.id;
  try {
    await dbConnect();
    const submission = await Submission.findById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    return NextResponse.json(submission);
  } catch (error) {
    console.error('Failed to fetch submission:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
} 