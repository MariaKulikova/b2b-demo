import React from 'react';
import { Users, Award, Shield, Heart } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Cool Cars Amsterdam
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            For over 15 years, we've been Amsterdam's trusted partner in finding the perfect used car. 
            Our commitment to quality, transparency, and customer satisfaction sets us apart.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2009, Cool Cars Amsterdam started as a small family business with a simple mission: 
                to provide high-quality used cars with honest service and fair prices. What began as a single 
                showroom has grown into two locations serving the greater Amsterdam area.
              </p>
              <p>
                We believe that buying a car should be an exciting experience, not a stressful one. That's why 
                we've built our reputation on transparency, quality, and putting our customers first. Every 
                vehicle in our inventory undergoes rigorous inspection, and we stand behind every sale with 
                comprehensive warranties and ongoing support.
              </p>
              <p>
                Today, we're proud to be one of Amsterdam's most trusted used car dealers, having helped 
                thousands of customers find their perfect vehicle. Our team of experienced professionals 
                is dedicated to making your car buying journey smooth and enjoyable.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-10">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">Quality Guarantee</h4>
                  <p className="text-gray-600">Every car undergoes comprehensive inspection</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">15+ Years Experience</h4>
                  <p className="text-gray-600">Trusted expertise in the Amsterdam market</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">Customer First</h4>
                  <p className="text-gray-600">Your satisfaction is our top priority</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">Expert Team</h4>
                  <p className="text-gray-600">Knowledgeable staff ready to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                <p className="text-gray-600">
                  We believe in honest communication and full disclosure about every vehicle's history and condition.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p className="text-gray-600">
                  Every car meets our high standards for safety, reliability, and overall condition before sale.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Service</h3>
                <p className="text-gray-600">
                  We're committed to providing exceptional service from your first visit through years of ownership.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-md p-10 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold">Jan van der Berg</h3>
              <p className="text-blue-600">Founder & CEO</p>
              <p className="text-gray-600 text-sm mt-2">
                15+ years in automotive sales with a passion for customer service.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold">Maria Jansen</h3>
              <p className="text-blue-600">Sales Manager</p>
              <p className="text-gray-600 text-sm mt-2">
                Expert in matching customers with their perfect vehicle.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold">Peter de Vries</h3>
              <p className="text-blue-600">Service Advisor</p>
              <p className="text-gray-600 text-sm mt-2">
                Certified mechanic ensuring every car meets our quality standards.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Track Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Cars Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <div className="text-gray-600">Amsterdam Locations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

