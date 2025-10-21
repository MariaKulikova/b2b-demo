import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookTestDrivePage = () => {
  const [searchParams] = useSearchParams();
  const carInfo = searchParams.get('car');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cars
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book a Test Drive
          </h1>
          {carInfo && (
            <p className="text-xl text-gray-600">
              Selected car: <span className="font-semibold text-blue-600">{carInfo}</span>
            </p>
          )}
          <p className="text-gray-600 mt-2">
            Choose a convenient time for your test drive. Our team will contact you to confirm the appointment.
          </p>
        </div>

        {/* Google Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Select Available Time
          </h2>

          <div className="flex justify-center">
            {/* Google Calendar Appointment Scheduling */}
            <iframe
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ39juNzZ8J8mt60BefJ8-bPwf416OF2Agqt_Pn9C-1NAnt8O5_wsmt0o87wKuSThL94bXGx3_Zq?gv=true"
              style={{ border: 0 }}
              width="100%"
              height="600"
              frameBorder="0"
              title="Book Test Drive Calendar"
              className="rounded-lg max-w-4xl"
            />
          </div>

          {/* Contact Information */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Phone:</strong> +44 7418 613962</p>
              <p><strong>Email:</strong> info@shiftgears.ai</p>
              <p><strong>Locations:</strong> Amsterdam North & South</p>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              After selecting a time in the calendar, our team will reach out to confirm your test drive appointment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTestDrivePage;
