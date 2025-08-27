import mensWear from '@/app/assets/mens-wear.jpg';
import womensWear from '@/app/assets/womens-wear.jpg';
import streetwear from '@/app/assets/streetwear.jpg';
import Image from 'next/image';

const ProductGrid = () => {
  const products = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image: [mensWear, womensWear, streetwear][index % 3],
    title: "TAHVO Womens Slim Fit Casual Shirt",
    price: "1000$"
  }));

  return (
    <section className="py-8 bg-[#1a1414] relative">
      {/* Clear top spacing */}
      
      {/* Product Grid */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Clear bottom spacing */}
      <div className="h-16"></div>
    </section>
  );
};

const ProductCard = ({ image, title, price }) => {
  return (
    <div className="cursor-pointer group">
      <div className="relative overflow-hidden">
        <Image
          src={image}
          alt={title}
          className="w-full h-[374px] object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-2xl font-bold text-white">
          {price}
        </p>
      </div>
    </div>
  );
};

export default ProductGrid;