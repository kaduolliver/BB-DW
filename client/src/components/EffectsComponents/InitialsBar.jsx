export default function InitialsBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="left-0 w-full h-24 bg-black flex items-center justify-center shadow-inner">
      <button onClick={scrollToTop} className="focus:outline-none">
        <p className="text-5xl relative text-white left-10" style={{ fontFamily: 'Bodoni FLF' }}> I&L</p>
      </button>
    </div>
  );
}
