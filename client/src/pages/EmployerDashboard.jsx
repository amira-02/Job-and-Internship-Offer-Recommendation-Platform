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
// import { Row, Col, Card, Button, Title } from 'antd';
import { CheckOutlined, RocketOutlined, SyncOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
// const user = JSON.parse(localStorage.getItem("user")) || {};
  console.log("User Data:", user); 
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
    <div className="company-profile" style={{ padding: '24px', textAlign: 'center' }}>
      <Avatar 
        size={collapsed ? 48 : 64} 
        icon={<BankOutlined />} 
        style={{ backgroundColor: '#3b82f6', marginBottom: 12 }}
      />

      {!collapsed && (
        <>
          <Title level={5} style={{ marginBottom: 8 }}>{user?.companyName || 'Entreprise'}</Title>

          <div style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'left', marginBottom: 12 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <GlobalOutlined style={{ color: '#3b82f6' }} />
              <span>{user?.website || 'N/A'}</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <PhoneOutlined style={{ color: '#3b82f6' }} />
              <span>{user?.phone || 'Non renseigné'}</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <EnvironmentOutlined style={{ color: '#3b82f6' }} />
              <span>{user?.location || 'Non spécifié'}</span>
            </p>
          </div>

          <Progress 
            percent={75} 
            size="small" 
            status="active" 
            strokeColor="#3b82f6"
            style={{ marginTop: 8 }}
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
      style={{ borderRight: 'none', marginTop: 16 }}
    >
      <Menu.Item key="1" icon={<UserOutlined />}>
        Dashboard
      </Menu.Item>
      <Menu.Item key="2" icon={<FileTextOutlined />}>
        Mes Offres
      </Menu.Item>
      <Menu.Item key="4" icon={<PlusOutlined />}>
        Poster une Offre
      </Menu.Item>
      <Menu.Item key="5" icon={<StarOutlined />}>
        Candidats Sauvegardés
      </Menu.Item>
      <Menu.Item key="6" icon={<CreditCardOutlined />}>
        Abonnement & Paiement
      </Menu.Item>
      <Menu.Item key="7" icon={<NotificationOutlined />}>
        Notifications
      </Menu.Item>
      <Menu.Item key="edit-profile" icon={<SettingOutlined />}>
        Modifier le Profil
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Déconnexion
      </Menu.Item>
    </Menu>
  </>
);

const renderJobOffers = () => {
  if (loadingJobs) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, fontSize: '16px', color: '#6b7280' }}>Chargement des offres d'emploi...</p>
      </div>
    );
  }

  if (jobOffers.length === 0) {
    return (
      <Empty
        description={<span style={{ color: '#9ca3af' }}>Aucune offre d'emploi publiée.</span>}
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {jobOffers.map(offer => (
        <Col xs={24} sm={12} md={8} key={offer._id}>
          <Card
            hoverable
            style={{
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
            }}
            title={
              <div style={{ fontWeight: 600, fontSize: '18px', color: '#1f2937' }}>
                {offer.jobTitle}
              </div>
            }
            extra={
              <Link to={`/job-offers/${offer._id}`} style={{ fontSize: '14px', color: '#3b82f6' }}>
                <EyeOutlined style={{ marginRight: 4 }} />
                Voir
              </Link>
            }
            actions={[
              <Tooltip title="Modifier">
                <EditOutlined key="edit" onClick={() => navigate(`/edit-job-offer/${offer._id}`)} />
              </Tooltip>,
              <Tooltip title="Supprimer">
                <DeleteOutlined key="delete" onClick={() => console.log('Delete')} />
              </Tooltip>,
            ]}
          >
            <p style={{ marginBottom: 8 }}>
              <strong>📂 Catégorie :</strong>{' '}
              <Tag color="blue">{offer.jobCategory}</Tag>
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>🕘 Type :</strong>{' '}
              <Tag color="green">{offer.jobType}</Tag>
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>💰 Salaire :</strong>{' '}
              <span style={{ color: '#10b981' }}>
                {offer.minSalary} - {offer.maxSalary} {offer.salaryPeriod}
              </span>
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>📍 Localisation :</strong>{' '}
              {offer.address}, {offer.country}
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>🧠 Compétences :</strong>{' '}
              {offer.skills.map(skill => (
                <Tag key={skill} color="geekblue" style={{ marginBottom: 4 }}>{skill}</Tag>
              ))}
            </p>
            <p style={{ marginBottom: 16 }}>
              <strong>🎓 Expérience :</strong>{' '}
              {offer.experienceLevel}
            </p>

            <Button
              type="primary"
              block
              icon={<UserOutlined />}
              onClick={() => navigate(`/employer/offers/${offer._id}/candidates`)}
              style={{ marginTop: 12, borderRadius: '8px' }}
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
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const responsiveCardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    overflow: 'hidden'
  };

  const cardHeadStyle = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1f2937',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px'
  };

  switch (selectedMenuItem) {
    case 'dashboard':
    case '1':
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

        const stats = [
    {
      title: "Total Offres",
      value: jobOffers.length,
      icon: <LaptopOutlined />,
      color: '#4361ee',
      bgColor: 'rgba(67, 97, 238, 0.1)',
      trend: '+12%',
      description: 'Total job postings'
    },
    {
      title: "Candidatures",
      value: 120,
      icon: <TeamOutlined />,
      color: '#38b000',
      bgColor: 'rgba(56, 176, 0, 0.1)',
      trend: '+23%',
      description: 'Total candidates'
    },
    {
      title: "Offres Actives",
      value: jobOffers.filter(job => job.status === 'active').length,
      icon: <CheckCircleOutlined />,
      color: '#ff9e00',
      bgColor: 'rgba(255, 158, 0, 0.1)',
      trend: '+8%',
      description: 'Currently active'
    },
    {
      title: "Vues Totales",
      value: 1500,
      icon: <EyeOutlined />,
      color: '#ff0054',
      bgColor: 'rgba(255, 0, 84, 0.1)',
      trend: '+45%',
      description: 'Job views'
    }
  ];


  const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: '#3b82f6' }}>{`${payload[0].name || payload[0].dataKey}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

      return (
        <div className="dashboard-content">
          
        <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <div
              style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          borderLeft: `4px solid ${stat.color}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: stat.bgColor,
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                fontSize: '18px',
              }}
            >
              {stat.icon}
            </div>

            <div
              style={{
                background: 'rgba(56, 176, 0, 0.1)',
                color: stat.color,
                borderRadius: '20px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {stat.trend}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1f2937',
                lineHeight: '1.2',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px',
              }}
            >
              {stat.title}
            </div>
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '8px',
            }}
          >
            {stat.description}
          </div>
        </div>
      </div>
    </Col>
  ))}
           

           <Col xs={24} lg={12}>
  <Card 
    title="Candidatures par Mois" 
    bordered={false} 
    className="dashboard-card"
    style={{ 
      borderRadius: '12px', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)', 
      background: '#ffffff',
      overflow: 'hidden'
    }}
    headStyle={{ 
      fontSize: '1.2rem', 
      fontWeight: 600, 
      color: '#1f2937', 
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb'
    }}
  >
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={applicationsData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="applications" 
          stroke="#1890ff" 
          fill="url(#colorUv)" 
          fillOpacity={1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
</Col>

<Col xs={24} lg={12}>
  <Card 
    title="Sources des Candidats" 
    bordered={false} 
    className="dashboard-card"
    style={{ 
      borderRadius: '12px', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)', 
      background: '#ffffff',
      overflow: 'hidden'
    }}
    headStyle={{ 
      fontSize: '1.2rem', 
      fontWeight: 600, 
      color: '#1f2937', 
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb'
    }}
  >
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={candidateSourcesData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#1890ff" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="url(#colorBar)" 
          barSize={40} 
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
        />
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
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Title level={3}>Mes Offres d'Emploi</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handlePostJob} size="large">Publier une nouvelle offre</Button>
          </div>
          {renderJobOffers()}
        </div>
      );

    case '3':
      return (
        <div className="messages-section">
          <Title level={3}>Messages</Title>
          <Card bordered={false}><Empty description="Aucun message pour le moment" /></Card>
        </div>
      );

    case '4':
      return (
        <div className="post-job-section">
          <Title level={3}>Publier une Offre d'Emploi</Title>
          <Card bordered={false}><PostJobForm onJobPosted={handleJobPosted} employerId={user?._id} /></Card>
        </div>
      );

    case '5':
      return (
        <div className="saved-candidates-section">
          <Title level={3}>Candidats Sauvegardés</Title>
          <Card bordered={false}><Empty description="Aucun candidat sauvegardé" /></Card>
        </div>
      );

    case '6':
      return (
       <div className="subscription-section">
  <Title level={3}>Abonnement & Facturation</Title>
  <Row gutter={[24, 24]} style={{ padding: '24px 0' }}>
    <Col xs={24} sm={12} md={6}>
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
          textAlign: 'center', 
          padding: '20px', 
          background: '#ffffff',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 500 }}>Free Lite</span>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>It's totally free</p>
        </div>
        <h3 style={{ color: '#1f2937', fontSize: '32px', fontWeight: 700, margin: '8px 0' }}>$0</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>One time Payment</p>
        <Button type="primary" style={{ background: '#3b82f6', borderColor: '#3b82f6', width: '100%', marginBottom: '24px' }} disabled>
          Current Plan
        </Button>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Up to 1 User</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> All UI components</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Lifetime access</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Free updates</li>
          <li style={{ color: '#ef4444', marginBottom: '8px' }}><CloseOutlined /> Community Support</li>
          <li style={{ color: '#ef4444', marginBottom: '8px' }}><CloseOutlined /> Downloadable Files</li>
        </ul>
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
          textAlign: 'center', 
          padding: '20px', 
          background: '#ffffff',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 500 }}>Starter</span>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>Single Site</p>
          <RocketOutlined style={{ fontSize: '24px', color: '#3b82f6', marginTop: '8px' }} />
        </div>
        <h3 style={{ color: '#1f2937', fontSize: '32px', fontWeight: 700, margin: '8px 0' }}>$39-$29</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>One time Payment</p>
        <Button type="primary" style={{ background: '#1f2937', borderColor: '#1f2937', width: '100%', marginBottom: '24px' }}>
          Get the plan
        </Button>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Up to 5 Users</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> All UI components</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Lifetime access</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Free updates</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Community Support</li>
          <li style={{ color: '#ef4444', marginBottom: '8px' }}><CloseOutlined /> Downloadable Files</li>
        </ul>
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
          textAlign: 'center', 
          padding: '20px', 
          background: '#ffffff',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 500 }}>Business</span>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>Unlimited sites</p>
          <SyncOutlined style={{ fontSize: '24px', color: '#3b82f6', marginTop: '8px' }} />
        </div>
        <h3 style={{ color: '#1f2937', fontSize: '32px', fontWeight: 700, margin: '8px 0' }}>$99-$59</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>One time Payment</p>
        <Button type="primary" style={{ background: '#1f2937', borderColor: '#1f2937', width: '100%', marginBottom: '24px' }}>
          Get the plan
        </Button>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Up to 10 Users</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> All UI components</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Lifetime access</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Free updates</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Community Support</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Downloadable Files</li>
        </ul>
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
          textAlign: 'center', 
          padding: '20px', 
          background: '#ffffff',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 500 }}>Extended</span>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>For paying users</p>
          <ShoppingCartOutlined style={{ fontSize: '24px', color: '#3b82f6', marginTop: '8px' }} />
        </div>
        <h3 style={{ color: '#1f2937', fontSize: '32px', fontWeight: 700, margin: '8px 0' }}>$259-$189</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>One time Payment</p>
        <Button type="primary" style={{ background: '#1f2937', borderColor: '#1f2937', width: '100%', marginBottom: '24px' }}>
          Get the plan
        </Button>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Up to 50 Users</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> All UI components</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Lifetime access</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Free updates</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Community Support</li>
          <li style={{ color: '#10b981', marginBottom: '8px' }}><CheckOutlined /> Downloadable Files</li>
        </ul>
      </Card>
    </Col>
  </Row>
</div>
      );

    case '7':
      return (
        <div className="notifications-section">
          <Title level={3}>Notifications</Title>
          <Card bordered={false}><Empty description="Aucune notification" /></Card>
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
        width={250}
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

      {/* <Modal
        title="Publier une nouvelle offre d'emploi"
        open={isPostJobModalVisible}
        onCancel={() => setIsPostJobModalVisible(false)}
        footer={null}
        width={800}
        className="post-job-modal"
      >
        <PostJobForm onJobPosted={handleJobPosted} employerId={user?._id} />
      </Modal> */}

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