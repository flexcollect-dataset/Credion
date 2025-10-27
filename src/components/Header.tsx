import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, CreditCard } from 'lucide-react';
import { apiService } from '../services/api';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/');
    }
  };

  const navigation = [
    { name: 'Product', href: '/product' },
    { name: 'Monitoring', href: '/search' },
    { name: 'Resources', href: '/resources' },
    { name: 'API', href: '/api' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-16 py-6 flex justify-between items-center shadow-sm sticky top-0 z-50">
            {/* Logo */}
            <Link to={user ? "/matter-selection" : "/"} className="flex items-center space-x-3">
        <div className="w-10 h-10">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="#e53935"></polygon>
            <polygon points="35,35 50,27 50,73 35,65" fill="#ffffff"></polygon>
            <path d="M 65,35 L 80,43 L 80,57 L 65,65 Z" fill="#ffffff"></path>
            <path d="M 58,40 Q 68,50 58,60 L 58,50 Z" fill="#e53935"></path>
          </svg>
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">credion</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-10">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`text-sm font-medium transition-colors duration-300 ${
              location.pathname === item.href
                ? 'text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-5">
              {user ? (
                <>
                  <Link
                    to="/my-matters"
                    className="text-gray-600 text-sm font-medium hover:text-red-600 transition-colors duration-300"
                  >
                    My Matters
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-600 text-sm font-medium hover:text-red-600 transition-colors duration-300"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 text-sm font-medium hover:text-red-600 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 text-sm font-medium hover:text-red-600 transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
          <div className="py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-red-600 bg-gray-50'
                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 py-2 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/search"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center"
                  >
                    Search Reports
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;