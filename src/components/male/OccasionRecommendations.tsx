import Link from 'next/link';
import FlowingMenu from '@/components/male/FlowingMenu';
import './FlowingMenu.css';
import glowUp from "@/assets/occasions/glow-up.jpg";
import campusFit from "@/assets/occasions/campus.jpg";
import dateChill from "@/assets/occasions/date.jpg";
import shaadi from "@/assets/occasions/shaadi.jpg";
import festive from "@/assets/occasions/festive.jpg";
import vacay from "@/assets/occasions/vacay.jpg";
import demo from '@/app/assets/hero-person.jpg'

const OccasionRecommendations = () => {
  const occasions = [
    "GLOW UP VIBES",
    "Campus or work Fit", 
    "Date & Chill",
    "Shaadi Scenes",
    "Festive Feels",
    "Vacay Mood"
  ];

  const menuItems = occasions.map(occasion => ({
    link: "/explore",
    text: occasion,
    image: demo // You can add images later if needed
  }));

  return (
    <section className="py-1 bg-[#1a1414] relative min-h-screen">
      {/* Clear top spacing */}
      
      {/* Full Screen Animated Title */}
      <div className="w-full overflow-hidden mb-4">
        <div className="marquee whitespace-nowrap">
          <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mx-8">
            OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION
          </span>
        </div>
      </div>
      
      {/* Content Section - Full Width with Flowing Menu */}
      <div className="w-full h-[80vh]">
        <FlowingMenu items={menuItems} />
      </div>
      
      {/* Clear bottom spacing */}
    </section>
  );
};

export default OccasionRecommendations;