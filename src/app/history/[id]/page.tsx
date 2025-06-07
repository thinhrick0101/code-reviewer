'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import { ISubmission } from '@/models/Submission';
import { Zap, CheckCircle, ShieldCheck, Lightbulb, Code } from 'lucide-react';

const reviewCategories = {
  style: { icon: <CheckCircle className="h-5 w-5 text-green-400" />, label: 'Style' },
  performance: { icon: <Zap className="h-5 w-5 text-yellow-400" />, label: 'Performance' },
  security: { icon: <ShieldCheck className="h-5 w-5 text-blue-400" />, label: 'Security' },
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchSubmission = async () => {
        try {
          const res = await fetch(`/api/history/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch submission details');
          }
          const data = await res.json();
          setSubmission(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubmission();
    }
  }, [id]);

  if (isLoading) {
    return <div className="text-center p-10">Loading submission...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-400">Error: {error}</div>;
  }
  
  if (!submission) {
    return <div className="text-center p-10">Submission not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Submission Detail</h1>
      <div className="space-y-8">
        {/* Original Code */}
        <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Code className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-semibold">Original Code</h2>
          </div>
          <div className="rounded-md overflow-hidden border-2 border-gray-700">
            <CodeEditor value={submission.code} readOnly />
          </div>
        </div>

        {/* Review Result */}
        <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Review Result</h2>
          <div className="space-y-4">
            {Object.entries(reviewCategories).map(([key, { icon, label }]) => (
              submission.review[key] && (
                  <div key={key} className="flex items-start">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-lg">{label}</h3>
                      <p className="text-gray-300">{submission.review[key]}</p>
                    </div>
                  </div>
              )
            ))}
          </div>
          {submission.review.suggestions && submission.review.suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-yellow-300"/>Suggestions</h3>
              <ul className="space-y-4">
                {submission.review.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="bg-gray-700 p-3 rounded-lg">
                    <p>{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Refactored Code */}
        {submission.refactoredCode && (
            <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Refactored Code</h2>
                <div className="rounded-md overflow-hidden border-2 border-gray-700">
                    <CodeEditor value={submission.refactoredCode} readOnly />
                </div>
            </div>
        )}
      </div>
    </div>
  );
} 