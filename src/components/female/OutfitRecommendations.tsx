import mensWear from '@/app/assets/mens-wear.jpg';
import womensWear from '@/app/assets/womens-wear.jpg';
import streetwear from '@/app/assets/streetwear.jpg';
import Image from 'next/image';

const OutfitRecommendations = () => {
  const recommendations = [
    {
      id: 1,
      image: mensWear,
      label: "Men's Shirts",
      caption: "Discover our latest Men Shirts collection",
      featured: false
    },
    {
      id: 2,
      image: womensWear,
      label: "Men's Ethnic wear",
      caption: "Discover our latest Men's ethnic wear collection",
      featured: true
    },
    {
      id: 3,
      image: streetwear,
      label: "Men's Bottomwears",
      caption: "Discover our latest women jacket collection",
      featured: false
    },
    {
      id: 4,
      image: mensWear,
      label: "Men's T-shirts",
      caption: "Discover our latest Men's T-shirt collection",
      featured: false
    },
    {
      id: 5,
      image: womensWear,
      label: "Men's Jackets",
      caption: "Discover our latest women jacket collection",
      featured: false
    }
  ];

  return (
    <section className="py-0.5 bg-[#1a1414] relative">
      {/* Clear top spacing */}
      
      {/* Full Screen Animated Title */}
      <div className="w-full overflow-hidden pb-4">
        <div className="marquee whitespace-nowrap">
          <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mx-8">
            OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS | OUTFIT BASED RECOMMENDATIONS
          </span>
        </div>
      </div>
      
      {/* Content Section - Responsive Grid Layout */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className=" hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Two standard cards stacked */}
            <div className="flex flex-col gap-6">
              <RecommendationCard {...recommendations[0]} />
              <RecommendationCard {...recommendations[3]} />
            </div>
            
            {/* Column 2: One tall featured card */}
            <div className="flex h-full w-full">
              <RecommendationCard {...recommendations[1]} />
            </div>
            
            {/* Column 3: Two standard cards stacked */}
            <div className="flex flex-col gap-6">
              <RecommendationCard {...recommendations[2]} />
              <RecommendationCard {...recommendations[4]} />
            </div>
          </div>
           <div className="grid md:hidden grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Column 1: Two stacked cards */}
            <div className="flex h-full md:w-full col-span-1 md:col-span-1">
              <RecommendationCard {...recommendations[1]} />
            </div>

            <div className="flex  flex-col h-[623px] gap-8 md:gap-6">
              <RecommendationCard {...recommendations[0]} />
              <RecommendationCard {...recommendations[3]} />
            </div>

            {/* Column 3 (mobile: full width stacked) */}
          <div className="col-span-2  grid grid-cols-2 gap-4 md:gap-6">
  <RecommendationCard {...recommendations[2]} />
  <RecommendationCard {...recommendations[4]} />
</div>
          </div>
          
          {/* Extra Ethnic Wear Block - Full Width */}
          <div className="mt-6">
            <div className="relative group overflow-hidden border border-white/10 bg-black/10 shadow-lg cursor-pointer h-[300px] md:h-[400px]">
              <Image
                src={womensWear}
                alt="Ethnic wear collection"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-95"
              />
              
              {/* Readability overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
              
              {/* Content overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                {/* Category pill */}
                <div className="inline-block rounded-full bg-white text-gray-900 text-xs font-semibold px-3 py-1 shadow">
                  Ethnic wear
                </div>
                
                {/* Headline/description */}
                <p className="mt-3 text-white text-xl md:text-2xl font-semibold leading-snug max-w-[22ch]">
                  Discover our latest women Ethnic wear collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacing to next section */}
      <div className="mt-10 md:mt-12 lg:mt-14"></div>
    </section>
  );
};

const RecommendationCard = ({ image, label, caption, featured }) => {
  return (
    <div className={`relative group overflow-hidden border border-white/10 bg-black/10 shadow-lg cursor-pointer ${
      featured ? 'h-[624px] w-[408px]' : 'h-[300px]'
    }`}>
      <Image
        src={image}
        alt={caption}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-95"
      />
      
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
      
      {/* Content overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        {/* Category pill */}
        <div className="inline-block rounded-full bg-white text-gray-900 text-xs font-semibold px-3 py-1 shadow">
          {label}
        </div>
        
        {/* Headline/description */}
        <p className="mt-3 text-white text-xl md:text-2xl font-semibold leading-snug max-w-[22ch]">
          {caption}
        </p>
      </div>
    </div>
  );
};

export default OutfitRecommendations;