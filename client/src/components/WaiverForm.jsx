// in client/src/components/WaiverForm.jsx

import React from 'react';

const WaiverForm = ({ onSubmit }) => {
  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Wolves Athletic Training Waiver & Release</h2>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group inline">
          <div>
            <label htmlFor="playerName">Player's Full Name</label>
            <input id="playerName" name="playerName" type="text" className="form-input" required />
          </div>
          <div>
            <label htmlFor="playerAge">Age</label>
            <input id="playerAge" name="playerAge" type="number" className="form-input" required />
          </div>
        </div>

        <div className="form-group inline">
          <div>
            <label htmlFor="parentName">Parent/Guardian Full Name</label>
            <input id="parentName" name="parentName" type="text" className="form-input" required />
          </div>
          <div>
            <label htmlFor="parentEmail">Email Address</label>
            <input id="parentEmail" name="parentEmail" type="email" className="form-input" required />
          </div>
        </div>
        
        <div className="form-group">
          <label>Release of Liability Agreement</label>
          <div className="waiver-text">
            <p>On my own behalf and on behalf of my heirs, successors and assigns, I hereby forever release and discharge and agree to indemnify and hold harmless Wolves Athletic Training LLC... [and all subsequent text from the waiver document].</p>
            <p>I understand and acknowledge that dangers of personal injury are inherent in participating in soccer clinics, try-outs, games or training sessions...</p>
            <p>I further agree that all photographs, video recordings, audio recordings, and other forms of media taken at the Facility or associated with the Products are the exclusive property Wolves Athletic Training...</p>
            {/* NOTE: For the final version, you would paste the full waiver text here */}
          </div>
        </div>

        <div className="form-question">
          <label>By checking this box, I acknowledge that I have read, understood, and agree to the terms of the Release of Liability.</label>
          <div className="radio-options">
              <label><input type="checkbox" name="agreement" required /><span className="radio-custom" style={{borderRadius: '4px'}}></span> I Agree</label>
          </div>
        </div>

        <button type="submit" className="submit-button" style={{marginTop: '40px'}}>Submit Waiver</button>
      </form>
    </div>
  );
};

export default WaiverForm;