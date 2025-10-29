import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Circle, Calendar, Download, RefreshCw, AlertTriangle, Plus } from 'lucide-react';
import { apiService } from '../services/api';

interface UserReport {
  reportId: number;
  userId: number;
  matterId: number;
  reportName: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

const MatterReports: React.FC = () => {
  const navigate = useNavigate();
  const { matterId } = useParams();
  const [matter, setMatter] = useState<any>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingReports, setDownloadingReports] = useState<Set<number>>(new Set());
  const [updatingReports, setUpdatingReports] = useState<Set<number>>(new Set());
  const [alertingReports, setAlertingReports] = useState<Set<number>>(new Set());
  const [emailingReports, setEmailingReports] = useState<Set<number>>(new Set());
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

  useEffect(() => {
    loadMatterReports();
  }, [matterId]);

  const loadMatterReports = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Load matter details
      const matterResponse = await apiService.getMatter(Number(matterId));
      if (matterResponse.success) {
        setMatter(matterResponse.matter);
      }

      // Load reports for this matter
      const reportsResponse = await apiService.getUserReportsByMatter(Number(matterId));
      if (reportsResponse.success) {
        setReports(reportsResponse.reports);
      } else {
        setError('Failed to load reports');
      }
    } catch (error: any) {
      console.error('Error loading matter reports:', error);
      setError(error.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadReport = async (report: UserReport) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(report.reportId));
      
      // Determine report type based on report name or other criteria
      let reportType = 'ASIC'; // Default
      if (report.reportName.includes('ASIC')) {
        reportType = 'ASIC';
      } else if (report.reportName.includes('COURT')) {
        reportType = 'COURT';
      } else if (report.reportName.includes('PPSR')) {
        reportType = 'PPSR';
      }
      
      const { blob, filename } = await apiService.generatePDF(report.reportId, reportType);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Error downloading report:', error);
      setError(error.message || 'Failed to download report');
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.reportId);
        return newSet;
      });
    }
  };

  const updateReport = async (report: UserReport) => {
    try {
      setUpdatingReports(prev => new Set(prev).add(report.reportId));
      
      // Here you would call an API to refresh/update the report
      // For now, we'll just reload the reports
      await loadMatterReports();
      
    } catch (error: any) {
      console.error('Error updating report:', error);
      setError(error.message || 'Failed to update report');
    } finally {
      setUpdatingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.reportId);
        return newSet;
      });
    }
  };

  const alertReport = async (report: UserReport) => {
    try {
      setAlertingReports(prev => new Set(prev).add(report.reportId));
      
      // Here you would call an API to set up alerts for the report
      // For now, we'll just show a success message
      alert(`Alert set up for report: ${report.reportName}`);
      
    } catch (error: any) {
      console.error('Error setting up alert:', error);
      setError(error.message || 'Failed to set up alert');
    } finally {
      setAlertingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.reportId);
        return newSet;
      });
    }
  };

  const handleEmailReport = (report: UserReport) => {
    setSelectedReport(report);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (!selectedReport) {
      alert('No report selected');
      return;
    }

    try {
      setEmailingReports(prev => new Set(prev).add(selectedReport.reportId));
      
      // Prepare single report data for email
      const reportData = [{
        reportId: selectedReport.reportId,
        reportName: selectedReport.reportName,
        type: selectedReport.reportName.includes('ASIC') ? 'ASIC' : 
              selectedReport.reportName.includes('COURT') ? 'COURT' : 
              selectedReport.reportName.includes('PPSR') ? 'PPSR' : 'ASIC'
      }];

      // Send report via email
      await apiService.sendReports(email, reportData, 0, matter?.matterName || 'Matter');
      alert(`Report sent successfully to: ${email}`);
      
      // Close modal and reset
      setShowEmailModal(false);
      setEmail('');
      setSelectedReport(null);
      
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert('Error sending report. Please try again.');
    } finally {
      setEmailingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedReport.reportId);
        return newSet;
      });
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmail('');
    setSelectedReport(null);
  };

  const handleAddNewReport = () => {
    // Navigate to search page with matter ID as a query parameter
    navigate(`/search?matterId=${matterId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-matters')}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Matters
          </button>
          {matter && (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {matter.matterName}
              </h1>
              {matter.description && (
                <p className="text-xl text-gray-600">{matter.description}</p>
              )}
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Reports List */}
        <div className="card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Reports ({reports.length})
            </h2>
            <button
              onClick={handleAddNewReport}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Report
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-600">
                This matter doesn't have any reports yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div
                  key={report.reportId}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {report.isPaid ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mr-2" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.reportName}
                        </h3>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          ID: {report.reportId}
                        </span>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                          report.isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {formatDate(report.createdAt)}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Download Button */}
                      <button
                        onClick={() => downloadReport(report)}
                        disabled={downloadingReports.has(report.reportId)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          downloadingReports.has(report.reportId)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Download Report"
                      >
                        {downloadingReports.has(report.reportId) ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>

                      {/* Update Button */}
                      <button
                        onClick={() => updateReport(report)}
                        disabled={updatingReports.has(report.reportId)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          updatingReports.has(report.reportId)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title="Update Report"
                      >
                        {updatingReports.has(report.reportId) ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>

                      {/* Email Button */}
                      <button
                        onClick={() => handleEmailReport(report)}
                        disabled={emailingReports.has(report.reportId)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          emailingReports.has(report.reportId)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Email Report"
                      >
                        {emailingReports.has(report.reportId) ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>

                      {/* Alert Button */}
                      <button
                        onClick={() => alertReport(report)}
                        disabled={alertingReports.has(report.reportId)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          alertingReports.has(report.reportId)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        }`}
                        title="Set Alert"
                      >
                        {alertingReports.has(report.reportId) ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Email Report
            </h3>
            
            {selectedReport && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Report:</p>
                <p className="font-medium text-gray-900">{selectedReport.reportName}</p>
                <p className="text-xs text-gray-500">ID: {selectedReport.reportId}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseEmailModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!email || emailingReports.has(selectedReport?.reportId || 0)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                  !email || emailingReports.has(selectedReport?.reportId || 0)
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {emailingReports.has(selectedReport?.reportId || 0) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatterReports;
