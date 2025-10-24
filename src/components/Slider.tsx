import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
  {
    title: 'Find Trusted Professionals',
    subtitle: 'Plumbers, Electricians, Technicians and more',
    image: 'https://picsum.photos/id/1011/1600/900',
  },
  {
    title: 'Fast, Reliable Service',
    subtitle: 'Book and manage with ease',
    image: 'https://picsum.photos/id/1005/1600/900',
  },
  {
    title: 'Quality You Can Trust',
    subtitle: 'Reviewed by the community',
    image: 'https://picsum.photos/id/1025/1600/900',
  },
  {
    title: 'Skilled Craftsmanship',
    subtitle: 'Experienced pros for every job',
    image: 'https://picsum.photos/id/1043/1600/900',
  },
  {
    title: 'Home & Office Solutions',
    subtitle: 'From quick fixes to large projects',
    image: 'https://picsum.photos/id/1060/1600/900',
  },
];

export const Slider: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        loop
        className="h-[260px] sm:h-[340px] lg:h-[420px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={slide.image}
                alt={`${slide.title} - ${slide.subtitle}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                role="img"
                aria-label={`${slide.title} service category`}
              />
              <div className="backdrop-brightness-50 w-full h-full flex items-center justify-center">
                <div className="text-center px-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white drop-shadow">{slide.title}</h2>
                  <p className="mt-2 text-white/85 drop-shadow">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};


