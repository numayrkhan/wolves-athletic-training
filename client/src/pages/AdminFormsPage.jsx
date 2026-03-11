// in client/src/pages/AdminFormsPage.jsx

import React, { useState, useEffect } from 'react';
import './AdminBookingsPage.css'; // Reuse table styles
import './AdminFormsPage.css';   // We'll create this new file for modal styles

const AdminFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/forms`;
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch forms.');
        const data = await response.json();
        setForms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
  }, []);

  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedForm(null);
  };

  if (isLoading) return <p>Loading forms...</p>;
  if (error) return <p style={{ color: '#f39f5a' }}>Error: {error}</p>;

  return (
    <div className="admin-table-container">
      <h2>Submitted Forms</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Submitted By</th>
              <th>Form Type</th>
              <th>Date Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id}>
                <td>
                  {form.user.name}<br/>
                  <small>{form.user.email}</small>
                </td>
                <td>
                  <span className={`status-badge ${form.type === 'PARQ' ? 'active' : 'inactive'}`}>
                    {form.type}
                  </span>
                </td>
                <td>{new Date(form.submittedAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => viewFormDetails(form)} className="action-button reactivate">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedForm.type} Details</h2>
            <div className="modal-body">
              <p><strong>Submitted by:</strong> {selectedForm.user.name} ({selectedForm.user.email})</p>
              <p><strong>Date:</strong> {new Date(selectedForm.submittedAt).toLocaleString()}</p>
              <hr />
              <h4>Form Data:</h4>
              <div className="form-data-grid">
                {Object.entries(selectedForm.formData).map(([key, value]) => (
                  <div key={key} className="form-data-item">
                    <strong className="form-data-key">{key}</strong>
                    <span className="form-data-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={closeModal} className="close-modal-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormsPage;