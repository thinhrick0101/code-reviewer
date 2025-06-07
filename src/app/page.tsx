'use client';

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import { Bot, Code, Zap, Lightbulb, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

// A map to associate keys with icons and labels
const reviewCategories = {
  style: { icon: <CheckCircle className="h-5 w-5 text-green-400" />, label: 'Style' },
  performance: { icon: <Zap className="h-5 w-5 text-yellow-400" />, label: 'Performance' },
  security: { icon: <ShieldCheck className="h-5 w-5 text-blue-400" />, label: 'Security' },
};

export default function HomePage() {
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, world!");\n}');
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [refactoredCode, setRefactoredCode] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewing(true);
    setReviewResult(null);
    setRefactoredCode('');
    setExplanation('');
    setActiveSuggestion(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setReviewResult(data);
    } catch (error) {
      console.error("Failed to get review:", error);
      setReviewResult({ error: "Failed to get review." });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRefactor = async () => {
    setIsRefactoring(true);
    setRefactoredCode('');
    setExplanation('');
    setActiveSuggestion(null);

    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setRefactoredCode(data.refactoredCode);
    } catch (error) {
      console.error("Failed to refactor code:", error);
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleExplain = async (suggestion: string) => {
    setIsExplaining(true);
    setExplanation('');
    setActiveSuggestion(suggestion);

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: suggestion }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (error) {
      console.error("Failed to get explanation:", error);
      setExplanation("Sorry, I couldn't get an explanation for that.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Code Reviewer</h1>
          <p className="text-lg text-gray-400">Your intelligent assistant for better, cleaner, and more secure code.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Code Editor */}
          <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Code className="h-6 w-6 mr-2" />
              <h2 className="text-2xl font-semibold">Code Input</h2>
            </div>
            <form onSubmit={handleReview}>
              <div className="rounded-md overflow-hidden border-2 border-gray-700 focus-within:border-blue-500 transition-colors">
                <CodeEditor value={code} onChange={(value) => setCode(value || '')} />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-4 flex items-center justify-center transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isReviewing}
              >
                {isReviewing ? (
                  <>
                    <Bot className="animate-spin h-5 w-5 mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Review Code'
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-8 mt-8 lg:mt-0">
            {isReviewing && (
                <div className="card bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-center">
                    <Bot className="animate-spin h-6 w-6 mr-3" />
                    <p className="text-lg">Analyzing your code...</p>
                </div>
            )}
            
            {reviewResult && !reviewResult.error && (
              <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Review Result</h2>
                <div className="space-y-4">
                  {Object.entries(reviewCategories).map(([key, { icon, label }]) => (
                    reviewResult[key] && (
                        <div key={key} className="flex items-start">
                          <div className="flex-shrink-0">{icon}</div>
                          <div className="ml-3">
                            <h3 className="font-semibold text-lg">{label}</h3>
                            <p className="text-gray-300">{reviewResult[key]}</p>
                          </div>
                        </div>
                    )
                  ))}
                </div>
                {reviewResult.suggestions && reviewResult.suggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2 flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-yellow-300"/>Suggestions</h3>
                    <ul className="space-y-4">
                      {reviewResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="bg-gray-700 p-3 rounded-lg">
                          <p className="mb-2">{suggestion}</p>
                          <button
                            onClick={() => handleExplain(suggestion)}
                            className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                            disabled={isExplaining && activeSuggestion === suggestion}
                          >
                            {isExplaining && activeSuggestion === suggestion ? 'Thinking...' : 'Explain'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={handleRefactor}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-6 flex items-center justify-center transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRefactoring}
                >
                  {isRefactoring ? (
                    <>
                      <Zap className="animate-pulse h-5 w-5 mr-2" />
                      Refactoring...
                    </>
                  ) : (
                     <>
                      <Zap className="h-5 w-5 mr-2" />
                      Refactor Code
                    </>
                  )}
                </button>
              </div>
            )}
            {reviewResult && reviewResult.error && (
                <div className="card bg-gray-800 p-6 rounded-lg shadow-lg text-red-400 flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    <p className="text-lg">{reviewResult.error}</p>
                </div>
            )}

            {isRefactoring && (
                <div className="card bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-center">
                    <Zap className="animate-pulse h-6 w-6 mr-3" />
                    <p className="text-lg">Refactoring your code...</p>
                </div>
            )}
            {refactoredCode && (
              <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Refactored Code</h2>
                <div className="rounded-md overflow-hidden border-2 border-gray-700">
                  <CodeEditor value={refactoredCode} readOnly />
                </div>
              </div>
            )}

            {explanation && (
              <div className="card bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Explanation</h2>
                <p className="text-gray-300">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
