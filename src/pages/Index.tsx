import { SignupForm } from "../components/SignupForm";
import desktopBg from "../assets/3f5a999addc3339bb6b32251e94ca963bdaf32ed.png";
import mobileBg from "../assets/a4e9b5ca9ccca6366e139c80ad4d28b190813d03.png";

export default function App() {
  return (
    <div className="min-h-screen relative text-white">
      {/* Background Images */}
      <div className="absolute inset-0">
        {/* Desktop Background */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${desktopBg})` }}
        ></div>
        
        {/* Mobile Background */}
        <div 
          className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${mobileBg})` }}
        ></div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-4 drop-shadow-lg" style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <span className="text-white">Celeste</span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">OS</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white font-medium drop-shadow-md" style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Macro vision, pocket sized.
          </p>
        </div>

        {/* Signup Form */}
        <SignupForm />
      </div>
    </div>
  );
}