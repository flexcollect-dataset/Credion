import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSearch, setSelectedSearch] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate total amount based on selected options
  const calculateTotal = () => {
    return selectedOptions.length * 50; // $50 AUD per checkbox
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  // Reset sub-category when main category changes
  useEffect(() => {
    setSelectedSubCategory('');
    setSearchValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedCompany(null);
    setSelectedOptions([]);
  }, [selectedSearch]);

  // Debounced search for suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchValue.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await apiService.searchABNByName(searchValue.trim());
        setSuggestions(response.results.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
      } catch (error) {
        console.error('Suggestions error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Debug state changes
  useEffect(() => {
    console.log('selectedCompany changed:', selectedCompany);
    console.log('searchValue changed:', searchValue);
  }, [selectedCompany, searchValue]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
        // Check if click is not on a suggestion item
        const isSuggestionClick = target && (target as Element).closest('.suggestion-item');
        if (!isSuggestionClick) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    console.log('Selected suggestion:', suggestion);
    console.log('Setting searchValue to:', suggestion.Name);
    console.log('Setting selectedCompany to:', suggestion);
    setSearchValue(suggestion.Name);
    setSelectedCompany(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSearchValue('');
    setSelectedCompany(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedOptions([]);
  };

  // Handle option selection
  const handleOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, option]);
    } else {
      setSelectedOptions(prev => prev.filter(opt => opt !== option));
    }
  };

  // Handle select all options
  const handleSelectAll = () => {
    const allOptions = getAvailableOptions();
    setSelectedOptions(allOptions);
  };

  // Handle deselect all options
  const handleDeselectAll = () => {
    setSelectedOptions([]);
  };

  // Get available options based on selected search category
  const getAvailableOptions = () => {
    switch (selectedSearch) {
      case 'ASIC':
        return ['COURTS', 'ATO', 'PROPERTY SEARCH', 'DIRECTOR RELATED SEARCH', 'DIRECTOR PPSR', 'DIRECTOR BANKRUPTCY', 'DIRECTOR PROPERTY SEARCH'];
      case 'COURT':
        return ['PPSR', 'ATO', 'PROPERTY SEARCH', 'DIRECTOR RELATED SEARCH', 'DIRECTOR PPSR', 'DIRECTOR BANKRUPTCY', 'DIRECTOR PROPERTY SEARCH'];
      case 'ATO':
        return ['PPSR', 'COURTS', 'PROPERTY SEARCH', 'DIRECTOR RELATED SEARCH', 'DIRECTOR PPSR', 'DIRECTOR BANKRUPTCY', 'DIRECTOR PROPERTY SEARCH'];
      case 'BANKRUPTCY':
        return ['PPSR', 'COURTS', 'ATO', 'PROPERTY SEARCH', 'DIRECTOR RELATED SEARCH', 'DIRECTOR PPSR', 'DIRECTOR BANKRUPTCY', 'DIRECTOR PROPERTY SEARCH'];
      case 'LAND':
        return ['PPSR', 'COURTS', 'ATO', 'PROPERTY SEARCH', 'DIRECTOR RELATED SEARCH', 'DIRECTOR PPSR', 'DIRECTOR BANKRUPTCY', 'DIRECTOR PROPERTY SEARCH'];
      default:
        return [];
    }
  };


  if (isLoading) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen bg-gradient-to-br from-white via-credion-grey to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-credion-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen bg-gradient-to-br from-white via-credion-grey to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-credion-charcoal mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-gradient-to-br from-white via-credion-grey to-white">
      <div className="container-custom section-padding">
        <div className="max-w-6xl mx-auto">
          
          {/* Radio Button Selection */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-credion-charcoal mb-6 text-center">Select Search Category</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchCategory"
                  value="ASIC"
                  checked={selectedSearch === 'ASIC'}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">ASIC</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchCategory"
                  value="COURT"
                  checked={selectedSearch === 'COURT'}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-gray-700 font-medium">COURT</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchCategory"
                  value="ATO"
                  checked={selectedSearch === 'ATO'}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                />
                <span className="text-gray-700 font-medium">ATO</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchCategory"
                  value="BANKRUPTCY"
                  checked={selectedSearch === 'BANKRUPTCY'}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                />
                <span className="text-gray-700 font-medium">BANKRUPTCY</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchCategory"
                  value="LAND"
                  checked={selectedSearch === 'LAND'}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">LAND</span>
              </label>
            </div>
          </div>

          {/* Conditional Sub-Category and Search Fields */}
          {selectedSearch && (
            <div className="mt-8">
              
              {/* ASIC Sub-Categories */}
              {selectedSearch === 'ASIC' && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-credion-charcoal mb-6">Select ASIC Search Type</h3>
                  <div className="flex flex-wrap justify-center gap-6 mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="asicType"
                        value="Historical"
                        checked={selectedSubCategory === 'Historical'}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">Historical</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="asicType"
                        value="Current"
                        checked={selectedSubCategory === 'Current'}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">Current</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="asicType"
                        value="Company"
                        checked={selectedSubCategory === 'Company'}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">Company</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="asicType"
                        value="Person"
                        checked={selectedSubCategory === 'Person'}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">Person</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Search Field */}
              {((selectedSearch === 'ASIC' && selectedSubCategory) || selectedSearch !== 'ASIC') && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mt-6">
                  
                  {selectedSearch === 'ASIC' && (
                    <div className="max-w-md mx-auto relative">
                      <label className="block text-gray-700 font-medium mb-2">
                        Search {selectedSubCategory} Records
                      </label>
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={selectedCompany ? selectedCompany.Name : searchValue}
                          onChange={(e) => {
                            console.log('Input changed:', e.target.value);
                            setSearchValue(e.target.value);
                            if (selectedCompany) {
                              setSelectedCompany(null);
                            }
                          }}
                          onFocus={() => searchValue.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder={`Enter ${selectedSubCategory === 'Company' || selectedSubCategory === 'Person' ? selectedSubCategory.toLowerCase() : 'search term'}`}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                        />
                        
                        {/* Clear button */}
                        {selectedCompany && (
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {isLoadingSuggestions ? (
                              <div className="p-3 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                                <span className="ml-2">Loading suggestions...</span>
                              </div>
                            ) : (
                              suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionSelect(suggestion);
                                  }}
                                  className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{suggestion.Name}</div>
                                  <div className="text-sm text-gray-500">ABN: {suggestion.Abn}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSearch === 'COURT' && (
                    <div className="max-w-md mx-auto relative">
                      <label className="block text-gray-700 font-medium mb-2">
                        Search by ABN or Person Name
                      </label>
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={selectedCompany ? selectedCompany.Name : searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            if (selectedCompany) {
                              setSelectedCompany(null);
                            }
                          }}
                          onFocus={() => searchValue.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder="Enter ABN or Person Name"
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        />
                        
                        {/* Clear button */}
                        {selectedCompany && (
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {isLoadingSuggestions ? (
                              <div className="p-3 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mx-auto"></div>
                                <span className="ml-2">Loading suggestions...</span>
                              </div>
                            ) : (
                              suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionSelect(suggestion);
                                  }}
                                  className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{suggestion.Name}</div>
                                  <div className="text-sm text-gray-500">ABN: {suggestion.Abn}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSearch === 'ATO' && (
                    <div className="max-w-md mx-auto relative">
                      <label className="block text-gray-700 font-medium mb-2">
                        Search by ABN
                      </label>
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={selectedCompany ? selectedCompany.Name : searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            if (selectedCompany) {
                              setSelectedCompany(null);
                            }
                          }}
                          onFocus={() => searchValue.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder="Enter ABN"
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
                        />
                        
                        {/* Clear button */}
                        {selectedCompany && (
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {isLoadingSuggestions ? (
                              <div className="p-3 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mx-auto"></div>
                                <span className="ml-2">Loading suggestions...</span>
                              </div>
                            ) : (
                              suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionSelect(suggestion);
                                  }}
                                  className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{suggestion.Name}</div>
                                  <div className="text-sm text-gray-500">ABN: {suggestion.Abn}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSearch === 'BANKRUPTCY' && (
                    <div className="max-w-md mx-auto relative">
                      <label className="block text-gray-700 font-medium mb-2">
                        Search by Person Name
                      </label>
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={selectedCompany ? selectedCompany.Name : searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            if (selectedCompany) {
                              setSelectedCompany(null);
                            }
                          }}
                          onFocus={() => searchValue.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder="Enter Person Name"
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
                        />
                        
                        {/* Clear button */}
                        {selectedCompany && (
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {isLoadingSuggestions ? (
                              <div className="p-3 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mx-auto"></div>
                                <span className="ml-2">Loading suggestions...</span>
                              </div>
                            ) : (
                              suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionSelect(suggestion);
                                  }}
                                  className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{suggestion.Name}</div>
                                  <div className="text-sm text-gray-500">ABN: {suggestion.Abn}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSearch === 'LAND' && (
                    <div className="max-w-md mx-auto relative">
                      <label className="block text-gray-700 font-medium mb-2">
                        Search by ABN or Person Name
                      </label>
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={selectedCompany ? selectedCompany.Name : searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            if (selectedCompany) {
                              setSelectedCompany(null);
                            }
                          }}
                          onFocus={() => searchValue.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder="Enter ABN or Person Name"
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none"
                        />
                        
                        {/* Clear button */}
                        {selectedCompany && (
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {isLoadingSuggestions ? (
                              <div className="p-3 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto"></div>
                                <span className="ml-2">Loading suggestions...</span>
                              </div>
                            ) : (
                              suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionSelect(suggestion);
                                  }}
                                  className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{suggestion.Name}</div>
                                  <div className="text-sm text-gray-500">ABN: {suggestion.Abn}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Checkbox Options - Show when company is selected */}
              {selectedCompany && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-credion-charcoal">Select Additional Searches</h3>
                    <button
                      onClick={selectedOptions.length === getAvailableOptions().length ? handleDeselectAll : handleSelectAll}
                      className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors duration-200"
                    >
                      {selectedOptions.length === getAvailableOptions().length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getAvailableOptions().map((option, index) => (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option)}
                          onChange={(e) => handleOptionChange(option, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                  
                  {selectedOptions.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Selected Searches:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedOptions.map((option, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Floating Payment Button */}
          {selectedCompany && selectedOptions.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <button className="bg-credion-red hover:bg-credion-red-dark text-white font-bold py-4 px-8 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <span>Pay ${calculateTotal()}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;