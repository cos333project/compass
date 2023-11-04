import React, { useState } from 'react';
import SettingsForm from './SettingsForm';

const DropdownMenu = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logged out');
  };

  const styles = {
    dropdown: {
      position: 'relative',
      display: 'inline-block',
    },
    dropdownButton: {
      padding: '8px',
      cursor: 'pointer',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
    },
    dropdownList: {
      position: 'absolute',
      backgroundColor: '#f9f9f9',
      minWidth: '160px',
      boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
      padding: '0',
      margin: '0',
      zIndex: 1,
    },
    dropdownItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      display: 'block',
      borderBottom: '1px solid #ddd',
    },
  };

  return (
    <div style={styles.dropdown}>
      <button style={styles.dropdownButton} onClick={() => setShowDropdown(!showDropdown)}>
        Menu
      </button>
      {showDropdown && (
        <ul style={styles.dropdownList}>
          <li style={styles.dropdownItem} onClick={() => setShowSettings(true)}>Settings</li>
          <li style={styles.dropdownItem} onClick={handleLogout}>Logout</li>
        </ul>
      )}
      {showSettings && <SettingsForm closeSettings={() => setShowSettings(false)} />}
    </div>
  );
};

export default DropdownMenu;
