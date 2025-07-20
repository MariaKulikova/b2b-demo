import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Contact form submission:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to find your perfect car? Get in touch with our team today. 
            We're here to help you every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="How can we help you?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your car needs, questions, or how we can assist you..."
                    rows={5}
                    required
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!formData.name || !formData.email || !formData.message}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+31201234567" className="text-blue-600 hover:text-blue-800">
                      +31 20 123 4567
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:info@coolcars.nl" className="text-blue-600 hover:text-blue-800">
                      info@coolcars.nl
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <div className="text-gray-600 text-sm">
                      <p>Monday - Friday: 9:00 - 18:00</p>
                      <p>Saturday: 9:00 - 17:00</p>
                      <p>Sunday: 11:00 - 16:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-start space-x-3 mb-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Amsterdam North Showroom</h3>
                      <p className="text-gray-600">
                        Noordhollandstraat 123<br />
                        1081 Amsterdam<br />
                        Netherlands
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://maps.google.com/?q=Noordhollandstraat+123+Amsterdam', '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Amsterdam South Showroom</h3>
                      <p className="text-gray-600">
                        Zuiderpark 456<br />
                        1077 Amsterdam<br />
                        Netherlands
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://maps.google.com/?q=Zuiderpark+456+Amsterdam', '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = 'tel:+31201234567'}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    const message = "Hi! I'd like to know more about your cars.";
                    const whatsappUrl = `https://wa.me/31201234567?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

