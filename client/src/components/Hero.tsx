import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import carImagePath from "@assets/WhatsApp Image 2025-07-03 at 12.35.56_e243c439_1751526411605.jpg";

export default function Hero() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white min-h-[80vh] overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* Car image */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-0">
        <img 
          src={carImagePath} 
          alt="Luxury Orange Sports Car" 
          className="h-[500px] w-auto object-contain opacity-90"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Get your dream<br />
            <span className="text-white">Car</span>
          </h1>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm text-gray-300">New Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1L+</div>
              <div className="text-sm text-gray-300">Customers</div>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative bg-white rounded-lg p-2 max-w-md mb-8">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 flex-1"
              />
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-md transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
}