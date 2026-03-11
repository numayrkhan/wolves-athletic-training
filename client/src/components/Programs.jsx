// in client/src/components/Programs.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";

// Let's store the data for our programs in an array of objects
const programsData = [
  {
    id: "program1",
    title: "Detailed Skill Instructions",
    // --- SEO UPDATE: Enriched text with related keywords ---
    details:
      "Elevate your game with meticulous tutorials on essential skills. We provide in-depth breakdowns of shooting mechanics, first touch control, passing accuracy, and defensive positioning to improve your overall field awareness.",
  },
  {
    id: "program2",
    title: "Competitive Drills",
    // --- SEO UPDATE: Enriched text with related keywords ---
    details:
      "Sharpen your skills with dynamic, competitive drills that simulate real-game scenarios. Our exercises are designed to improve your agility, game intelligence, and decision-making under pressure, making practice feel like play.",
  },
  {
    id: "program3",
    title: "Group & Individual Sessions",
    // --- SEO UPDATE: Enriched text with related keywords ---
    details: (
      <>
        Tailor your learning experience with flexible training options. Join
        group sessions for healthy competition or opt for
        <Link to="/services" style={{ color: "var(--secondary-color)" }}>
          {" "}
          personalized one-on-one coaching
        </Link>
        , allowing you to focus on specific areas of growth.
      </>
    ),
  },
  {
    id: "program4",
    title: "Film Breakdown",
    // --- SEO UPDATE: Enriched text with related keywords ---
    details:
      "Uncover secrets to success by delving into comprehensive video analysis. Our meticulous film breakdowns offer invaluable insights into tactical analysis and positional play, helping you understand the game at a deeper level for rapid performance improvement.",
  },
];

const Programs = () => {
  // 1. We use useState to track the ID of the currently expanded program.
  // We initialize it to null, meaning nothing is expanded at first.
  const [expandedId, setExpandedId] = useState(null);

  // 2. This function will be called when a program is clicked.
  const handleProgramClick = (id) => {
    // If the clicked program is already expanded, close it by setting state to null.
    // Otherwise, expand the new program by setting its ID in the state.
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="programs">
      <h2 className="training-programs">
        TRAINING PROGRAMS DESIGNED FOR <br />
        LONG-TERM GROWTH
      </h2>

      <div className="programs-container">
        {programsData.map((program) => (
          // 3. We pass the necessary data and functions down to each program item.
          <div
            key={program.id}
            id={program.id}
            // 4. We conditionally set the className based on the state.
            // Your existing CSS for `.expanded` will now work automatically.
            className={`training-program ${
              expandedId === program.id ? "expanded" : ""
            }`}
            onClick={() => handleProgramClick(program.id)}
          >
            <h4 className="training-program-title">{program.title}</h4>
            <div className="training-program-content">
              <div className="details">{program.details}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Programs;
