import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Founder = () => {
  return (
    <div className="founder">
      {/* --- SEO UPDATE: Optimized alt text for founder's image --- */}
      <img
        src="/images/Alex.jpg"
        alt="Alex Lobos, founder and head coach of Wolves Athletic Training"
      />
      <div className="bio">
        <h1 id="founder-name">ALEX LOBOS</h1>
        <h2 id="founder-title">FOUNDER AND HEAD COACH</h2>
        <ul>
          <li>Top Real Central NJS scorer</li>
          <li>All-Time Top Defender in the State</li>
          <li>Veteran Former Red Bulls Coach</li>
        </ul>
        <p id="founder-description">
          As a former professional soccer player with a rich history in the
          sport, Alex is the driving force behind Wolves Athletic Training. With
          a passion for nurturing talent and a commitment to excellence, Alex
          brings his expertise to every training session, ensuring athletes
          reach their full potential.
        </p>
        <Link to="/services">
          <button type="button" id="train">
            TRAIN WITH ALEX
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Founder;
