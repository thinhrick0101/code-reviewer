import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">
          AI Code Reviewer
        </Link>
        <nav>
          <Link href="/about" className="mr-4">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 