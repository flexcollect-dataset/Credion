import { useState, useEffect } from 'react';
import { CreditCard, FileText, Plus, Trash2, Star, StarOff } from 'lucide-react';
import { apiService } from '../services/api';
import StripeCardElement from '../components/StripeCardElement';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
}

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<'payment-methods' | 'reports'>('payment-methods');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedDownloadType, setSelectedDownloadType] = useState<string>('');


  useEffect(() => {
    if (activeTab === 'payment-methods') {
      fetchPaymentMethods();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.paymentMethods);
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);

    } finally {
      setLoading(false);
    }
  };

  const handleStripePaymentMethod = async (paymentMethod: any) => {
    setLoading(true);
    
    try {
      // Send the Stripe payment method to our backend
      await apiService.addPaymentMethod({
        stripePaymentMethodId: paymentMethod.id,
        cardholderName: paymentMethod.billing_details.name,
        userId: JSON.parse(localStorage.getItem('user') || '{}').userId
      });
      
      setShowAddForm(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      // Add to local state when API fails
      const newMethod = {
        id: paymentMethod.id,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        expiryMonth: paymentMethod.card.exp_month,
        expiryYear: paymentMethod.card.exp_year,
        cardholderName: paymentMethod.billing_details.name,
        isDefault: paymentMethods.length === 0
      };
      setPaymentMethods(prev => [...prev, newMethod]);
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserReports();
      console.log('User Reports API response:', response);
      
      // Ensure we have an array of reports
      if (response && response.success && Array.isArray(response.reports)) {
        setReports(response.reports);
      } else {
        console.warn('Unexpected reports data format:', response);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId: number) => {
    // For now, just show an alert. In the future, this could open a modal or navigate to a detailed view
    alert(`Viewing report ${reportId}. This functionality will be implemented in the next phase.`);
  };

  const handleDownloadReport = (report: any) => {
    setSelectedReport(report);
    setSelectedDownloadType('ASIC'); // Auto-select ASIC since it's the only option
    setShowDownloadModal(true);
  };

  const handleDownloadConfirm = async () => {
    if (!selectedDownloadType) {
      alert('Please select a download type');
      return;
    }

    try {
      setLoading(true);
      
      // Generate PDF using the API
      const { blob: pdfBlob, filename } = await apiService.generatePDF(selectedReport.id, selectedDownloadType);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Use the filename from the backend
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setShowDownloadModal(false);
      setSelectedReport(null);
      setSelectedDownloadType('');
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCancel = () => {
    setShowDownloadModal(false);
    setSelectedReport(null);
    setSelectedDownloadType('');
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setLoading(true);
      try {
        await apiService.deletePaymentMethod(parseInt(id));
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        // Update local state when API fails
        setPaymentMethods(prev => prev.filter(method => method.id !== id));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    setLoading(true);
    try {
      await apiService.setDefaultPaymentMethod(parseInt(id));
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      // Update local state when API fails
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method.id === id
      })));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm border">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-credion-charcoal mb-4 sm:mb-6">Account Settings</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('payment-methods')}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors duration-200 text-sm sm:text-base ${
                    activeTab === 'payment-methods'
                      ? 'bg-credion-red text-white'
                      : 'text-credion-charcoal hover:bg-gray-100'
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="font-medium">Payment Methods</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors duration-200 text-sm sm:text-base ${
                    activeTab === 'reports'
                      ? 'bg-credion-red text-white'
                      : 'text-credion-charcoal hover:bg-gray-100'
                  }`}
                >
                  <FileText size={18} />
                  <span className="font-medium">Reports</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'payment-methods' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 sm:p-6 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-credion-charcoal">Payment Methods</h3>
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your payment methods</p>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="btn-primary flex items-center space-x-2 text-sm sm:text-base px-4 py-2"
                    >
                      <Plus size={18} />
                      <span>Add New Card</span>
                    </button>
                  </div>
                </div>

                {/* Add New Payment Method Form */}
                {showAddForm && (
                  <div className="p-4 sm:p-6 border-b bg-gray-50">
                    <h4 className="text-lg font-medium text-credion-charcoal mb-4">Add New Payment Method</h4>
                    <StripeCardElement
                      onSubmit={handleStripePaymentMethod}
                      onCancel={() => setShowAddForm(false)}
                      loading={loading}
                    />
                  </div>
                )}

                {/* Payment Methods List */}
                <div className="p-4 sm:p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-credion-red mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading payment methods...</p>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No payment methods added yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add your first payment method to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 gap-4"
                        >
                          <div className="flex items-center space-x-4 min-w-0 flex-1">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {method.brand.toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-credion-charcoal truncate">
                                **** **** **** {method.last4}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {method.cardholderName} • Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                              </p>
                              {method.isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                  <Star size={12} className="mr-1" />
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            {!method.isDefault && (
                              <button
                                onClick={() => handleSetDefault(method.id)}
                                className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                                title="Set as default"
                              >
                                <StarOff size={20} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                              title="Delete payment method"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-credion-charcoal mb-2 sm:mb-0">Reports</h3>
                    <div className="text-sm text-gray-600">
                      {(reports || []).length} {(reports || []).length === 1 ? 'report' : 'reports'} found
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-credion-red mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading reports...</p>
                    </div>
                  ) : (reports || []).length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">No Reports Available</h4>
                      <p className="text-gray-500 text-sm sm:text-base">Reports will be available here once you start using the platform.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">UUID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ABN</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(reports || []).map((report) => (
                            <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                              <td className="py-4 px-4 text-sm font-mono text-gray-600">
                                #{report.id}
                              </td>
                              <td className="py-4 px-4 text-sm font-mono text-gray-500 truncate max-w-xs">
                                {report.uuid}
                              </td>
                              <td className="py-4 px-4 text-sm font-medium text-credion-charcoal">
                                {report.abn}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  report.type === 'asic-current' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : report.type === 'asic-historical'
                                    ? 'bg-purple-100 text-purple-800'
                                    : report.type === 'court'
                                    ? 'bg-green-100 text-green-800'
                                    : report.type === 'ato'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : report.type === 'land'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : report.type === 'ppsr'
                                    ? 'bg-pink-100 text-pink-800'
                                    : report.type === 'property'
                                    ? 'bg-orange-100 text-orange-800'
                                    : report.type?.startsWith('director')
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {report.type === 'asic-current' ? 'ASIC Current' :
                                   report.type === 'asic-historical' ? 'ASIC Historical' :
                                   report.type === 'court' ? 'Court' :
                                   report.type === 'ato' ? 'ATO' :
                                   report.type === 'land' ? 'Land Title' :
                                   report.type === 'ppsr' ? 'PPSR' :
                                   report.type === 'property' ? 'Property' :
                                   report.type === 'director-ppsr' ? 'Director PPSR' :
                                   report.type === 'director-bankruptcy' ? 'Director Bankruptcy' :
                                   report.type === 'director-property' ? 'Director Property' :
                                   report.type === 'director-related' ? 'Director Related' :
                                   report.type || 'Unknown'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewReport(report.id)}
                                    className="p-2 text-gray-400 hover:text-credion-red transition-colors duration-200 rounded-lg hover:bg-red-50"
                                    title="View report details"
                                  >
                                    <FileText size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadReport(report)}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                                    title="Download report"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-credion-charcoal mb-4">
                Download Report
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Select the type of report you want to download for ABN: {selectedReport?.abn}
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="downloadType"
                    value="ASIC"
                    checked={selectedDownloadType === 'ASIC'}
                    onChange={(e) => setSelectedDownloadType(e.target.value)}
                    className="w-4 h-4 text-credion-red focus:ring-credion-red border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">ASIC</span>
                </label>
                <div className="text-xs text-gray-500 mt-2">
                  Other report types (COURT, ATO, BANKRUPTCY, LAND) will be available soon.
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleDownloadCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                 <button
                   onClick={handleDownloadConfirm}
                   disabled={loading}
                   className="px-4 py-2 text-sm font-medium text-white bg-credion-red rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loading ? 'Generating...' : 'Download'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
