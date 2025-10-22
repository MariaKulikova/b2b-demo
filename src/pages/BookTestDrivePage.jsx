import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const BookTestDrivePage = () => {
  const [searchParams] = useSearchParams();
  const carInfo = searchParams.get('car');

  // На мобильных скрываем footer и voice assistant при монтировании
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Скрываем все элементы кроме основного контента
      const footer = document.querySelector('footer');
      const voiceButton = document.querySelector('button[class*="fixed"]');
      const voicePanel = document.querySelector('div[class*="fixed"][class*="inset"]');

      if (footer) footer.style.display = 'none';
      if (voiceButton) voiceButton.style.display = 'none';
      if (voicePanel) voicePanel.style.display = 'none';

      // Cleanup при размонтировании
      return () => {
        if (footer) footer.style.display = '';
        if (voiceButton) voiceButton.style.display = '';
        if (voicePanel) voicePanel.style.display = '';
      };
    }
  }, []);

  return (
    <>
      {/* Mobile: Full screen layout */}
      <div className="md:hidden flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Compact header */}
        <div className="flex-none px-2 py-2 bg-gray-50">
          <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-1">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Cars
          </Link>
          <h1 className="text-base font-bold text-gray-900">
            Book a Test Drive
          </h1>
        </div>

        {/* Iframe container - takes remaining space */}
        <div className="flex-1 px-2 pb-2 overflow-hidden">
          <div className="bg-white rounded-lg shadow-lg h-full p-1">
            <iframe
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ39juNzZ8J8mt60BefJ8-bPwf416OF2Agqt_Pn9C-1NAnt8O5_wsmt0o87wKuSThL94bXGx3_Zq?gv=true"
              style={{ border: 0 }}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Book Test Drive Calendar"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Desktop: Normal layout */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {/* Back Button */}
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cars
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Book a Test Drive
          </h1>
          {carInfo && (
            <p className="text-xl text-gray-600">
              Selected car: <span className="font-semibold text-blue-600">{carInfo}</span>
            </p>
          )}
          <p className="text-base text-gray-600 mt-2">
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

          {/* Contact Information - скрыта на мобильных для экономии места */}
          <div className="mt-4 md:mt-8 p-4 md:p-6 bg-blue-50 rounded-lg hidden md:block">
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
    </>
  );
};

export default BookTestDrivePage;
