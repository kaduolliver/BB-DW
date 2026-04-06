export default function LogoBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="left-0 w-full h-24 bg-black flex items-center justify-center shadow-inner">
      <button onClick={scrollToTop} className="focus:outline-none">
        <img
          src="/images/I&L-logo.webp"
          alt="Logo"
          className="h-20 object-contain cursor-pointer"
        />
      </button>
    </div>
  );
}
