import React, { useState } from 'react';
import Navbar from './Navbar';
import DropdownMenu from './DropdownMenu';
// Other imports...

function ParentComponent() {
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const handleUserSettingsClick = () => {
    setShowAccountSettings(true);
  };

  const handleCloseSettings = () => {
    setShowAccountSettings(false);
  };

  return (
    <>
      <Navbar onUserSettingsClick={handleUserSettingsClick} />
      <DropdownMenu isOpen={showAccountSettings} onClose={handleCloseSettings} />
     
    </>
  );
}

export default ParentComponent;
