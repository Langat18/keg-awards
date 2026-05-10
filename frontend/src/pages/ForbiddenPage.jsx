import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f4f1] px-4">
      <div className="text-center">
        <p className="text-6xl font-black text-[#CBD300]">403</p>
        <h1 className="text-xl font-bold text-[#7F622C] mt-2">Access Forbidden</h1>
        <p className="text-gray-500 text-sm mt-1">You do not have permission to view this page.</p>
        <Link to="/staff" className="inline-block mt-6 bg-[#7F622C] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#5c4620] transition-colors">
          Back to Staff Home
        </Link>
      </div>
    </div>
  );
}

