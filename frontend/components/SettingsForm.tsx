import React, { useState } from 'react';

const SettingsForm = ({ closeSettings }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    classYear: '',
    major: '',
    minors: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMajorChange = (e) => {
    setFormData({ ...formData, major: e.target.value });
  };

  const handleMinorsChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, minors: values });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    closeSettings();
  };

  const styles = {
    settingsFormContainer: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000', // Ensure this is higher than other elements
    },
    settingsForm: {
      background: '#fff',
      padding: '20px',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      width: '100%', // Full width of the form
    },
    select: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
    },
    button: {
      marginTop: '10px',
      padding: '10px 15px',
      cursor: 'pointer',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
    },
  };

  return (
    <div style={styles.settingsFormContainer}>
      <form style={styles.settingsForm} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
        />
        <input
          style={styles.input}
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
        />
        <input
          style={styles.input}
          type="text"
          name="classYear"
          placeholder="Class Year"
          value={formData.classYear}
          onChange={handleInputChange}
        />
        <select
          style={styles.select}
          name="major"
          value={formData.major}
          onChange={handleMajorChange}
        >
          {/* Here you would map over your majors */}
          <option value="computer-science">Computer Science</option>
          <option value="biology">Biology</option>
          {/* ...other options */}
        </select>
        <select
          style={styles.select}
          multiple={true}
          value={formData.minors}
          onChange={handleMinorsChange}
        >
          {/* Here you would map over your minors */}
          <option value="mathematics">Mathematics</option>
          <option value="english">English</option>
          {/* ...other options */}
        </select>
        <button style={styles.button} type="submit">Save</button>
        <button style={styles.button} type="button" onClick={closeSettings}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default SettingsForm;
