import React, { useState, useEffect } from 'react';
import '../../../assets/compeLearn/styles/modules/dashboard-module/Carousel.css';

const Carousel = () => {
  const images = [
    // 'images/welcomebanner.png',
    // 'images/carouselImages/CarouselImage1.jpg',
    // 'images/carouselImages/CarouselImage2.jpg',
    // 'images/carouselImages/CarouselImage3.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const changeSlide = (nextIndex) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setIsFading(false);
    }, 500);
  };

  const goToNext = () => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    changeSlide(nextIndex);
  };

  const goToPrev = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    changeSlide(prevIndex);
  };

  useEffect(() => {
    if (images.length > 1){
      const interval = setInterval(goToNext, 8000);
      return () => clearInterval(interval);
    }

  }, [currentIndex]);

  return (
    <div className="carousel">
      {images.length > 1 &&
      <button className="carousel-button left" onClick={goToPrev}>
        ‹
      </button>
      }
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className={`carousel-image ${isFading ? 'fade-out' : ''}`}
      />
      {images.length > 1 &&
      <button className="carousel-button right" onClick={goToNext}>
        ›
      </button>
      }
    </div>
  );
};

export default Carousel;
