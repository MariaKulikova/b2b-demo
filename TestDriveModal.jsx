import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

const TestDriveModal = ({ isOpen, onClose, selectedCar, cars }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    message: '',
    selectedCarId: selectedCar?.id || '',
    agreeToContact: false,
    agreeToTexts: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Test drive booking:', formData);
    alert('Thank you! We will contact you soon to confirm your test drive appointment.');
    onClose();
    setFormData({
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      message: '',
      selectedCarId: selectedCar?.id || '',
      agreeToContact: false,
      agreeToTexts: false
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book Your Test Drive</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferredDate">Preferred Date/Time</Label>
            <Input
              id="preferredDate"
              type="datetime-local"
              value={formData.preferredDate}
              onChange={(e) => handleInputChange('preferredDate', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message/Comments</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Any specific questions or requirements?"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="car-select">Select a Car</Label>
            <Select
              value={formData.selectedCarId.toString()}
              onValueChange={(value) => handleInputChange('selectedCarId', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id.toString()}>
                    {car.year} {car.make} {car.model} - €{car.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree-contact"
                checked={formData.agreeToContact}
                onCheckedChange={(checked) => handleInputChange('agreeToContact', checked)}
              />
              <Label htmlFor="agree-contact" className="text-sm">
                I agree to be contacted by the dealer
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree-texts"
                checked={formData.agreeToTexts}
                onCheckedChange={(checked) => handleInputChange('agreeToTexts', checked)}
              />
              <Label htmlFor="agree-texts" className="text-sm">
                I agree to receive text messages
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!formData.name || !formData.email || !formData.phone}
          >
            Schedule Test Drive
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TestDriveModal;

