import { Link } from 'react-router-dom';
import { Mail, MapPin, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-credion-charcoal text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img 
              src="/Asset 2@4x-8.png" 
              alt="Credion" 
              className="h-8 w-auto filter brightness-0 invert"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              Redefining commercial credit reporting with the ProbR™ Score, predicting repayment likelihood, not just credit history.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/product" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  ProbR™ Score
                </Link>
              </li>
              <li>
                <Link to="/product" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Credit Reports
                </Link>
              </li>
              <li>
                <Link to="/product" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Monitoring
                </Link>
              </li>
              <li>
                <Link to="/product" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  API Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/why-credion" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Why Credion
                </Link>
              </li>
              <li>
                <Link to="/government" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Government
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-credion-red" />
                <span className="text-gray-300 text-sm">info@credion.com.au</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-credion-red" />
                <div className="text-gray-300 text-sm">
                  <div>526/368 Sussex St, Sydney NSW 2000</div>
                  <div>95 Third Street, 2nd Floor, San Francisco, California 94103</div>
                  <div>48 Warwick Street, London, Greater London W1B 5AW</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Credion™. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Credit Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;