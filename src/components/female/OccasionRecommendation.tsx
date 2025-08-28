import Link from 'next/link';
import FlowingMenu from '@/components/female/FlowingMenu';
import './FlowingMenu.css';

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
    image: undefined // You can add images later if needed
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