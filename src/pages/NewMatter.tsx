import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { apiService } from '../services/api';

const NewMatter: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matterName, setMatterName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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

  const handleCreateMatter = async () => {
    if (!matterName.trim()) {
      setError('Matter name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      console.log('Attempting to create matter...');
      const response = await apiService.createMatter({
        matterName: matterName.trim(),
        description: description.trim() || null
      });

      console.log('Create matter response:', response);

      if (response && response.success) {
        console.log('Matter created successfully, navigating to search');
        // Store matter info in localStorage for the search page
        localStorage.setItem('currentMatter', JSON.stringify(response.matter));
        navigate('/search');
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to create matter';
        console.error('Matter creation failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('Error creating matter:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError(error.message || 'Failed to create matter');
    } finally {
      setIsCreating(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/matter-selection')}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Matter Selection
          </button>
          
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Matter</h1>
          <p className="text-gray-600">
            Give your matter a name and description to get started
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="space-y-6">
            {/* Matter Name */}
            <div>
              <label htmlFor="matterName" className="block text-sm font-semibold text-gray-700 mb-2">
                Matter Name *
              </label>
              <input
                type="text"
                id="matterName"
                className="form-input"
                placeholder="e.g., ABC Company Investigation, XYZ Litigation, etc."
                value={matterName}
                onChange={(e) => setMatterName(e.target.value)}
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose a descriptive name for your matter
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                className="form-input min-h-[100px] resize-none"
                placeholder="Add any additional details about this matter..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => navigate('/matter-selection')}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMatter}
                disabled={isCreating || !matterName.trim()}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Matter
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              After creating your matter, you'll be taken to the search page where you can generate reports 
              for organizations or individuals. All reports will be associated with this matter for easy tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMatter;

