'use client';

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import * as Tabs from '@radix-ui/react-tabs';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Bot, Code, Zap, Lightbulb, CheckCircle, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

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
  
  // State for inline explanations
  const [explanations, setExplanations] = useState<{ [key: number]: string }>({});
  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState('review');

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewing(true);
    setReviewResult(null);
    setRefactoredCode('');
    setExplanations({});
    setActiveTab('review');

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
    setExplanations({});

    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, submissionId: reviewResult._id }),
      });
      if (!res.body) throw new Error("Response body is null");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedCode = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedCode += decoder.decode(value);
        setRefactoredCode(accumulatedCode);
      }
      setActiveTab('refactor');
    } catch (error) {
      console.error("Failed to refactor code:", error);
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleExplain = async (suggestion: string, index: number) => {
    // If explanation for this suggestion is already open, close it.
    if (explanations[index]) {
      setExplanations(prev => {
        const newExplanations = { ...prev };
        delete newExplanations[index];
        return newExplanations;
      });
      return;
    }

    setExplainingIndex(index);
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: suggestion }),
      });
      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setExplanations(prev => ({ ...prev, [index]: data.explanation }));
        return;
      }
      if (!res.body) throw new Error("Response body is null");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedExplanation = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedExplanation += decoder.decode(value);
        setExplanations(prev => ({ ...prev, [index]: accumulatedExplanation }));
      }
    } catch (error) {
      console.error("Failed to get explanation:", error);
      setExplanations(prev => ({ ...prev, [index]: "Sorry, I couldn't get an explanation for that." }));
    } finally {
      setExplainingIndex(null);
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
                {isReviewing ? <><Bot className="animate-spin h-5 w-5 mr-2" />Analyzing...</> : 'Review Code'}
              </button>
            </form>
          </div>

          <div className="mt-8 lg:mt-0">
            {isReviewing && (
                <div className="card bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-center h-full">
                    <Bot className="animate-spin h-6 w-6 mr-3" /><p className="text-lg">Analyzing your code...</p>
                </div>
            )}
            
            {reviewResult && !isReviewing && (
              <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full">
                <Tabs.List className="flex border-b border-gray-700">
                  <Tabs.Trigger value="review" className="px-4 py-2 text-lg font-medium text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-colors">Review</Tabs.Trigger>
                  {refactoredCode && <Tabs.Trigger value="refactor" className="px-4 py-2 text-lg font-medium text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-colors">Refactored</Tabs.Trigger>}
                </Tabs.List>
                
                <Tabs.Content value="review" className="pt-6">
                  <div className="card bg-gray-800 p-6 rounded-b-lg shadow-lg">
                    {reviewResult.error ? (
                        <div className="text-red-400 flex items-center"><AlertTriangle className="h-6 w-6 mr-3" /><p className="text-lg">{reviewResult.error}</p></div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {Object.entries(reviewCategories).map(([key, { icon, label }]) => (
                            reviewResult[key] && <div key={key} className="flex items-start"><div className="flex-shrink-0">{icon}</div><div className="ml-3"><h3 className="font-semibold text-lg">{label}</h3><p className="text-gray-300">{reviewResult[key]}</p></div></div>
                          ))}
                        </div>
                        {reviewResult.suggestions && reviewResult.suggestions.length > 0 && (
                          <div className="mt-6">
                            <h3 className="font-semibold text-lg mb-2 flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-yellow-300"/>Suggestions</h3>
                            <ul className="space-y-4">
                              {reviewResult.suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="bg-gray-700 p-4 rounded-lg">
                                  <p className="mb-3">{suggestion}</p>
                                  <button onClick={() => handleExplain(suggestion, index)} className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center" disabled={explainingIndex === index}>
                                    {explainingIndex === index ? 'Thinking...' : (explanations[index] ? 'Hide Explanation' : 'Explain')}
                                    {explanations[index] ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                                  </button>
                                  {explanations[index] && <div className="mt-3 pt-3 border-t border-gray-600 text-gray-300"><p>{explanations[index]}</p></div>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <button onClick={handleRefactor} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-6 flex items-center justify-center transition-all disabled:opacity-50" disabled={isRefactoring}>
                          {isRefactoring ? <><Zap className="animate-pulse h-5 w-5 mr-2" />Refactoring...</> : <><Zap className="h-5 w-5 mr-2" />Refactor Code</>}
                        </button>
                      </>
                    )}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="refactor" className="pt-6">
                    <div className="card bg-gray-800 rounded-b-lg shadow-lg">
                        <ReactDiffViewer oldValue={code} newValue={refactoredCode} splitView={true} useDarkTheme={true} leftTitle="Original Code" rightTitle="Refactored Code" />
                    </div>
                </Tabs.Content>
              </Tabs.Root>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
