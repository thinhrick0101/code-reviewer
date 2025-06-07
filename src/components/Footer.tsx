const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-12">
      <div className="container mx-auto text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} AI Code Reviewer. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 