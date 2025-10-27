import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowRight } from 'lucide-react';

const MatterSelection: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  const handleNewMatter = () => {
    navigate('/new-matter');
  };

  const handleExistingMatter = () => {
    navigate('/existing-matter');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="text-red-600">{user?.firstName}</span>
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you'd like to proceed with your report generation
          </p>
        </div>

        {/* Matter Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* New Matter Card */}
          <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={handleNewMatter}>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors duration-300">
                <Plus className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">New Matter</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Start a new matter and generate reports for a fresh case or investigation.
              </p>
              <div className="flex items-center justify-center text-red-600 font-semibold group-hover:text-red-700 transition-colors duration-300">
                <span>Create New Matter</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Existing Matter Card */}
          <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={handleExistingMatter}>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Matter</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Continue working on an existing matter and add more reports to your case.
              </p>
              <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                <span>Select Existing Matter</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Matters</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Reports Generated</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$0.00</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterSelection;

