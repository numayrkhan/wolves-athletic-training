// in client/src/components/Stats.jsx

import React, { useState, useEffect, useRef } from 'react';

// A small, reusable custom hook for the count-up animation
const useCountUp = (target, duration, hasStarted) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Only start the animation if the component is in view
    if (!hasStarted) return;

    let start = 0;
    const end = target;
    // Calculate the increment step based on duration
    const incrementTime = (duration / end) * 1000;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    // Cleanup function to clear the interval
    return () => clearInterval(timer);
  }, [target, duration, hasStarted]); // Effect dependencies

  return count;
};

const Stats = () => {
  // This state will track if the component has been seen yet
  const [isIntersecting, setIsIntersecting] = useState(false);

  // useRef gets a reference to the actual DOM element
  const statsRef = useRef(null);

  // Set up the IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is 50% in view, update the state
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target); // Stop observing once it's seen
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    // Disconnect the observer when the component unmounts
    return () => observer.disconnect();
  }, []);

  // Use our custom hook for each number
  const athletesTrained = useCountUp(100, 2, isIntersecting);
  const yearsExperience = useCountUp(10, 1, isIntersecting);
  const proAthletes = useCountUp(10, 1.2, isIntersecting);

  return (
    // We attach the ref to this section element
    <section className="athletes-trained-section" ref={statsRef}>
      <div className="athlete-count">
        <p className="athleteCountNumber">{athletesTrained} +</p>
        <h2 className="athlete-count-label">Athletes Trained</h2>
      </div>
      <div className="years-experience">
        <p className="yearsExperienceNumber">{yearsExperience} +</p>
        <h2 className="years-experience-label">Years of Experience</h2>
      </div>
      <div className="pro-college-athletes">
        <p className="proCollegeAthletesNumber">{proAthletes} +</p>
        <h2 className="pro-college-athletes-label">
          Pro/College Athletes Trained
        </h2>
      </div>
    </section>
  );
};

export default Stats;