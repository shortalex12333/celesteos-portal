import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SignupForm() {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    // Handle email submission logic here
  };

  const handleRequestDemo = () => {
    console.log("Request demo video");
    // Handle demo request logic here
  };

  const handleScheduleCall = () => {
    console.log("Schedule call");
    // Handle call scheduling logic here
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Email Input */}
      <form onSubmit={handleEmailSubmit}>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 bg-white/90 backdrop-blur-sm border-white/20 text-gray-900 placeholder:text-gray-600 focus:border-blue-500 text-center shadow-lg"
          style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        />
      </form>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleRequestDemo}
          variant="outline"
          className="flex-1 h-12 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-lg"
          style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Request Demo Video
        </Button>
        <Button
          onClick={handleScheduleCall}
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg"
          style={{ fontFamily: 'eloquia-text-semibold, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Schedule Call
        </Button>
      </div>
    </div>
  );
}