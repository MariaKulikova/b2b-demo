import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const BookTestDrivePage = () => {
  const [searchParams] = useSearchParams();
  const carInfo = searchParams.get('car');

  // Скрываем footer и voice assistant на всех разрешениях
  useEffect(() => {
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
  }, []);

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header - с ограничением ширины */}
      <div className="flex-none px-2 md:px-6 lg:px-8 py-2 md:py-4 bg-gray-50 max-w-7xl mx-auto w-full">
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm md:text-base mb-2 md:mb-4">
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Back to Cars
        </Link>
        <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          Book a Test Drive
        </h1>
        {carInfo && (
          <p className="text-sm md:text-lg text-gray-600">
            Selected car: <span className="font-semibold text-blue-600">{carInfo}</span>
          </p>
        )}
      </div>

      {/* Iframe container - full width без ограничений */}
      <div className="flex-1 w-full min-h-0">
        <iframe
          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ39juNzZ8J8mt60BefJ8-bPwf416OF2Agqt_Pn9C-1NAnt8O5_wsmt0o87wKuSThL94bXGx3_Zq?gv=true"
          style={{ border: 0 }}
          width="100%"
          height="100%"
          title="Book Test Drive Calendar"
        />
      </div>
    </div>
  );
};

export default BookTestDrivePage;
