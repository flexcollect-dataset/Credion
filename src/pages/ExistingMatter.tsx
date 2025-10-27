import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Calendar, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

interface Matter {
  matterId: number;
  matterName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reportCount: number;
}

const ExistingMatter: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [matters, setMatters] = useState<Matter[]>([]);
  const [filteredMatters, setFilteredMatters] = useState<Matter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadMatters();
  }, []);

  useEffect(() => {
    // Filter matters based on search query
    if (searchQuery.trim()) {
      const filtered = matters.filter(matter =>
        matter.matterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (matter.description && matter.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMatters(filtered);
    } else {
      setFilteredMatters(matters);
    }
  }, [searchQuery, matters]);

  const loadMatters = async () => {
    setIsSearching(true);
    setError('');

    try {
      const response = await apiService.getMatters();
      if (response.success) {
        setMatters(response.matters);
        setFilteredMatters(response.matters);
      } else {
        setError(response.message || 'Failed to load matters');
      }
    } catch (error: any) {
      console.error('Error loading matters:', error);
      setError(error.message || 'Failed to load matters');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMatterSelect = (matter: Matter) => {
    // Store matter info in localStorage for the search page
    localStorage.setItem('currentMatter', JSON.stringify(matter));
    navigate('/search');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/matter-selection')}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Matter Selection
          </button>
          
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Select Existing Matter</h1>
          <p className="text-gray-600">
            Choose from your existing matters to continue working
          </p>
        </div>

        {/* Search */}
        <div className="card mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="search-input pl-12"
              placeholder="Search matters by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading matters...</p>
          </div>
        )}

        {/* Matters List */}
        {!isSearching && (
          <>
            {filteredMatters.length === 0 ? (
              <div className="card text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {matters.length === 0 ? 'No Matters Found' : 'No Matching Matters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {matters.length === 0 
                    ? "You haven't created any matters yet. Create your first matter to get started."
                    : "Try adjusting your search terms or create a new matter."
                  }
                </p>
                {matters.length === 0 && (
                  <button
                    onClick={() => navigate('/new-matter')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300"
                  >
                    Create Your First Matter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatters.map((matter) => (
                  <div
                    key={matter.matterId}
                    className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleMatterSelect(matter)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                            {matter.matterName}
                          </h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                            matter.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : matter.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {matter.status}
                          </span>
                        </div>
                        
                        {matter.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {matter.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created {formatDate(matter.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {matter.reportCount} report{matter.reportCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create New Matter Button */}
        {!isSearching && matters.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/new-matter')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
            >
              Create New Matter Instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExistingMatter;

