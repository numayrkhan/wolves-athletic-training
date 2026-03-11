// in client/src/components/Consultation.jsx

import React, { useState } from "react";
import ReactGA from "react-ga4";

const Consultation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- NEW: State to manage the form submission status ---
  const [submissionStatus, setSubmissionStatus] = useState({
    isSubmitting: false,
    message: "",
  });

  const openModal = () => {
    ReactGA.event({
      category: "Engagement",
      action: "Click_Free_Consultation",
      label: "Homepage Consultation CTA",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubmissionStatus({ isSubmitting: false, message: "" }); // Reset status on close
  };

  // --- NEW: Handler for submitting the form to your backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus({ isSubmitting: true, message: "" });

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    // Add a subject to distinguish this from a general contact inquiry
    data.subject = "Free Consultation Request";

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/contact`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send request.");
      }

      setSubmissionStatus({
        isSubmitting: false,
        message:
          "Thank you! Your request has been sent. We will contact you shortly.",
      });
      e.target.reset();
    } catch (error) {
      console.error(error);
      setSubmissionStatus({
        isSubmitting: false,
        message: "Sorry, there was an error. Please try again later.",
      });
    }
  };

  return (
    <>
      <div className="consultation">
        <video width="460" height="420" controls>
          {/* Make sure Video_Generation_with_Black_and_Yellow.mp4 is in your client/public folder */}
          <source
            src="/Video_Generation_with_Black_and_Yellow.mp4"
            type="video/mp4"
          />
          Your browser does not support this video tag
        </video>
        <div className="sign-up">
          <h2 id="sign-up-now">
            SIGN UP NOW TO GET <br />A FREE CONSULTATION!
          </h2>
          <p id="sign-up-banner">
            Uncertain if our program suits your needs? No worries! Schedule
            <br />a FREE Consultation to discuss you or your athletes Goals
            Today.
          </p>
          <button type="button" id="freeConsultation" onClick={openModal}>
            CLAIM FREE CONSULTATION
          </button>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Request Your Free Consultation</h2>

              {/* --- NEW: Show a success message after submission --- */}
              {submissionStatus.message ? (
                <div
                  className="form-success-message"
                  style={{ textAlign: "center" }}
                >
                  {submissionStatus.message}
                </div>
              ) : (
                <>
                  <p>
                    Fill out your details below and we'll contact you to
                    schedule your free consultation with Coach Alex.
                  </p>
                  {/* --- FIX: The form now uses onSubmit --- */}
                  <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                      <label htmlFor="name">Your Name</label>
                      <input type="text" id="name" name="name" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Your Email</label>
                      <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">
                        What are your athlete's goals? (Optional)
                      </label>
                      <textarea id="message" name="message" rows="4"></textarea>
                    </div>
                    <div className="modal-actions">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="button-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="button-primary"
                        disabled={submissionStatus.isSubmitting}
                      >
                        {submissionStatus.isSubmitting
                          ? "Sending..."
                          : "Submit Request"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Consultation;
