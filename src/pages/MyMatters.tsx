import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Matter {
  matterId: number;
  matterName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const MyMatters: React.FC = () => {
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
    let filtered = matters;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(matter =>
        matter.matterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (matter.description && matter.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredMatters(filtered);
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
        setError('Failed to load matters');
      }
    } catch (error: any) {
      console.error('Error loading matters:', error);
      setError(error.message || 'Failed to load matters');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMatterSelect = (matter: Matter) => {
    navigate(`/matter-reports/${matter.matterId}`);
  };

  const handleEditMatter = (matter: Matter) => {
    // TODO: Implement edit functionality
    console.log('Edit matter:', matter);
  };

  const handleDeleteMatter = async (matter: Matter) => {
    if (!confirm(`Are you sure you want to delete "${matter.matterName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiService.deleteMatter(matter.matterId);
      if (response.success) {
        loadMatters(); // Reload the list
      } else {
        setError(response.message || 'Failed to delete matter');
      }
    } catch (error: any) {
      console.error('Error deleting matter:', error);
      setError(error.message || 'Failed to delete matter');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Matters
          </h1>
          <p className="text-xl text-gray-600">
            Manage all your matters in one place
          </p>
        </div>

        {/* Create Matter Button - Small and at the top */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate('/new-matter')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Matter
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    : "Try adjusting your search terms or filter options."
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
              <div className="grid gap-4">
                {filteredMatters.map((matter) => (
                  <div
                    key={matter.matterId}
                    className="card hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => handleMatterSelect(matter)}>
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                            {matter.matterName}
                          </h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(matter.status)}`}>
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
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleMatterSelect(matter)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                          title="Select Matter"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMatter(matter);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          title="Edit Matter"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMatter(matter);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                          title="Delete Matter"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyMatters;
