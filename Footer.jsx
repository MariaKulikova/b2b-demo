import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">Cool Cars</span>
            </div>
            <p className="text-gray-300 mb-4">
              Amsterdam's premier destination for quality used cars. We offer the best selection of pre-owned vehicles with guaranteed quality and service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-gray-300 hover:text-blue-400 transition-colors">
                  All Cars
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Showroom Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Locations</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-400">Amsterdam North</h4>
                <p className="text-gray-300 text-sm">
                  Noordhollandstraat 123<br />
                  1081 Amsterdam
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-400">Amsterdam South</h4>
                <p className="text-gray-300 text-sm">
                  Zuiderpark 456<br />
                  1077 Amsterdam
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">+31 20 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">info@coolcars.nl</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-blue-400 mt-1" />
                <div className="text-gray-300 text-sm">
                  <p>Mon-Fri: 9:00 - 18:00</p>
                  <p>Sat: 9:00 - 17:00</p>
                  <p>Sun: 11:00 - 16:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Cool Cars Amsterdam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

