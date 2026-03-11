// in client/src/pages/HomePage.jsx

import React from "react";
import { Helmet } from "react-helmet-async";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Programs from "../components/Programs";
import Consultation from "../components/Consultation";
import Founder from "../components/Founder";

const HomePage = () => {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Wolves Athletic Training",
    description:
      "Elite 1-on-1 soccer training for dedicated athletes in Central New Jersey.",
    telephone: "+1-609-999-2034",
    email: "wolfathletic@contact.com",
    image: "https://your-live-domain.com/Logo.jpg", // Remember to replace this with your live domain later
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Mercer County",
      },
      {
        "@type": "AdministrativeArea",
        name: "Middlesex County",
      },
    ],
    founder: {
      "@type": "Person",
      name: "Alex Lobos",
    },
  };
  return (
    <div>
      {/* --- SEO UPDATE: Added unique Title and Meta Description for the Homepage --- */}
      <Helmet>
        <title>
          Wolves Athletic Training | Elite 1-on-1 Soccer Coaching in NJ
        </title>
        <meta
          name="description"
          content="Elevate your game with elite 1-on-1 soccer training from former pro Alex Lobos. Serving dedicated athletes in Mercer County, Middlesex County, princeton and surrounding New Jersey areas."
        />
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <Hero />
      <Stats />
      <Programs />
      <Consultation />
      <Founder />
    </div>
  );
};

export default HomePage;
