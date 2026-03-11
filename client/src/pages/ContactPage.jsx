import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import ReactGA from "react-ga4";
import "./ContactPage.css"; // We'll create this CSS file next

// A reusable component for the FAQ items
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <span className="faq-icon">{isOpen ? "-" : "+"}</span>
      </button>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

const ContactPage = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/contact`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      // --- ADD THIS LINE FOR EVENT TRACKING ---
      ReactGA.event({
        category: "Engagement",
        action: "Submit_Contact_Form",
        label: "Contact Inquiry",
      });

      alert("Thank you for your message! We will get back to you shortly.");
      e.target.reset();
    } catch (error) {
      console.error(error);
      alert(
        "Sorry, there was an error sending your message. Please try again later."
      );
    }
  };

  // Your FAQ content
  const faqs = [
    {
      question: "What age groups do you train?",
      answer:
        "We train athletes of all ages, from youth players just starting out (ages 5+) to high school, college, and semi-professional athletes looking to refine their skills.",
    },
    {
      question: "What is your service area?",
      answer:
        "Our coaches travel to you within Mercer, Middlesex, and surrounding counties in New Jersey. If you're unsure if you're in our service area, please fill out the form!",
    },
    {
      question: "What are your rates?",
      answer:
        "Our rates vary based on the number of sessions booked. We offer discounted pricing for packages. You can find detailed information and book sessions directly on our Services page.",
    },
    {
      question: "What should my child bring to a training session?",
      answer:
        "Please ensure your child comes prepared with soccer cleats, shin guards, a water bottle, and an age-appropriate soccer ball. Most importantly, bring a positive attitude and a willingness to learn!",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => {
      return {
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            typeof faq.answer === "string"
              ? faq.answer
              : "Please see our Services page for detailed pricing.", // Handle the link component
        },
      };
    }),
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Wolves Athletic Training</title>
        <meta
          name="description"
          content="Have questions about our New Jersey soccer training programs? Contact Wolves Athletic Training today to get in touch with our coaches."
        />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="contact-title-banner">
        <h1>Get in Touch</h1>
      </div>
      <div className="contact-page-container">
        <div className="contact-header">
          <p>
            Have questions about our programs or need help with booking? We're
            here to help.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-form-section">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" required>
                  <option value="">Please select a reason...</option>
                  <option value="Booking Inquiry">Booking Inquiry</option>
                  <option value="Program Question">
                    Question about Programs
                  </option>
                  <option value="Service Area Request">
                    Service Area Request
                  </option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-info-section">
            <div className="info-box">
              <h4>Contact Information</h4>
              <p>
                <strong>Email:</strong> wolfathletic@contact.com
              </p>
              <p>
                <strong>Phone:</strong> (609) 999-2034
              </p>
            </div>
            <div className="info-box">
              <h4>Business Hours</h4>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday - Sunday: 10:00 AM - 4:00 PM</p>
              <p>We typically respond within 24 hours.</p>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ContactPage;
