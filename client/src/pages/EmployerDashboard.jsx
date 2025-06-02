import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message, Layout, Menu, Typography, Space, Avatar, Row, Col, Statistic, Progress, Badge, Drawer, Modal, Form, Input, Empty, Divider, Tag } from 'antd';
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
  DeleteOutlined
} from '@ant-design/icons';
import PostJobForm from '../components/PostJobForm';
import '../styles/EmployerDashboard.css';

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
    setActiveMenu(e.key);
    if (windowWidth <= 768) {
      setMobileDrawerVisible(false);
    }

    if (e.key === '4') {
      setIsPostJobModalVisible(true);
    }
  };

  const handleEditProfile = () => {
    form.setFieldsValue({
      companyName: user.companyName,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      website: user.website,
      description: user.description
    });
    setIsEditModalVisible(true);
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
        <Menu.Divider />
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
          {activeMenu === '1' && (
            <>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">1.7k+</div>
                      <div className="stat-label">Total Visitor</div>
                    </div>
                    <div className="stat-icon visitor-icon">
                      <UserOutlined />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">03</div>
                      <div className="stat-label">Shortlisted</div>
                    </div>
                    <div className="stat-icon shortlisted-icon">
                      <FileTextOutlined />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">2.1k</div>
                      <div className="stat-label">Views</div>
                    </div>
                    <div className="stat-icon views-icon">
                      <EyeOutlined />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">07</div>
                      <div className="stat-label">Applied Job</div>
                    </div>
                    <div className="stat-icon applied-icon">
                       <EditOutlined />
                    </div>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[24, 24]} className="dashboard-row">
                <Col xs={24} lg={16}>
                  <Card 
                    title="Informations de l'entreprise" 
                    className="info-card"
                    extra={
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={handleEditProfile}
                        className="edit-profile-btn"
                      >
                        Modifier
                      </Button>
                    }
                  >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div className="info-item">
                        <BankOutlined /> <Text strong>Nom de l'entreprise:</Text> {user?.companyName}
                      </div>
                      <div className="info-item">
                        <UserOutlined /> <Text strong>Contact:</Text> {user?.fullName}
                      </div>
                      <div className="info-item">
                        <PhoneOutlined /> <Text strong>Téléphone:</Text> {user?.phone || 'Non spécifié'}
                      </div>
                      <div className="info-item">
                        <EnvironmentOutlined /> <Text strong>Adresse:</Text> {user?.location || 'Non spécifiée'}
                      </div>
                      {user?.website && (
                        <div className="info-item">
                          <GlobalOutlined /> <Text strong>Site web:</Text> {user.website}
                        </div>
                      )}
                      {user?.description && (
                        <div className="info-item">
                          <FileTextOutlined /> <Text strong>Description:</Text> {user.description}
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Activité récente" className="activity-card">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div className="activity-item">
                        <CheckCircleOutlined className="activity-icon success" />
                        <div className="activity-content">
                          <Text strong>Nouvelle candidature</Text>
                          <Text type="secondary">Il y a 2 heures</Text>
                        </div>
                      </div>
                      <div className="activity-item">
                        <EyeOutlined className="activity-icon info" />
                        <div className="activity-content">
                          <Text strong>Vues en hausse</Text>
                          <Text type="secondary">Il y a 3 heures</Text>
                        </div>
                      </div>
                      <div className="activity-item">
                        <FileTextOutlined className="activity-icon primary" />
                        <div className="activity-content">
                          <Text strong>Nouvelle offre publiée</Text>
                          <Text type="secondary">Il y a 1 jour</Text>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {activeMenu === '2' ? (
            <>
              <div className="section-header">
                <Title level={3}>Mes offres d'emploi</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsPostJobModalVisible(true)}
                >
                  Publier une offre
                </Button>
              </div>
              {renderJobOffers()}
            </>
          ) : (
            <>
              {/* ... existing dashboard content ... */}
            </>
          )}
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

        <Modal
          title="Modifier les informations de l'entreprise"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={600}
          className="edit-profile-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            className="edit-profile-form"
          >
            <Form.Item
              name="companyName"
              label="Nom de l'entreprise"
              rules={[{ required: true, message: 'Veuillez entrer le nom de l\'entreprise' }]}
            >
              <Input prefix={<BankOutlined />} />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Nom du contact"
              rules={[{ required: true, message: 'Veuillez entrer le nom du contact' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Téléphone"
            >
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>

            <Form.Item
              name="location"
              label="Adresse"
            >
              <Input prefix={<EnvironmentOutlined />} />
            </Form.Item>

            <Form.Item
              name="website"
              label="Site web"
            >
              <Input prefix={<GlobalOutlined />} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item className="form-actions">
              <Button onClick={() => setIsEditModalVisible(false)}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
}

export default EmployerDashboard; 