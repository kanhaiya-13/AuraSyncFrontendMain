import Link from 'next/link';
import FlowingMenu from '@/components/male/FlowingMenu';
import './FlowingMenu.css';

import glowUp from "@/app/assets/Occasion/Glow up vibes.png";
import campusFit from "@/app/assets/Occasion/Campys and work fit.png";
import dateChill from "@/app/assets/Occasion/Date night.png";
import shaadi from "@/app/assets/Occasion/Shaadi scenes.png";
import festive from "@/app/assets/Occasion/Festive feels.png";
import vacay from "@/app/assets/Occasion/Vevay mood.png";

const OccasionRecommendations = () => {
  const menuItems = [
    { link: "/explore", text: "GLOW UP VIBES", image: glowUp },
    { link: "/explore", text: "Campus or Work Fit", image: campusFit },
    { link: "/explore", text: "Date & Chill", image: dateChill },
    { link: "/explore", text: "Shaadi Scenes", image: shaadi },
    { link: "/explore", text: "Festive Feels", image: festive },
    { link: "/explore", text: "Vacay Mood", image: vacay },
  ];

  return (
    <section className="py-1 bg-[#1a1414] relative min-h-screen">
      {/* Full Screen Animated Title */}
      <div className="w-full overflow-hidden mb-4">
        <div className="marquee whitespace-nowrap">
          <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mx-8">
            OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION | OCCASION BASED RECOMMENDATION
          </span>
        </div>
      </div>

      {/* Flowing Menu */}
      <div className="w-full h-[80vh]">
        <FlowingMenu items={menuItems} />
      </div>
    </section>
  );
};

export default OccasionRecommendations;
