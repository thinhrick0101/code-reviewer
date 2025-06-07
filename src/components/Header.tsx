import Link from 'next/link';
import { Bot } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
          <Bot className="h-7 w-7 text-blue-400" />
          <span>AI Code Reviewer</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/history" className="text-gray-300 hover:text-white transition-colors">
            History
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 