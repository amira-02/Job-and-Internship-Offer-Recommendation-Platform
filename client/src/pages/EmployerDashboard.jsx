import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message, Layout, Menu, Typography, Space, Avatar, Row, Col, Statistic, Progress, Badge, Drawer, Modal, Form, Input, Empty, Divider, Tag, theme, Timeline } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  FileTextOutlined,
  PlusOutlined,
  TeamOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MailOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  StarOutlined,
  CreditCardOutlined,
  MenuOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  LaptopOutlined,
  NotificationOutlined,
  HeartOutlined,
  DollarCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import PostJobForm from '../components/PostJobForm';
import EmployerProfileForm from '../components/EmployerProfileForm';
import { authService } from '../services/authService';
import '../styles/EmployerDashboard.css';
import { useMediaQuery } from '@mui/material';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState('1');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPostJobModalVisible, setIsPostJobModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const { token: antdToken } = theme.useToken();
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
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

      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      message.success('Déconnexion réussie');
      window.location.replace('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      message.error('Erreur lors de la déconnexion');
    }
  };

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
    if (windowWidth <= 768) {
      setMobileDrawerVisible(false);
    }

    if (e.key === '4') {
      setIsPostJobModalVisible(true);
    }

    if (e.key === 'edit-profile') {
      setIsEditModalVisible(true);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/api/employer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      message.success('Profil mis à jour avec succès');
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      message.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePostJob = () => {
    setIsPostJobModalVisible(true);
  };

  const handleJobPosted = () => {
    loadJobOffers();
    setIsPostJobModalVisible(false);
  };

  const loadJobOffers = async () => {
    try {
      setLoadingJobs(true);
      const response = await fetch('http://localhost:3000/api/joboffers/employer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobOffers(data);
      } else {
        message.error('Erreur lors du chargement des offres');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      message.error('Erreur lors du chargement des offres');
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadJobOffers();
    }
  }, [user]);

  const renderSidebar = () => (
    <>
      <div className="company-profile">
        <Avatar 
          size={collapsed ? 40 : 64} 
          icon={<BankOutlined />} 
          className="company-avatar"
        />
        {!collapsed && (
          <>
            <Title level={4} className="company-name">{user?.companyName}</Title>
            <Text type="secondary" className="company-email">{user?.email}</Text>
            <Progress 
              percent={75} 
              size="small" 
              status="active" 
              className="profile-progress"
              format={percent => `Profil ${percent}% complet`}
            />
          </>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[activeMenu]}
        onClick={handleMenuClick}
        className="dashboard-menu"
      >
        <Menu.Item key="1" icon={<UserOutlined />}>
          My Profile
        </Menu.Item>
        <Menu.Item key="2" icon={<FileTextOutlined />}>
          My Jobs
        </Menu.Item>
        <Menu.Item key="3" icon={<MailOutlined />}>
          Messages <Badge count={5} offset={[10, 0]} />
        </Menu.Item>
        <Menu.Item key="4" icon={<PlusOutlined />}>
          Submit Job
        </Menu.Item>
        <Menu.Item key="5" icon={<StarOutlined />}>
          Saved Candidate
        </Menu.Item>
        <Menu.Item key="6" icon={<CreditCardOutlined />}>
          Membership
        </Menu.Item>
        <Menu.Item key="7" icon={<SettingOutlined />}>
          Account Settings
        </Menu.Item>
        <Menu.Item key="8" icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Logout
        </Menu.Item>
      </Menu>
    </>
  );

  const renderJobOffers = () => {
    if (loadingJobs) {
      return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    if (jobOffers.length === 0) {
      return (
        <Card className="info-card">
          <Empty description="Aucune offre d'emploi publiée" />
        </Card>
      );
    }

    return (
      <Row gutter={[24, 24]}>
        {jobOffers.map(job => (
          <Col xs={24} sm={12} lg={8} key={job._id}>
            <Card className="job-card">
              <Title level={4}>{job.jobTitle}</Title>
              <Text type="secondary">{job.jobType}</Text>
              <Divider />
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Catégorie:</Text> {job.jobCategory}
                </div>
                <div>
                  <Text strong>Salaire:</Text> {job.minSalary} - {job.maxSalary} ({job.salaryPeriod})
                </div>
                <div>
                  <Text strong>Expérience:</Text> {job.experienceLevel}
                </div>
                <div>
                  <Text strong>Localisation:</Text> {job.address}, {job.country}
                </div>
                <div>
                  <Text strong>Compétences:</Text>
                  <div style={{ marginTop: 8 }}>
                    {job.skills.map(skill => (
                      <Tag key={skill} color="blue">{skill}</Tag>
                    ))}
                  </div>
                </div>
              </Space>
              <Divider />
              <Space>
                <Button type="primary" icon={<EditOutlined />}>
                  Modifier
                </Button>
                <Button danger icon={<DeleteOutlined />}>
                  Supprimer
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case '1':
        return (
          <div className="profile-container">
            <Row gutter={[24, 24]}>
              {/* Profile Header Card */}
              <Col span={24}>
                <Card className="profile-header-card">
                  <Row align="middle" gutter={24}>
                    <Col>
                      <Avatar 
                        size={80} 
                        icon={<BankOutlined />} 
                        className="profile-avatar"
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    </Col>
                    <Col flex="auto">
                      <Title level={3} style={{ margin: 0 }}>{user?.companyName}</Title>
                      <Text type="secondary" style={{ fontSize: '16px' }}>{user?.email}</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="blue" icon={<EnvironmentOutlined />}>{user?.location}</Tag>
                        <Tag color="green" icon={<GlobalOutlined />}>{user?.website}</Tag>
                        <Tag color="purple" icon={<PhoneOutlined />}>{user?.phone}</Tag>
                      </div>
                    </Col>
                    <Col>
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setIsEditModalVisible(true)}
                      >
                        Modifier le profil
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Statistics Cards */}
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <Statistic
                    title="Offres publiées"
                    value={jobOffers.length}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <Statistic
                    title="Vues du profil"
                    value={850}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <Statistic
                    title="Candidatures reçues"
                    value={1128}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>

              {/* Company Description Card */}
              <Col span={24}>
                <Card 
                  title="Description de l'entreprise" 
                  className="description-card"
                  extra={<Button type="link" icon={<EditOutlined />} onClick={() => setIsEditModalVisible(true)}>Modifier</Button>}
                >
                  <Text>{user?.description || "Aucune description disponible"}</Text>
                </Card>
              </Col>

              {/* Recent Activity Card */}
              <Col span={24}>
                <Card title="Activité récente" className="activity-card">
                  <Timeline>
                    <Timeline.Item color="green">
                      <p>Nouvelle offre publiée: Développeur Full Stack</p>
                      <Text type="secondary">Il y a 2 jours</Text>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <p>Profil mis à jour</p>
                      <Text type="secondary">Il y a 5 jours</Text>
                    </Timeline.Item>
                    <Timeline.Item color="purple">
                      <p>Nouvelle candidature reçue</p>
                      <Text type="secondary">Il y a 1 semaine</Text>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>

            {/* Edit Profile Modal */}
            <Modal
              title="Modifier les informations de l'entreprise"
              open={isEditModalVisible}
              onCancel={() => setIsEditModalVisible(false)}
              footer={null}
              width={600}
              className="edit-profile-modal"
            >
              {user && (
                <EmployerProfileForm 
                  initialValues={user} 
                  onSubmit={handleUpdateProfile} 
                  onCancel={() => setIsEditModalVisible(false)}
                />
              )}
            </Modal>
          </div>
        );
      case '2':
        if (loadingJobs) {
          return <div>Chargement des offres...</div>;
        }
        return (
          <div>
            <h2>My Job Listings</h2>
            {renderJobOffers()}
          </div>
        );
      case 'statistics':
        return (
          <div>
            <h2>Job Statistics & Analytics</h2>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Card bordered={false}>
                  <Statistic title="Applications Received" value={1128} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card bordered={false}>
                  <Statistic title="Views on Jobs" value={5600} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card bordered={false}>
                  <Statistic title="Profile Views" value={850} />
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <Card title="Job Views Over Time">
                <p>Graphique Placeholder</p>
              </Card>
            </div>
            <div style={{ marginTop: 24 }}>
              <Card title="Applications by Job Type">
                <p>Graphique Placeholder</p>
              </Card>
            </div>
          </div>
        );
      default:
        return <div>Contenu pour {selectedMenuItem}</div>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <Text>Chargement...</Text>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <Text type="danger">Erreur: Utilisateur non trouvé</Text>
        <Button type="primary" onClick={() => navigate('/login')}>
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <Layout className="dashboard-layout">
      {windowWidth > 768 ? (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          className="dashboard-sider"
          width={280}
        >
          {renderSidebar()}
        </Sider>
      ) : (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          visible={mobileDrawerVisible}
          className="mobile-drawer"
          closeIcon={<CloseOutlined />}
        >
          {renderSidebar()}
        </Drawer>
      )}

      <Layout className={`dashboard-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-header">
          <div className="header-left">
            {windowWidth <= 768 && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                className="mobile-menu-btn"
              />
            )}
            <div>
              <Title level={2} className="welcome-title">Bienvenue, {user.fullName}</Title>
              <Text type="secondary">Voici un aperçu de votre activité</Text>
            </div>
          </div>
          <div className="header-right">
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} className="notification-btn" />
            </Badge>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large" 
              className="post-job-btn"
              onClick={handlePostJob}
            >
              Publier une offre
            </Button>
          </div>
        </div>

        <Content className="dashboard-main">
          {renderContent()}
        </Content>

        <Modal
          title="Publier une nouvelle offre d'emploi"
          open={isPostJobModalVisible}
          onCancel={() => setIsPostJobModalVisible(false)}
          footer={null}
          width={800}
          className="post-job-modal"
        >
          <PostJobForm onJobPosted={handleJobPosted} />
        </Modal>
      </Layout>
    </Layout>
  );
}

export default EmployerDashboard; 