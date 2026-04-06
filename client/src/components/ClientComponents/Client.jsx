import { useAuth } from '../../context/authContext';
import ClientTabs from './ClientTabs';
import ClientNavbar from './ClientNavBar';
import ScreenOverlay from '../EffectsComponents/ScreenOverlay';
import SplashScreen from '../EffectsComponents/SplashScreen';
import BackgroundGrain from '../EffectsComponents/BackgroundGrain';

export default function Client() {
  const { carregando } = useAuth();

  if (carregando) return <SplashScreen />;

  return (
    <>
      <ScreenOverlay />
      <ClientNavbar />
      <div
        className="min-h-screen flex pt-40 pb-20 items-center justify-center p-6 relative"
        style={{
          backgroundColor: "rgb(10, 10, 10)",
          overflow: "hidden", 
        }}
      >
        <BackgroundGrain />
        <ClientTabs />
      </div>
    </>
  );
}