export default function App() {
  return (
    <div className="min-h-screen relative text-white bg-[#0A0A0A]">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-8" style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          <span className="text-[#EFEFF1]">Celeste</span>
          <span className="text-[#5BA3D0]">OS</span>
        </h1>
        
        {/* Subheader */}
        <p className="text-2xl md:text-3xl text-[#EFEFF1] mb-16" style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Control over your complexity.
        </p>
        
        {/* Body Content */}
        <div className="max-w-2xl space-y-8 text-[#DADDE0]" style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          <p className="text-lg md:text-xl leading-relaxed">
            Search-first engineering intelligence for yachts.
          </p>
          
          <p className="text-lg md:text-xl leading-relaxed">
            CelesteOS is operating in a private pilot.<br />
            We are not onboarding new vessels while the system<br />
            is being validated under real operating conditions.
          </p>
          
          <div className="text-lg md:text-xl leading-relaxed space-y-2">
            <p>• Used during live faults</p>
            <p>• Used during inspections</p>
            <p>• Used during handovers</p>
            <p>• Used when decisions cannot be reversed</p>
          </div>
          
          <div className="text-lg md:text-xl leading-relaxed space-y-2">
            <p>Celeste does not automate decisions.</p>
            <p>Celeste does not act without consent.</p>
            <p>Celeste does not hide state changes.</p>
          </div>
          
          <p className="text-lg md:text-xl text-center pt-8">
            Operational correspondence: contact@celeste7.ai
          </p>
        </div>
      </div>
    </div>
  );
}