import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState("");
  const [showExtendedForm, setShowExtendedForm] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    
    try {
      // Submit to Google Apps Script webhook (writes directly to Google Sheets)
      const response = await fetch('https://script.google.com/macros/s/AKfycbwI7NM-N9AwWYpvSbDMUrxGvo500zTD6f4QyWsvt2FnniintY2AcpQlVHE1j2L9QRlWOA/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: name,
          company: company,
          phone: phone,
          interests: interests,
          timestamp: new Date().toISOString(),
          source: 'Landing Page',
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          referrer: document.referrer || 'Direct',
          pageUrl: window.location.href
        })
      });
      
      if (response.ok) {
        console.log('Email successfully submitted');
        // Clear all form fields
        setEmail('');
        setName('');
        setCompany('');
        setPhone('');
        setInterests('');
        setShowExtendedForm(false);
        alert('Thank you! We\'ll be in touch soon.');
      } else {
        console.error('Failed to submit email');
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleRequestDemo = () => {
    console.log("Request demo video");
    // Handle demo request logic here
  };

  const handleScheduleCall = () => {
    window.open("https://calendly.com/contact-celeste7/30min?month=2025-09", "_blank");
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