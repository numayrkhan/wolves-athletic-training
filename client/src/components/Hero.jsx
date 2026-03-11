// in client/src/components/Hero.jsx

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const images = [
  "/images/Athletic Growth.jpeg",
  "/images/hero.jpeg",
  "/images/training3.jpeg",
];

const Hero = () => {
  // We use useRef to get direct references to our DOM elements
  const heroRef = useRef(null);
  const imageRefs = useRef([]);
  imageRefs.current = []; // Reset on every render

  // This function adds each image element to our refs array
  const addToRefs = (el) => {
    if (el && !imageRefs.current.includes(el)) {
      imageRefs.current.push(el);
    }
  };

  useEffect(() => {
    // This is where the GSAP magic happens. It runs only ONCE.
    const images = imageRefs.current;

    // Set initial properties for all images
    gsap.set(images, { autoAlpha: 0, scale: 1.05 }); // Start slightly zoomed in and invisible

    // Create a GSAP Timeline for a continuous loop
    const tl = gsap.timeline({
      repeat: -1, // -1 means repeat infinitely
    });

    // Loop through each image and add its animation to the timeline
    images.forEach((image) => {
      tl
        // Fade in the image and scale it down to normal size over 2 seconds
        .to(image, {
          autoAlpha: 1,
          scale: 1,
          duration: 2,
          ease: "power2.inOut",
        })
        // Wait for 4 seconds while the image is visible
        .to(image, { duration: 4 }, "+=0")
        // Fade out the image over 2 seconds
        .to(image, { autoAlpha: 0, duration: 2, ease: "power2.inOut" });
    });

    // Set the first image to be visible immediately
    gsap.set(images[0], { autoAlpha: 1, scale: 1 });

    // Cleanup function to kill the animation when the component unmounts
    return () => {
      tl.kill();
    };
  }, []); // Empty dependency array means this effect runs only once

  return (
    <div className="hero" ref={heroRef}>
      {images.map((src) => (
        <img
          key={src}
          src={src}
          // --- SEO UPDATE: More descriptive alt text ---
          alt="Wolves Athletic Training session with a soccer player"
          ref={addToRefs}
        />
      ))}
    </div>
  );
};

export default Hero;
