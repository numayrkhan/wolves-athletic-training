// in client/src/pages/AdminServiceAreaPage.jsx

import React, { useState, useEffect } from 'react';
import './AdminBookingsPage.css'; // Reuse table and form styles

const AdminServiceAreaPage = () => {
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newArea, setNewArea] = useState({ zipCode: '', county: '', state: 'NJ' });

  const fetchAreas = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/service-areas`;
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch service areas.');
      const data = await response.json();
      setAreas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewArea(prevState => ({ ...prevState, [name]: value }));

    // --- NEW: Autofill logic ---
    // If the changed input is 'zipCode' and it has 5 digits
    if (name === 'zipCode' && value.length === 5) {
      setError('');
      const token = localStorage.getItem('authToken');
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/geocode/zip/${value}`;
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Could not find details for that ZIP code.');
        
        const data = await response.json();
        
        // Update the state with the fetched county and state
        setNewArea(prevState => ({
          ...prevState,
          county: data.county,
          state: data.state,
        }));
        
      } catch (err) {
        setError(err.message);
        // Clear county and state if the ZIP is invalid
        setNewArea(prevState => ({
          ...prevState,
          county: '',
          state: '',
        }));
      }
    }
  };


  const handleAddArea = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('authToken');
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/service-areas`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newArea),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add area.');
      }
      setNewArea({ zipCode: '', county: '', state: 'NJ' }); // Reset form
      fetchAreas(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteArea = async (zipCode) => {
    if (window.confirm(`Are you sure you want to remove ZIP code ${zipCode}?`)) {
      setError('');
      const token = localStorage.getItem('authToken');
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/service-areas/${zipCode}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to delete area.');
        fetchAreas(); // Refresh list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isLoading) return <p>Loading service areas...</p>;

  return (
    <div className="admin-table-container">
      <h2>Service Area Management</h2>

      <div className="add-form-container">
        <h3>Add New Service Area</h3>
        <form onSubmit={handleAddArea}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input id="zipCode" name="zipCode" type="text" value={newArea.zipCode} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="county">County</label>
              <input id="county" name="county" type="text" value={newArea.county} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input id="state" name="state" type="text" value={newArea.state} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="submit-button" style={{ alignSelf: 'end', height: '47px' }}>Add Area</button>
          </div>
        </form>
      </div>

      {error && <p className="form-error-message">Error: {error}</p>}

      <div className="table-wrapper" style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>ZIP Code</th>
              <th>County</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.zipCode}>
                <td>{area.zipCode}</td>
                <td>{area.county}</td>
                <td>{area.state}</td>
                <td>
                  <button onClick={() => handleDeleteArea(area.zipCode)} className="action-button deactivate">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminServiceAreaPage;