import ScreenOverlay from "../components/EffectsComponents/ScreenOverlay";
import LoginAndRegister from "../components/UserComponents/LoginUser";

export default function AuthPage() {
  return (
    <>
      <ScreenOverlay />
      {/* <Navbar /> */}
      <div
        className="pt-20 bg-cover bg-center bg-fixed bg-black animate-fade-in delay-[500ms] min-h-screen"
        style={{ backgroundImage: "url('/images/bg-login.jpg')" }}>
        <div className="max-w-lg mx-auto flex flex-col justify-center px-4">
          <LoginAndRegister />
        </div>
      </div>
    </>
  );
}