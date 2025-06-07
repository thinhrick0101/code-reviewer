'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ISubmission } from '@/models/Submission';
import { FileText, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/history');
        if (!res.ok) {
          throw new Error('Failed to fetch submission history');
        }
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Loading submission history...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Submission History</h1>
      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <Link key={sub._id} href={`/history/${sub._id}`} className="block bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-3 text-blue-400" />
                <h2 className="text-xl font-semibold truncate">{sub.code.substring(0, 50)}...</h2>
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{new Date(sub.createdAt).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No submissions found.</p>
      )}
    </div>
  );
} 