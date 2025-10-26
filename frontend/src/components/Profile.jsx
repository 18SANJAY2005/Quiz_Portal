import React, { useContext, useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const storageKey = useMemo(() => (user?.id ? `profile:${user.id}` : null), [user]);
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', institution: '' });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        // Try to fetch from MongoDB first
        const response = await api.get('/api/profile');
        if (response.data) {
          setProfile({
            fullName: response.data.fullName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            institution: response.data.institution || ''
          });
          
          // Also save to localStorage for offline access
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(response.data));
          }
          setLoading(false);
          return;
        }
      } catch {
        console.log('Profile not found in database, checking localStorage');
      }

      // Fallback to localStorage
      if (storageKey) {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          try {
            const localProfile = JSON.parse(raw);
            setProfile(localProfile);
            
            // Save to MongoDB if it exists in localStorage
            if (localProfile.fullName || localProfile.email || localProfile.phone || localProfile.institution) {
              try {
                await api.put('/api/profile', localProfile);
              } catch {
                console.log('Could not migrate profile to database');
              }
            }
          } catch { /* ignore parse error */ }
        } else {
          // Check for temporary profile data from registration
          const tempKey = `temp_profile_${user.username}`;
          const tempData = localStorage.getItem(tempKey);
          if (tempData) {
            try {
              const tempProfile = JSON.parse(tempData);
              setProfile(tempProfile);
              
              // Save to MongoDB
              await api.put('/api/profile', tempProfile);
              
              // Transfer to permanent profile and clean up temp data
              localStorage.setItem(storageKey, tempData);
              localStorage.removeItem(tempKey);
            } catch { /* ignore parse error */ }
          } else {
            setProfile((p) => ({ ...p, fullName: user.username || '', email: user.email || '' }));
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [storageKey, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storageKey) return;
    
    try {
      // Save to MongoDB via API
      await api.put('/api/profile', {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        institution: profile.institution
      });
      
      // Also save to localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(profile));
      
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      // Fallback to localStorage if API fails
      localStorage.setItem(storageKey, JSON.stringify(profile));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-content">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
          <h2 className="profile-title" style={{ marginBottom: 0 }}>My Profile</h2>
          <div className="profile-actions">
            {!editing ? (
              <button type="button" className="profile-btn" onClick={() => setEditing(true)}>Edit</button>
            ) : (
              <>
                <button type="button" className="profile-btn-outline" onClick={() => { setEditing(false); }}>Cancel</button>
                <button type="submit" form="profile-form" className="profile-btn">Save</button>
              </>
            )}
          </div>
        </div>
        {saved && <div className="profile-saved">Profile updated</div>}
        <form id="profile-form" className="profile-form" onSubmit={handleSave}>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input name="fullName" value={profile.fullName} onChange={handleChange} className="profile-input" disabled={!editing} placeholder="Your full name" />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input name="email" type="email" value={profile.email} onChange={handleChange} className="profile-input" disabled={!editing} placeholder="you@example.com" />
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input name="phone" value={profile.phone} onChange={handleChange} className="profile-input" disabled={!editing} placeholder="+91 90000 00000" />
            </div>
            <div className="profile-field">
              <label>Institution</label>
              <input name="institution" value={profile.institution} onChange={handleChange} className="profile-input" disabled={!editing} placeholder="College / School" />
            </div>
          </div>
          <div className="profile-sticky-actions">
            {!editing ? (
              <button type="button" className="profile-btn" onClick={() => setEditing(true)}>Edit</button>
            ) : (
              <>
                <button type="button" className="profile-btn-outline" onClick={() => { setEditing(false); }}>Cancel</button>
                <button type="submit" className="profile-btn">Save</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;


