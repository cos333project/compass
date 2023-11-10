import React, { useState } from 'react';
import ReactDOM from 'react-dom';

// User data interface
export interface IUser {
  major: string;
  minors: string[];
  firstName: string;
  lastName: string;
  email: string;
}

// Props for UserSettings component
interface UserSettingsProps {
  user: IUser;
  onClose: () => void;
  onSave: (updatedUser: IUser) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ user, onClose, onSave }) => {
  const [major, setMajor] = useState(user.major);
  const [minors, setMinors] = useState(user.minors);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    onSave({ major, minors, firstName, lastName, email });
    onClose();
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    width: '50%',
    maxWidth: '600px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    paddingRight: '10px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '5px',
  };

  return ReactDOM.createPortal(
    (
      <div style={modalOverlayStyle}>
        <div style={modalStyle}>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelStyle}>FirstName:</td>
                <td>
                  <input type="text" style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>LastName:</td>
                <td>
                  <input type="text" style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Email:</td>
                <td>
                  <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Major:</td>
                <td>
                  <select style={inputStyle} value={major} onChange={(e) => setMajor(e.target.value)}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Business">Business</option>
                    {/* More options */}
                  </select>
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Minors:</td>
                <td>
                  <select multiple style={inputStyle} value={minors} onChange={(e) => setMinors(Array.from(e.target.selectedOptions, option => option.value))}>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    {/* More options */}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>
          </div>
        </div>
      </div>
    ),
    document.body
  );
};

export default UserSettings;
