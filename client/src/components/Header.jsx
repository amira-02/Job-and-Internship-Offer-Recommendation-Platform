import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import '../styles/Header.css';

function Header() {
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (cookies.jwt) {
        try {
          const response = await fetch("http://localhost:3000/api/auth/profile", {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${cookies.jwt}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include',
          });
          const data = await response.json();
          
          if (data) {
            setUserProfile(data);
          } else {
            setUserProfile(null);
            removeCookie('jwt');
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [cookies.jwt, removeCookie]);

  const handleLogout = () => {
    removeCookie('jwt');
    setUserProfile(null);
    navigate('/login');
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          JobMatch
        </Link>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/offers" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Offers
          </Link>
          {!cookies.jwt && (
            <Link to="/employer" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Employeur?
            </Link>
          )}
          {cookies.jwt ? (
            <div className="user-menu">
              <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
                <div className="profile-trigger">
                  <Avatar 
                    src={userProfile?.profilePicture} 
                    icon={!userProfile?.profilePicture && <UserOutlined />}
                    className="profile-avatar"
                    style={{ 
                      backgroundColor: !userProfile?.profilePicture ? '#1890ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </Dropdown>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-button login" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="nav-button signup" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header; 