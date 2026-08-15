import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import ParentCard from '../components/ParentCard';
import AddParentModal from '../components/AddParentModal';
import ParentProfileModal from '../components/ParentProfileModal';

const STORAGE_KEY = 'kidcare_created_parents';

export default function ParentsTab() {
  const [parents, setParents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);

  // Persist to localStorage whenever parents change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parents));
  }, [parents]);

  const handleAddSuccess = (newParent) => {
    // Add to local list with basic info
    const parentEntry = {
      id: newParent.id,
      first_name: newParent.first_name,
      last_name: newParent.last_name,
      email: newParent.email,
      phone_number: newParent.phone_number,
      address: newParent.address,
      created_at: new Date().toISOString(),
    };
    setParents(prev => [parentEntry, ...prev]);
  };

  const handleUpdateSuccess = (updatedParent) => {
    setParents(prev => prev.map(p =>
      p.id === updatedParent.id
        ? { ...p, ...updatedParent }
        : p
    ));
  };

    const filteredParents = parents.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) ||
           p.email?.toLowerCase().includes(search) ||
           p.phone_number?.includes(search);
  });

  return (
    <div className="parents-tab">
      <div className="parents-header">
        <div>
          <h2 className="page-title">Parent Profiles</h2>
          <p className="parents-subtitle">{parents.length} parent{parents.length !== 1 ? 's' : ''} created</p>
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

      {filteredParents.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>No parents created yet</h3>
          <p>Click "Add Parent" to create your first parent account</p>
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
        onClose={() => setSelectedParentId(null)}
        parentId={selectedParentId}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}