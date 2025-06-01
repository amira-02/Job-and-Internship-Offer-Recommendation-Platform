import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message, Layout, Menu, Typography, Space, Avatar } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  FileTextOutlined,
  PlusOutlined
} from '@ant-design/icons';
import '../styles/EmployerDashboard.css';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les informations de l'utilisateur depuis le localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('User data loaded:', parsedUser); // Debug log
      setUser(parsedUser);
    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
      message.error('Erreur lors de la lecture des données utilisateur');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Appeler l'endpoint de déconnexion
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion');
      }

      // Supprimer le token et les données utilisateur du localStorage
      localStorage.clear();
      sessionStorage.clear();

      // Supprimer tous les cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Supprimer spécifiquement les cookies JWT et de session
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Afficher un message de succès
      message.success('Déconnexion réussie');
      
      // Forcer le rechargement complet de la page
      window.location.replace('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      message.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <div>Erreur: Utilisateur non trouvé</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="company-profile">
          <Avatar size={64} icon={<BankOutlined />} />
          <Title level={4}>{user.companyName}</Title>
          <Text type="secondary">{user.email}</Text>
        </div>
        
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          className="dashboard-menu"
        >
          <Menu.Item key="1" icon={<UserOutlined />}>
            Profil de l'entreprise
          </Menu.Item>
          <Menu.Item key="2" icon={<FileTextOutlined />}>
            Gérer les offres
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            Candidats
          </Menu.Item>
          <Menu.Item key="4" icon={<GlobalOutlined />}>
            Paramètres
          </Menu.Item>
          <Menu.Item key="5" onClick={handleLogout}>
            Déconnexion
          </Menu.Item>
        </Menu>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-header-content">
          <Title level={2}>Bienvenue, {user.fullName}</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            Publier une nouvelle offre
          </Button>
        </div>

        <div className="dashboard-cards">
          <Card title="Informations de l'entreprise" className="info-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="info-item">
                <BankOutlined /> <Text strong>Nom de l'entreprise:</Text> {user.companyName}
              </div>
              <div className="info-item">
                <UserOutlined /> <Text strong>Contact:</Text> {user.fullName}
              </div>
              <div className="info-item">
                <PhoneOutlined /> <Text strong>Téléphone:</Text> {user.phone}
              </div>
              <div className="info-item">
                <EnvironmentOutlined /> <Text strong>Adresse:</Text> {user.location}
              </div>
              {user.website && (
                <div className="info-item">
                  <GlobalOutlined /> <Text strong>Site web:</Text> {user.website}
                </div>
              )}
              {user.description && (
                <div className="info-item">
                  <FileTextOutlined /> <Text strong>Description:</Text> {user.description}
                </div>
              )}
            </Space>
          </Card>

          <Card title="Statistiques" className="stats-card">
            <div className="stats-grid">
              <div className="stat-item">
                <Title level={4}>0</Title>
                <Text>Offres actives</Text>
              </div>
              <div className="stat-item">
                <Title level={4}>0</Title>
                <Text>Candidats</Text>
              </div>
              <div className="stat-item">
                <Title level={4}>0</Title>
                <Text>Vues</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard; 