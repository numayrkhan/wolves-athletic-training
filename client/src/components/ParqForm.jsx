// in client/src/components/ParqForm.jsx

import React from 'react';

const ParqForm = ({ onSubmit }) => {
  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Physical Activity Readiness Questionnaire (PAR-Q)</h2>
        <p>Your child's health and safety is our number one priority.</p>
      </div>

      <form className="parq-form" onSubmit={onSubmit}>
        {/* --- Participant Info --- */}
        <div className="form-group inline">
          <div>
            <label htmlFor="participantName">Participant's Full Name</label>
            <input id="participantName" name="participantName" type="text" className="form-input" required />
          </div>
          <div>
            <label htmlFor="participantDob">Date of Birth</label>
            <input id="participantDob" name="participantDob" type="date" className="form-input" required />
          </div>
        </div>

        {/* --- Questions --- */}
        <div className="form-question">
          <label>1. Has your doctor ever said that your child has a heart condition and that they should only do physical activity recommended by a doctor?</label>
          <div className="radio-options">
            <label><input type="radio" name="q1" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q1" value="no" /><span className="radio-custom"></span> No</label>
          </div>
        </div>

        <div className="form-question">
          <label>2. Does your child ever feel chest pain while doing physical activity?</label>
          <div className="radio-options">
            <label><input type="radio" name="q2" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q2" value="no" /><span className="radio-custom"></span> No</label>
          </div>
        </div>

        <div className="form-question">
          <label>3. In the past month, has your child had any chest pain while not doing physical activity?</label>
          <div className="radio-options">
            <label><input type="radio" name="q3" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q3" value="no" /><span className="radio-custom"></span> No</label>
          </div>
        </div>

        <div className="form-question">
          <label>4. Does your child ever lose balance because of dizziness or lose consciousness?</label>
          <div className="radio-options">
            <label><input type="radio" name="q4" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q4" value="no" /><span className="radio-custom"></span> No</label>
          </div>
        </div>

        <div className="form-question">
          <label>5. Does your child have a bone or joint problem (e.g., back, knee, or hip) that could be made worse by a change in physical activity?</label>
          <div className="radio-options">
            <label><input type="radio" name="q5" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q5" value="no" /><span className="radio-custom"></span> No</label>
          </div>
        </div>

        <div className="form-question">
          <label>6. Is your child currently on any prescription drugs?</label>
          <div className="radio-options">
            <label><input type="radio" name="q6" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q6" value="no" /><span className="radio-custom"></span> No</label>
          </div>
          {/* We can add conditional logic here later to show a text box if 'Yes' is selected */}
        </div>
        
        <div className="form-question">
          <label>7. Do you know of any other reason why your child should not do physical activity?</label>
          <div className="radio-options">
            <label><input type="radio" name="q7" value="yes" required /><span className="radio-custom"></span> Yes</label>
            <label><input type="radio" name="q7" value="no" /><span className="radio-custom"></span> No</label>
          </div>
        </div>

        {/* --- Submission --- */}
        <button type="submit" className="submit-button" style={{marginTop: '40px'}}>Submit PAR-Q</button>
      </form>
    </div>
  );
};

export default ParqForm;