import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropertyModal from '../components/PropertyModal';
import { apiService } from '../services/api';

interface SearchItem {
  name: string;
  abn: string;
}

interface ReceiptItem {
  name: string;
  price: number;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const matterIdFromUrl = searchParams.get('matterId');
  
  // Check if user is logged in
  const [isLoading, setIsLoading] = useState(true);
  const [currentMatter, setCurrentMatter] = useState<any>(null);
  
  // Refs for debouncing
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const matterData = localStorage.getItem('currentMatter');
    
    if (!userData) {
      // Redirect to login if not logged in
      window.location.href = '/login';
    }
    
    // If matterId is provided in URL, fetch that matter's details
    if (matterIdFromUrl) {
      const fetchMatterDetails = async () => {
        try {
          const response = await apiService.getMatter(Number(matterIdFromUrl));
          if (response.success) {
            setCurrentMatter(response.matter);
          } else {
            console.error('Failed to fetch matter details');
            // Fallback to localStorage matter
            if (matterData) {
              setCurrentMatter(JSON.parse(matterData));
            } else {
              window.location.href = '/matter-selection';
            }
          }
        } catch (error) {
          console.error('Error fetching matter details:', error);
          // Fallback to localStorage matter
          if (matterData) {
            setCurrentMatter(JSON.parse(matterData));
          } else {
            window.location.href = '/matter-selection';
          }
        }
      };
      fetchMatterDetails();
    } else if (matterData) {
      setCurrentMatter(JSON.parse(matterData));
    } else {
      // Redirect to matter selection if no matter selected
      window.location.href = '/matter-selection';
    }
    
    setIsLoading(false);
  }, [matterIdFromUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // State management
  const [selectedCategory, setSelectedCategory] = useState<'organisation' | 'individual'>('organisation');
  const [selectedOrgMainSearches, setSelectedOrgMainSearches] = useState<string[]>([]);
  const [selectedAsicTypes, setSelectedAsicTypes] = useState<string[]>([]);
  const [selectedOrgAdditionalSearches, setSelectedOrgAdditionalSearches] = useState<string[]>([]);
  const [selectedIndividualSearches, setSelectedIndividualSearches] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [organizationSelected, setOrganizationSelected] = useState(false);
  const [propertyModalCompleted, setPropertyModalCompleted] = useState(false);
  const [directorPropertyModalCompleted, setDirectorPropertyModalCompleted] = useState(false);
  const [propertyCount, setPropertyCount] = useState(2);
  const [directorPropertyCount, setDirectorPropertyCount] = useState(1);
  const [showPaymentActions, setShowPaymentActions] = useState(false);
  const [email, setEmail] = useState('');
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showDirectorPropertyModal, setShowDirectorPropertyModal] = useState(false);

  // Real ABN search results
  const [dropdownItems, setDropdownItems] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingReports, setIsProcessingReports] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  // Pricing configuration
  const orgMainPrices: Record<string, number> = {
    'asic': 50,
    'court': 60,
    'ato': 55,
    'land': 70
  };

  const asicTypePrices: Record<string, number> = {
    'current': 20,
    'historical': 25,
    'company': 30,
    'personal': 30,
    'document-search': 35
  };

  const orgAdditionalPrices: Record<string, number> = {
    'ppsr': 50,
    'courts': 75,
    'property': 100,
    'director-related': 80,
    'director-ppsr': 60,
    'director-bankruptcy': 90,
    'director-property': 110
  };

  const directorPropertyPrices: Record<number, number> = {
    0: 20,   // Summary Only
    1: 10,   // Current
    11: 110, // Past
    12: 120  // Select All
  };

  const propertySearchPrices: Record<number, number> = {
    0: 20,   // Summary Only
    2: 20,   // Current (2)
    3: 20,   // Past (2)
    4: 40    // Select All (4)
  };

  const indPrices: Record<string, number> = {
    'asic': 40,
    'bankruptcy': 50,
    'court': 60,
    'land': 70,
    'ppsr': 45
  };

  // Calculate total price and update receipt
  const calculateTotal = () => {
    let total = 0;
    const items: ReceiptItem[] = [];

    if (selectedCategory === 'organisation') {
      // Add main searches
      selectedOrgMainSearches.forEach(search => {
        const price = orgMainPrices[search] || 0;
        total += price;
        items.push({ name: search.toUpperCase(), price });
      });

      // Add ASIC type searches
      if (selectedOrgMainSearches.includes('asic')) {
        selectedAsicTypes.forEach(type => {
          const price = asicTypePrices[type] || 0;
          total += price;
          items.push({ name: `ASIC - ${type.toUpperCase()}`, price });
        });
      }

      // Add additional searches
      selectedOrgAdditionalSearches.forEach(search => {
        let price = 0;
        if (organizationSelected) {
          if (search === 'director-property' && directorPropertyModalCompleted) {
            price = directorPropertyPrices[directorPropertyCount] || 0;
          } else if (search === 'property' && propertyModalCompleted) {
            price = propertySearchPrices[propertyCount] || 0;
          } else {
            price = orgAdditionalPrices[search] || 0;
          }
        } else {
          price = orgAdditionalPrices[search] || 0;
        }
        total += price;
        items.push({ name: search.replace('-', ' ').toUpperCase(), price });
      });
    } else {
      // Individual searches
      selectedIndividualSearches.forEach(search => {
        const price = indPrices[search] || 0;
        total += price;
        items.push({ name: search.toUpperCase(), price });
      });
    }

    setReceiptItems(items);
    setTotalPrice(total);
  };

  useEffect(() => {
    calculateTotal();
  }, [
    selectedCategory,
    selectedOrgMainSearches,
    selectedAsicTypes,
    selectedOrgAdditionalSearches,
    selectedIndividualSearches,
    organizationSelected,
    propertyModalCompleted,
    directorPropertyModalCompleted,
    propertyCount,
    directorPropertyCount
  ]);

  // Handle organization selection
  const handleOrganizationSelect = (item: SearchItem) => {
    setSearchInput(item.name);
    setShowDropdown(false);
    setOrganizationSelected(true);
  };

  // Debounced search function
  const debouncedSearch = useCallback(async (value: string) => {
    if (value.length >= 3) {
      setIsSearching(true);
      try {
        console.log('Searching for:', value);
        const response = await apiService.searchABNByName(value);
        console.log('ABN search response:', response);
        
        if (response.success) {
          const formattedResults = response.results.map((result: any) => ({
            name: result.Name,
            abn: `ABN: ${result.Abn}`
          }));
          console.log('Formatted results:', formattedResults);
          setDropdownItems(formattedResults);
          setShowDropdown(true);
        } else {
          console.log('No results found');
          setDropdownItems([]);
        }
      } catch (error) {
        console.error('Error searching ABN:', error);
        setDropdownItems([]);
        // Show a simple fallback for testing
        if (value.toLowerCase().includes('test')) {
          setDropdownItems([
            { name: 'TEST COMPANY PTY LTD', abn: 'ABN: 12345678901' },
            { name: 'TEST ENTERPRISES', abn: 'ABN: 12345678902' }
          ]);
          setShowDropdown(true);
        }
      } finally {
        setIsSearching(false);
      }
    } else {
      setDropdownItems([]);
      setShowDropdown(false);
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  // Handle checkbox changes
  const handleOrgMainSearchChange = (search: string) => {
    setSelectedOrgMainSearches(prev => 
      prev.includes(search) 
        ? prev.filter(s => s !== search)
        : [...prev, search]
    );
  };

  const handleAsicTypeChange = (type: string) => {
    setSelectedAsicTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleOrgAdditionalChange = (search: string) => {
    if (search === 'property' && organizationSelected) {
      setShowPropertyModal(true);
    } else if (search === 'director-property' && organizationSelected) {
      setShowDirectorPropertyModal(true);
    } else {
      setSelectedOrgAdditionalSearches(prev => 
        prev.includes(search) 
          ? prev.filter(s => s !== search)
          : [...prev, search]
      );
    }
  };

  const handleIndividualSearchChange = (search: string) => {
    setSelectedIndividualSearches(prev => 
      prev.includes(search) 
        ? prev.filter(s => s !== search)
        : [...prev, search]
    );
  };

  // Select all functionality
  const handleSelectAllOrgMain = () => {
    const allSearches = ['asic', 'court', 'ato', 'land'];
    const allSelected = allSearches.every(search => selectedOrgMainSearches.includes(search));
    
    if (allSelected) {
      setSelectedOrgMainSearches([]);
    } else {
      setSelectedOrgMainSearches(allSearches);
    }
  };

  const handleSelectAllAsicType = () => {
    const allTypes = ['current', 'historical', 'company', 'personal', 'document-search'];
    const allSelected = allTypes.every(type => selectedAsicTypes.includes(type));
    
    if (allSelected) {
      setSelectedAsicTypes([]);
    } else {
      setSelectedAsicTypes(allTypes);
    }
  };

  const handleSelectAllOrgAdditional = () => {
    const allSearches = ['ppsr', 'property', 'director-related', 'director-property', 'director-ppsr', 'director-bankruptcy', 'courts'];
    const allSelected = allSearches.every(search => selectedOrgAdditionalSearches.includes(search));
    
    if (allSelected) {
      setSelectedOrgAdditionalSearches([]);
    } else {
      setSelectedOrgAdditionalSearches(allSearches);
    }
  };

  const handleSelectAllIndividual = () => {
    const allSearches = ['asic', 'bankruptcy', 'court', 'land', 'ppsr'];
    const allSelected = allSearches.every(search => selectedIndividualSearches.includes(search));
    
    if (allSelected) {
      setSelectedIndividualSearches([]);
    } else {
      setSelectedIndividualSearches(allSearches);
    }
  };

  // Payment handlers with real backend integration
  const handleProcessReports = async () => {
    if (!organizationSelected && selectedCategory === 'organisation') {
      alert('Please select an organization first');
      return;
    }

    if (receiptItems.length === 0) {
      alert('Please select at least one search option');
      return;
    }

    console.log('Processing reports...');
    console.log('Selected organization:', searchInput);
    console.log('Receipt items:', receiptItems);

    setIsProcessingReports(true);
    try {
      const reports = [];
      
      // Process each selected search
      for (const item of receiptItems) {
        console.log('Processing item:', item);
        
        // Determine the report type based on the item name
        let reportType = '';
        if (item.name.includes('ASIC')) {
          reportType = item.name.includes('CURRENT') ? 'asic-current' : 'asic-historical';
        } else if (item.name.includes('COURT')) {
          reportType = 'court';
        } else if (item.name.includes('ATO')) {
          reportType = 'ato';
        } else if (item.name.includes('LAND')) {
          reportType = 'land';
        } else if (item.name.includes('PPSR')) {
          reportType = 'ppsr';
        } else if (item.name.includes('PROPERTY')) {
          reportType = 'property';
        } else if (item.name.includes('DIRECTOR')) {
          if (item.name.includes('PPSR')) {
            reportType = 'director-ppsr';
          } else if (item.name.includes('BANKRUPTCY')) {
            reportType = 'director-bankruptcy';
          } else if (item.name.includes('PROPERTY')) {
            reportType = 'director-property';
          } else {
            reportType = 'director-related';
          }
        } else {
          // Default fallback
          reportType = item.name.toLowerCase().replace(/\s+/g, '-');
        }
        
        // Get the selected organization's ABN
        const selectedOrg = dropdownItems.find(org => org.name === searchInput);
        if (!selectedOrg) {
          console.log('Organization not found in dropdown items:', dropdownItems);
          throw new Error('Organization not found');
        }

        console.log('Creating report for:', selectedOrg, 'Type:', reportType);

        // Create report via backend API
        const reportData = {
          business: {
            Abn: selectedOrg.abn.replace('ABN: ', ''),
            Name: selectedOrg.name,
            isCompany: selectedCategory === 'organisation'
          },
          type: reportType,
          userId: JSON.parse(localStorage.getItem('user') || '{}').userId,
          matterId: matterIdFromUrl ? Number(matterIdFromUrl) : currentMatter?.matterId
        };

          console.log('Report data:', reportData);

          // Call backend to create report
          const report = await apiService.createReport(reportData);
          console.log('Report created:', report);
          
          reports.push({
            ...report,
            type: reportType
          });
        }

      console.log('All reports created:', reports);
      setGeneratedReports(reports);
      setShowPaymentActions(true);
    } catch (error: any) {
      console.error('Error processing reports:', error);
      alert(`Error processing reports: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsProcessingReports(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Send reports via email
      await apiService.sendReports(email, generatedReports, totalPrice);
      alert(`Reports sent successfully to: ${email}`);
      
      // Redirect back to matter reports if we came from there
      if (matterIdFromUrl) {
        navigate(`/matter-reports/${matterIdFromUrl}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending reports. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      for (const report of generatedReports) {
        if (report.type === 'ASIC') {
          const { blob, filename } = await apiService.generatePDF(report.reportId, report.type);
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      
      alert('Reports downloaded successfully!');
      
      // Redirect back to matter reports if we came from there
      if (matterIdFromUrl) {
        navigate(`/matter-reports/${matterIdFromUrl}`);
      }
    } catch (error) {
      console.error('Error downloading reports:', error);
      alert('Error downloading reports. Please try again.');
    }
  };

  // Modal completion handlers
  const handlePropertyModalComplete = (count: number, _label: string) => {
    setPropertyCount(count);
    setPropertyModalCompleted(true);
    if (!selectedOrgAdditionalSearches.includes('property')) {
      setSelectedOrgAdditionalSearches(prev => [...prev, 'property']);
    }
  };

  const handleDirectorPropertyModalComplete = (count: number, _label: string) => {
    setDirectorPropertyCount(count);
    setDirectorPropertyModalCompleted(true);
    if (!selectedOrgAdditionalSearches.includes('director-property')) {
      setSelectedOrgAdditionalSearches(prev => [...prev, 'director-property']);
    }
  };

  // Calculate actual number of reports that will be generated
  const getActualReportCount = () => {
    if (selectedCategory === 'organisation') {
      let count = 0;
      
      // Count main searches (but exclude ASIC if ASIC types are selected)
      selectedOrgMainSearches.forEach(search => {
        if (search === 'asic' && selectedAsicTypes.length > 0) {
          // Don't count generic ASIC if specific types are selected
        } else {
          count++;
        }
      });
      
      // Count ASIC types
      if (selectedOrgMainSearches.includes('asic')) {
        count += selectedAsicTypes.length;
      }
      
      // Count additional searches
      count += selectedOrgAdditionalSearches.length;
      
      return count;
    } else {
      return selectedIndividualSearches.length;
    }
  };

  // Filter dropdown items based on search input
  const filteredDropdownItems = dropdownItems.filter(item =>
    item.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pr-96">
        {/* Category Selection */}
        <div className="card">
          <h2 className="section-title">Select <span>Category</span></h2>
          <div className="category-options">
            <div className="radio-option">
              <input
                type="radio"
                id="organisation"
                name="category"
                value="organisation"
                checked={selectedCategory === 'organisation'}
                onChange={() => setSelectedCategory('organisation')}
              />
              <label htmlFor="organisation">Organisation</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="individual"
                name="category"
                value="individual"
                checked={selectedCategory === 'individual'}
                onChange={() => setSelectedCategory('individual')}
              />
              <label htmlFor="individual">Individual</label>
            </div>
          </div>
        </div>

        {/* Organisation Main Searches */}
        {selectedCategory === 'organisation' && (
          <>
            <div className="card">
              <h2 className="section-title">Select <span>Searches</span></h2>
              <div className="checkboxes-grid">
                <div className="select-all-grid-item">
                  <button className="select-all-btn" onClick={handleSelectAllOrgMain}>
                    {['asic', 'court', 'ato', 'land'].every(search => selectedOrgMainSearches.includes(search)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="asicOrg"
                    checked={selectedOrgMainSearches.includes('asic')}
                    onChange={() => handleOrgMainSearchChange('asic')}
                  />
                  <label htmlFor="asicOrg">ASIC</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="courtOrg"
                    checked={selectedOrgMainSearches.includes('court')}
                    onChange={() => handleOrgMainSearchChange('court')}
                  />
                  <label htmlFor="courtOrg">COURT</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="atoOrg"
                    checked={selectedOrgMainSearches.includes('ato')}
                    onChange={() => handleOrgMainSearchChange('ato')}
                  />
                  <label htmlFor="atoOrg">ATO</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="landOrg"
                    checked={selectedOrgMainSearches.includes('land')}
                    onChange={() => handleOrgMainSearchChange('land')}
                  />
                  <label htmlFor="landOrg">LAND TITLE</label>
                </div>
              </div>
            </div>

            {/* ASIC Type Options */}
            {selectedOrgMainSearches.includes('asic') && (
              <div className="card">
                <h2 className="section-title">Select <span>ASIC Type</span></h2>
                <div className="checkboxes-grid">
                  <div className="select-all-grid-item">
                    <button className="select-all-btn" onClick={handleSelectAllAsicType}>
                      {['current', 'historical', 'company', 'personal', 'document-search'].every(type => selectedAsicTypes.includes(type)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="checkbox-option">
                    <input
                      type="checkbox"
                      id="asicCurrent"
                      checked={selectedAsicTypes.includes('current')}
                      onChange={() => handleAsicTypeChange('current')}
                    />
                    <label htmlFor="asicCurrent">CURRENT</label>
                  </div>
                  <div className="checkbox-option">
                    <input
                      type="checkbox"
                      id="asicHistorical"
                      checked={selectedAsicTypes.includes('historical')}
                      onChange={() => handleAsicTypeChange('historical')}
                    />
                    <label htmlFor="asicHistorical">HISTORICAL</label>
                  </div>
                  <div className="checkbox-option">
                    <input
                      type="checkbox"
                      id="asicCompany"
                      checked={selectedAsicTypes.includes('company')}
                      onChange={() => handleAsicTypeChange('company')}
                    />
                    <label htmlFor="asicCompany">COMPANY</label>
                  </div>
                  <div className="checkbox-option">
                    <input
                      type="checkbox"
                      id="asicPersonal"
                      checked={selectedAsicTypes.includes('personal')}
                      onChange={() => handleAsicTypeChange('personal')}
                    />
                    <label htmlFor="asicPersonal">PERSONAL</label>
                  </div>
                  <div className="checkbox-option">
                    <input
                      type="checkbox"
                      id="asicDocumentSearch"
                      checked={selectedAsicTypes.includes('document-search')}
                      onChange={() => handleAsicTypeChange('document-search')}
                    />
                    <label htmlFor="asicDocumentSearch">ADD DOCUMENT SEARCH</label>
                  </div>
                </div>
              </div>
            )}

            {/* Organisation Search Section */}
            <div className="card">
              <h2 className="section-title">Enter <span>Search Details</span></h2>
              <div className="search-section">
                <label className="search-label">Search for Organisation (ABN/ACN)</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder={isSearching ? "Searching..." : "Type to search..."}
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onFocus={() => {
                      console.log('Input focused, showing dropdown');
                      setShowDropdown(true);
                    }}
                    onBlur={() => {
                      console.log('Input blurred, hiding dropdown in 200ms');
                      setTimeout(() => setShowDropdown(false), 200);
                    }}
                    disabled={isSearching}
                  />
                  <button
                    className="clear-btn"
                    onClick={() => {
                      setSearchInput('');
                      setDropdownItems([]);
                      setShowDropdown(false);
                    }}
                  >
                    ✕
                  </button>
                  {showDropdown && (
                    <div 
                      className="dropdown show"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredDropdownItems.map((item, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {
                            console.log('Dropdown item clicked:', item);
                            handleOrganizationSelect(item);
                          }}
                        >
                          <div className="dropdown-item-name">{item.name}</div>
                          <div className="dropdown-item-abn">{item.abn}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Organisation Additional Searches */}
            <div className="card">
              <h2 className="section-title">Select <span>Additional Searches</span></h2>
              
              {/* Info Note */}
              {organizationSelected && (
                <div className="info-note">
                  <span className="info-icon">ℹ️</span>
                  Credion has detected <strong>Directors: 2</strong> | <strong>Past directors: 7</strong> | <strong>Shareholders: 12</strong>
                </div>
              )}
              
              <div className="checkboxes-grid">
                <div className="select-all-grid-item">
                  <button className="select-all-btn" onClick={handleSelectAllOrgAdditional}>
                    {['ppsr', 'property', 'director-related', 'director-property', 'director-ppsr', 'director-bankruptcy', 'courts'].every(search => selectedOrgAdditionalSearches.includes(search)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="ppsr"
                    checked={selectedOrgAdditionalSearches.includes('ppsr')}
                    onChange={() => handleOrgAdditionalChange('ppsr')}
                  />
                  <label htmlFor="ppsr">
                    PPSR
                    {organizationSelected && <span className="availability-count">(1 available)</span>}
                  </label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="property"
                    checked={selectedOrgAdditionalSearches.includes('property')}
                    onChange={() => handleOrgAdditionalChange('property')}
                  />
                  <label htmlFor="property">
                    ABN/ACN PROPERTY TITLE
                    {organizationSelected && propertyModalCompleted && <span className="availability-count">(Summary Only)</span>}
                  </label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="directorRelated"
                    checked={selectedOrgAdditionalSearches.includes('director-related')}
                    onChange={() => handleOrgAdditionalChange('director-related')}
                  />
                  <label htmlFor="directorRelated">
                    DIRECTOR RELATED ENTITIES
                    {organizationSelected && <span className="availability-count">(2 available)</span>}
                  </label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="directorProperty"
                    checked={selectedOrgAdditionalSearches.includes('director-property')}
                    onChange={() => handleOrgAdditionalChange('director-property')}
                  />
                  <label htmlFor="directorProperty">
                    DIRECTOR PROPERTY TITLE
                    {organizationSelected && directorPropertyModalCompleted && <span className="availability-count">(Summary Only)</span>}
                  </label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="directorPPSR"
                    checked={selectedOrgAdditionalSearches.includes('director-ppsr')}
                    onChange={() => handleOrgAdditionalChange('director-ppsr')}
                  />
                  <label htmlFor="directorPPSR">
                    DIRECTOR PPSR
                    {organizationSelected && <span className="availability-count">(2 available)</span>}
                  </label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="directorBankruptcy"
                    checked={selectedOrgAdditionalSearches.includes('director-bankruptcy')}
                    onChange={() => handleOrgAdditionalChange('director-bankruptcy')}
                  />
                  <label htmlFor="directorBankruptcy">
                    DIRECTOR BANKRUPTCY
                    {organizationSelected && <span className="availability-count">(2 available)</span>}
                  </label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="courts"
                    checked={selectedOrgAdditionalSearches.includes('courts')}
                    onChange={() => handleOrgAdditionalChange('courts')}
                  />
                  <label htmlFor="courts">
                    ACN/ABN COURT FILES
                    {organizationSelected && <span className="availability-count">(1 available)</span>}
                  </label>
                </div>
              </div>

              {/* Selected Searches Display */}
              <div className="selected-section">
                <div className="selected-label">Selected Searches:</div>
                <div className="selected-tags">
                  {selectedOrgMainSearches.map(search => {
                    // If ASIC is selected but ASIC types are also selected, don't show generic ASIC
                    if (search === 'asic' && selectedAsicTypes.length > 0) {
                      return null;
                    }
                    return <span key={search} className="tag">{search.toUpperCase()}</span>;
                  })}
                  {selectedOrgMainSearches.includes('asic') && selectedAsicTypes.map(type => (
                    <span key={type} className="tag">ASIC - {type.toUpperCase()}</span>
                  ))}
                  {selectedOrgAdditionalSearches.map(search => (
                    <span key={search} className="tag">{search.replace('-', ' ').toUpperCase()}</span>
                  ))}
                </div>
                
                {/* Pay Button */}
                {!showPaymentActions && (
                  <button 
                    className="pay-button-card" 
                    onClick={handleProcessReports}
                    disabled={isProcessingReports}
                  >
                    {isProcessingReports ? 'Processing Reports...' : 'Process Reports'}
                  </button>
                )}

                {/* Email and Download Section */}
                {showPaymentActions && (
                  <div className="payment-actions">
                    <div className="action-box">
                      <h3>Send Reports via Email</h3>
                      <input
                        type="email"
                        className="email-input"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button className="action-button send-button" onClick={handleSendEmail}>
                        Send
                      </button>
                    </div>
                    <div className="action-box">
                      <h3>Download Report</h3>
                      <div className="reports-available">
                        Reports available: <span>{getActualReportCount()}</span>
                      </div>
                      <button className="action-button download-button" onClick={handleDownload}>
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Individual Searches */}
        {selectedCategory === 'individual' && (
          <>
            <div className="card">
              <h2 className="section-title">Select <span>Searches</span></h2>
              <div className="checkboxes-grid">
                <div className="select-all-grid-item">
                  <button className="select-all-btn" onClick={handleSelectAllIndividual}>
                    {['asic', 'bankruptcy', 'court', 'land', 'ppsr'].every(search => selectedIndividualSearches.includes(search)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="asic"
                    checked={selectedIndividualSearches.includes('asic')}
                    onChange={() => handleIndividualSearchChange('asic')}
                  />
                  <label htmlFor="asic">ASIC</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="bankruptcy"
                    checked={selectedIndividualSearches.includes('bankruptcy')}
                    onChange={() => handleIndividualSearchChange('bankruptcy')}
                  />
                  <label htmlFor="bankruptcy">BANKRUPTCY</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="court"
                    checked={selectedIndividualSearches.includes('court')}
                    onChange={() => handleIndividualSearchChange('court')}
                  />
                  <label htmlFor="court">COURT</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="land"
                    checked={selectedIndividualSearches.includes('land')}
                    onChange={() => handleIndividualSearchChange('land')}
                  />
                  <label htmlFor="land">LAND TITLE</label>
                </div>
                <div className="checkbox-option">
                  <input
                    type="checkbox"
                    id="ppsrInd"
                    checked={selectedIndividualSearches.includes('ppsr')}
                    onChange={() => handleIndividualSearchChange('ppsr')}
                  />
                  <label htmlFor="ppsrInd">PPSR</label>
                </div>
              </div>

              {/* Selected Searches Display */}
              <div className="selected-section">
                <div className="selected-label">Selected Searches:</div>
                <div className="selected-tags">
                  {selectedIndividualSearches.map(search => (
                    <span key={search} className="tag">{search.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Person Details Section */}
            <div className="card">
              <h2 className="section-title">Enter <span>Person Details</span></h2>
              <div className="individual-form">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" placeholder="Enter first name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Enter last name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="text" className="form-input" placeholder="DD/MM/YYYY" />
                </div>
              </div>

              {/* Pay Button */}
              {!showPaymentActions && (
                <button 
                  className="pay-button-card" 
                  onClick={handleProcessReports}
                  disabled={isProcessingReports}
                >
                  {isProcessingReports ? 'Processing Reports...' : 'Process Reports'}
                </button>
              )}

              {/* Email and Download Section */}
              {showPaymentActions && (
                <div className="payment-actions">
                  <div className="action-box">
                    <h3>Send Reports via Email</h3>
                    <input
                      type="email"
                      className="email-input"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="action-button send-button" onClick={handleSendEmail}>
                      Send
                    </button>
                  </div>
                  <div className="action-box">
                    <h3>Download Report</h3>
                    <div className="reports-available">
                      Reports available: <span>{getActualReportCount()}</span>
                    </div>
                    <button className="action-button download-button" onClick={handleDownload}>
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Receipt Sidebar */}
      <div className="receipt-sidebar">
        <div className="receipt-header">
          <h3>Your Selection</h3>
        </div>
        <div className="receipt-items">
          {receiptItems.length === 0 ? (
            <div className="receipt-empty">
              <div className="receipt-empty-icon">📋</div>
              <div className="receipt-empty-text">No reports selected</div>
              <div className="receipt-empty-subtext">Select reports to see them here</div>
            </div>
          ) : (
            receiptItems.map((item, index) => (
              <div key={index} className="receipt-item">
                <div className="receipt-item-name">{item.name}</div>
                <div className="receipt-item-price">${item.price.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
        <div className="receipt-footer">
          <div className="receipt-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Property Modals */}
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onComplete={handlePropertyModalComplete}
        type="property"
      />
      
      <PropertyModal
        isOpen={showDirectorPropertyModal}
        onClose={() => setShowDirectorPropertyModal(false)}
        onComplete={handleDirectorPropertyModalComplete}
        type="director-property"
      />
        </>
      )}
    </div>
  );
};

export default Search;
