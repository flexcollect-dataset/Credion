import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Circle, Calendar } from 'lucide-react';
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Reports ({reports.length})
            </h2>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatterReports;
