import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, message, Layout, Menu, Typography, Space, Avatar, Row, Col, Statistic, Progress, Badge, Drawer, Modal, Form, Input, Empty, Divider, Tag, theme, Timeline, Spin } from 'antd';
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
  BarChartOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PostJobForm from '../components/PostJobForm';
import EmployerProfileForm from '../components/EmployerProfileForm';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Header from '../components/Header';
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
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);

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

  const fetchUserProfile = useCallback(async () => {
    if (!cookies.jwt) {
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        removeCookie('jwt', { path: '/' });
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      setUser(null);
      removeCookie('jwt', { path: '/' });
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
      message.error('Session expirée ou erreur de chargement du profil. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  }, [cookies.jwt, navigate, removeCookie]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/logout', {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        removeCookie('jwt', { path: '/' });
        setUser(null);
        message.success('Déconnexion réussie');
        navigate('/login');
      } else {
        throw new Error('Erreur lors de la déconnexion');
      }
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
      console.log("Opening Edit Profile Modal. Type of handleUpdateProfile:", typeof handleUpdateProfile);
      setIsEditModalVisible(true);
    }

    if (e.key === '2') {
      loadJobOffers();
    }
  };

  const handleUpdateProfile = useCallback(async (values) => {
    try {
      console.log('EmployerDashboard - handleUpdateProfile - Sending values:', values);
      const response = await axios.put('http://localhost:3000/api/employer/profile', values, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });

      if (response.status === 200) {
        setUser(response.data.user);
        message.success('Profil mis à jour avec succès');
        setIsEditModalVisible(false);
      } else {
        throw new Error('Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      message.error('Erreur lors de la mise à jour du profil');
    }
  }, [cookies.jwt, setUser, message, setIsEditModalVisible]);

  const handlePostJob = () => {
    setIsPostJobModalVisible(true);
  };

  const handleJobPosted = () => {
    loadJobOffers();
    setIsPostJobModalVisible(false);
  };

  const loadJobOffers = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const response = await axios.get('http://localhost:3000/api/joboffers/employer', {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });

      if (response.status === 200) {
        setJobOffers(response.data);
      } else {
        message.error('Erreur lors du chargement des offres');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      message.error('Erreur lors du chargement des offres');
    } finally {
      setLoadingJobs(false);
    }
  }, [cookies.jwt, message, setLoadingJobs, setJobOffers]);

  useEffect(() => {
    if (user && selectedMenuItem === '2') { 
      loadJobOffers();
    }
  }, [user, selectedMenuItem, loadJobOffers]);

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
          Subscription & Billing
        </Menu.Item>
        <Menu.Item key="7" icon={<NotificationOutlined />}>
          Notifications
        </Menu.Item>
        <Menu.Item key="edit-profile" icon={<SettingOutlined />}>
          Edit Profile
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu>
    </>
  );

  const renderJobOffers = () => {
    if (loadingJobs) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p>Chargement des offres d'emploi...</p>
        </div>
      );
    }
    if (jobOffers.length === 0) {
      return <Empty description="Aucune offre d'emploi publiée." />;
    }
    return (
      <Row gutter={[24, 24]}>
        {jobOffers.map(offer => (
          <Col xs={24} sm={12} md={8} key={offer._id}>
            <Card
              hoverable
              title={offer.jobTitle}
              extra={<Link to={`/job-offers/${offer._id}`}><EyeOutlined /> Voir</Link>}
              actions={[
                <EditOutlined key="edit" onClick={() => navigate(`/edit-job-offer/${offer._id}`)} />,
                <DeleteOutlined key="delete" onClick={() => console.log('Delete')} />,
              ]}
            >
              <p><strong>Catégorie:</strong> <Tag color="blue">{offer.jobCategory}</Tag></p>
              <p><strong>Type:</strong> <Tag color="green">{offer.jobType}</Tag></p>
              <p><strong>Salaire:</strong> {offer.minSalary} - {offer.maxSalary} {offer.salaryPeriod}</p>
              <p><strong>Localisation:</strong> {offer.address}, {offer.country}</p>
              <p><strong>Compétences:</strong> {offer.skills.map(skill => <Tag key={skill}>{skill}</Tag>)}</p>
              <p><strong>Niveau d'expérience:</strong> {offer.experienceLevel}</p>
              <Button
  type="link"
  onClick={() => navigate(`/employer/offers/${offer._id}/candidates`)}
>
  Voir les candidats
</Button>
            </Card>
            
          </Col>
        ))}
      </Row>
    );
  };



  
  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'dashboard':
      case '1':
        // Sample data for charts
        const applicationsData = [
          { month: 'Jan', applications: 35 },
          { month: 'Feb', applications: 42 },
          { month: 'Mar', applications: 28 },
          { month: 'Apr', applications: 45 },
          { month: 'May', applications: 38 },
          { month: 'Jun', applications: 50 },
        ];

        const jobStatusData = [
          { name: 'Active', value: 8 },
          { name: 'Closed', value: 3 },
          { name: 'Draft', value: 2 },
        ];

        const candidateSourcesData = [
          { name: 'Direct', value: 40 },
          { name: 'LinkedIn', value: 30 },
          { name: 'Indeed', value: 20 },
          { name: 'Other', value: 10 },
        ];

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

        return (
          <div className="dashboard-content">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12} lg={8}>
                <Card title="Aperçu du Profil" bordered={false} className="dashboard-card">
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div className="profile-header">
                      <Avatar size={64} icon={<BankOutlined />} />
                      <div className="profile-info">
                        <Title level={4}>{user?.companyName}</Title>
                        <Text type="secondary">{user?.email}</Text>
                      </div>
                    </div>
                    <div className="profile-details">
                      <p><GlobalOutlined /> {user?.website || 'N/A'}</p>
                      <p><PhoneOutlined /> {user?.phone}</p>
                      <p><EnvironmentOutlined /> {user?.location}</p>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Statistiques des Offres" bordered={false} className="dashboard-card">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic 
                        title="Total Offres" 
                        value={jobOffers.length} 
                        prefix={<LaptopOutlined />} 
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Candidatures" 
                        value={120} 
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Offres Actives" 
                        value={jobOffers.filter(job => job.status === 'active').length} 
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Vues Totales" 
                        value={1500} 
                        prefix={<EyeOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Statut des Offres" bordered={false} className="dashboard-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Candidatures par Mois" bordered={false} className="dashboard-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={applicationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="applications" 
                        stroke="#1890ff" 
                        fill="#1890ff" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Sources des Candidats" bordered={false} className="dashboard-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={candidateSourcesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case '2':
        return (
          <div className="my-jobs-section">
            <div className="section-header">
              <Title level={3}>Mes Offres d'Emploi</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handlePostJob}
                size="large"
              >
                Publier une nouvelle offre
              </Button>
            </div>
            {renderJobOffers()}
          </div>
        );
      case '3':
        return (
          <div className="messages-section">
            <Title level={3}>Messages</Title>
            <Card bordered={false}>
              <Empty description="Aucun message pour le moment" />
            </Card>
          </div>
        );
      case '4':
        return (
          <div className="post-job-section">
            <Title level={3}>Publier une Offre d'Emploi</Title>
            <Card bordered={false}>
              <PostJobForm onJobPosted={handleJobPosted} employerId={user?._id} />
            </Card>
          </div>
        );
      case '5':
        return (
          <div className="saved-candidates-section">
            <Title level={3}>Candidats Sauvegardés</Title>
            <Card bordered={false}>
              <Empty description="Aucun candidat sauvegardé" />
            </Card>
          </div>
        );
      case '6':
        return (
          <div className="subscription-section">
            <Title level={3}>Abonnement & Facturation</Title>
            <Card bordered={false}>
              <Empty description="Aucun abonnement actif" />
            </Card>
          </div>
        );
      case '7':
        return (
          <div className="notifications-section">
            <Title level={3}>Notifications</Title>
            <Card bordered={false}>
              <Empty description="Aucune notification" />
            </Card>
          </div>
        );
      default:
        return <Title level={3}>Bienvenue sur votre tableau de bord !</Title>;
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Chargement du tableau de bord..." />
        </Content>
      </Layout>
    );
  }

  if (!user) {
    return <Empty description="Impossible de charger le profil utilisateur. Veuillez vous reconnecter." />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          if (broken) {
            setMobileDrawerVisible(true);
          }
        }}
        className="dashboard-sider"
        width={200}
      >
        {renderSidebar()}
      </Sider>
      <Layout className={`site-layout ${collapsed ? 'collapsed' : ''}`}>
        <div className={`dashboard-header-placeholder ${collapsed ? 'collapsed' : ''}`} />
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: antdToken.colorBgContainer, 
          borderRadius: antdToken.borderRadiusLG,
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>

      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileDrawerVisible(false)}
        open={isMobile && mobileDrawerVisible}
        width={250}
        bodyStyle={{ padding: 0 }}
        className="mobile-drawer"
        handler={false}
      >
        <Button 
          icon={<CloseOutlined />} 
          onClick={() => setMobileDrawerVisible(false)} 
          className="drawer-close-button"
        />
        {renderSidebar()}
      </Drawer>

      <Modal
        title="Publier une nouvelle offre d'emploi"
        open={isPostJobModalVisible}
        onCancel={() => setIsPostJobModalVisible(false)}
        footer={null}
        width={800}
        className="post-job-modal"
      >
        <PostJobForm onJobPosted={handleJobPosted} employerId={user?._id} />
      </Modal>

      <Modal
        title="Mettre à jour le profil employeur"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
        className="edit-profile-modal"
      >
        {user && (
          <EmployerProfileForm initialData={user} onSubmit={handleUpdateProfile} onCancel={() => setIsEditModalVisible(false)} />
        )}
      </Modal>
    </Layout>
  );
}

export default EmployerDashboard; 