import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import ParentCard from '../components/ParentCard';
import AddParentModal from '../components/AddParentModal';
import ParentProfileModal from '../components/ParentProfileModal';

export default function ParentsTab() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/parents/profiles');
      
      if (response.data && response.data.users) {
        setParents(response.data.users);
      } else {
        setParents([]);
      }
    } catch (err) {
      console.error('Error fetching parent profiles:', err);
      setError('Failed to load parents profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleAddSuccess = (newParent) => {
    setParents(prev => [newParent, ...prev]);
  };

  const handleUpdateSuccess = (updatedParent) => {
    setParents(prev => prev.map(p =>
      p.id === updatedParent.id
        ? { ...p, ...updatedParent }
        : p
    ));
  };

  const handleModalClose = () => {
    setSelectedParentId(null);
    fetchParents();
  };

  const filteredParents = parents.filter(p => {
    const search = searchTerm.toLowerCase();
    const firstName = (p.first_name || '').toLowerCase();
    const lastName = (p.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const email = (p.email || '').toLowerCase();
    const phone = p.phone_number || '';

    return fullName.includes(search) ||
           email.includes(search) ||
           phone.includes(search);
  });

  return (
    <div className="parents-tab">
      <div className="parents-header">
        <div>
          <h2 className="page-title">Parent Profiles</h2>
          <p className="parents-subtitle">{parents.length} parent{parents.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="parents-header-right">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary add-btn" onClick={() => setShowAddModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Parent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profiles...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p className="alert alert-error">{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchParents}>Retry</button>
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 1 0 7.75"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>No parents found</h3>
          <p>There are no profiles matching your search or registered yet.</p>
        </div>
      ) : (
        <div className="parents-grid">
          {filteredParents.map(parent => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onClick={() => setSelectedParentId(parent.id)}
            />
          ))}
        </div>
      )}

      <AddParentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <ParentProfileModal
        isOpen={!!selectedParentId}
        onClose={handleModalClose}
        parentId={selectedParentId}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}