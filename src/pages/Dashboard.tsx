import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-credion-charcoal mb-2">
                Welcome, {user.firstName}!
              </h1>
              <p className="text-gray-600">Access your Credion dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-credion-red transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-credion-charcoal">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                {user.mobileNumber && (
                  <p className="text-gray-600">{user.mobileNumber}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-credion-charcoal mb-2">Account Details</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Plan:</strong> {user.currentPlan || 'Not specified'}</p>
                  <p><strong>User ID:</strong> {user.userId}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-credion-charcoal mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/payment-methods" className="block text-credion-red hover:text-credion-red-dark">
                    Payment Methods
                  </Link>
                  <Link to="/contact" className="block text-credion-red hover:text-credion-red-dark">
                    Contact Support
                  </Link>
                  <Link to="/pricing" className="block text-credion-red hover:text-credion-red-dark">
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Card for Pay as you go users */}
          {(user.currentPlan === 'pay_as_you_go' || user.currentPlan === 'Pay as you go') && (
            <div className="bg-gradient-to-r from-credion-red to-credion-red-dark text-white rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Payment Methods</h2>
                  <p className="text-red-100 mb-4">
                    Manage your payment methods for Pay as you go billing
                  </p>
                </div>
                <Link 
                  to="/payment-methods" 
                  className="bg-white text-credion-red hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Manage Cards
                </Link>
              </div>
            </div>
          )}

          {/* Coming Soon Card */}
          <div className="bg-credion-charcoal text-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-300 mb-6">
              We're working on bringing you powerful credit risk assessment tools. 
              Stay tuned for updates!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/product" className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                Learn More
              </Link>
              <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-credion-charcoal font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
