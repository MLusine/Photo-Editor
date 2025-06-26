import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';



const Header: React.FC = () => {

    const handleLogout = () => {
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        navigate('/login');
      };
      
      const navigate = useNavigate();
      
  return (
    <header className="header">
      <div className="header__content">
        
          <button onClick={handleLogout} className="header__logout-btn">
            Log out       
          </button>
        
      </div>
    </header>
  );
};

export default Header;
