import { useAuth } from "../../context/authContext";
import EmployeeNavbar from "./EmpNavBar";
import EmployeeTabs from "./EmployeeTabs";
import ScreenOverlay from "../EffectsComponents/ScreenOverlay";
import SplashScreen from "../EffectsComponents/SplashScreen";
import BackgroundGrain from "../EffectsComponents/BackgroundGrain";

export default function Employee() {

  const { carregando } = useAuth();

  if (carregando) return <SplashScreen />;

  return (
    <>
      <ScreenOverlay />
      <EmployeeNavbar />
      <div
              className="min-h-screen flex pt-40 pb-20 items-center justify-center p-6 relative"
              style={{
                backgroundColor: "rgb(10, 10, 10)",
                overflow: "hidden", 
              }}
            >
              <BackgroundGrain />
        <EmployeeTabs />
      </div>
    </>
  );
}
