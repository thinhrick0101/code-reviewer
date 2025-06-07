'use client';

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';

export default function HomePage() {
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, world!");\n}');
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [refactoredCode, setRefactoredCode] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewing(true);
    setReviewResult(null);
    setRefactoredCode('');
    setExplanation('');

    const res = await fetch('/api/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setReviewResult(data);
    setIsReviewing(false);
  };

  const handleRefactor = async () => {
    setIsRefactoring(true);
    setRefactoredCode('');
    setExplanation('');

    const res = await fetch('/api/refactor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setRefactoredCode(data.refactoredCode);
    setIsRefactoring(false);
  };

  const handleExplain = async (suggestion: string) => {
    setIsExplaining(true);
    setExplanation('');

    const res = await fetch('/api/rag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: suggestion }),
    });

    const data = await res.json();
    setExplanation(data.explanation);
    setIsExplaining(false);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">AI Code Reviewer</h1>
      <form onSubmit={handleReview}>
        <CodeEditor value={code} onChange={(value) => setCode(value || '')} />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          disabled={isReviewing}
        >
          {isReviewing ? 'Analyzing...' : 'Review Code'}
        </button>
      </form>
      {isReviewing && <p className="mt-4">Analyzing your code...</p>}
      {reviewResult && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Review Result</h2>
          <div className="bg-gray-900 text-white p-4 rounded">
            <pre>{JSON.stringify(reviewResult, null, 2)}</pre>
          </div>
          <button
            onClick={handleRefactor}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
            disabled={isRefactoring}
          >
            {isRefactoring ? 'Refactoring...' : 'Refactor Code'}
          </button>
            {reviewResult.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="mt-4">
                    <p>{suggestion}</p>
                    <button
                        onClick={() => handleExplain(suggestion)}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded mt-2"
                        disabled={isExplaining}
                    >
                        {isExplaining ? 'Thinking...' : 'Explain'}
                    </button>
                </div>
            ))}
        </div>
      )}
      {isRefactoring && <p className="mt-4">Refactoring your code...</p>}
      {refactoredCode && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Refactored Code</h2>
          <div className="bg-gray-900 text-white p-4 rounded">
            <pre>{refactoredCode}</pre>
          </div>
        </div>
      )}
        {isExplaining && <p className="mt-4">Generating explanation...</p>}
        {explanation && (
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Explanation</h2>
                <div className="bg-gray-800 text-white p-4 rounded">
                    <p>{explanation}</p>
                </div>
            </div>
        )}
    </div>
  );
}
