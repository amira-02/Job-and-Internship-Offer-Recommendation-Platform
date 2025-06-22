import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  Button,
  Spin,
  Typography,
  Row,
  Col,
  Avatar,
  Tag,
  Divider,
  Popconfirm,
  message,
  Space,
  Badge,
  Modal 
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  MailOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  ArrowLeftOutlined,
  SolutionOutlined,
  CheckOutlined,
  CloseOutlined,
  DashboardOutlined,
  SearchOutlined 
} from '@ant-design/icons';



const { Title, Text } = Typography;

const OfferCandidates = () => {
  const { id } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/joboffers/${id}/candidates`);
        setCandidates(res.data.candidates || []);
      } catch (err) {
        setCandidates([]);
        message.error("Erreur lors du chargement des candidats.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [id]);

  const handleDecision = async (offerId, candidate, decision) => {
    try {
      await axios.post(`http://localhost:3000/api/joboffers/${offerId}/decision`, {
        userId: candidate._id,
        decision,
        email: candidate.email,
        firstName: candidate.firstName,
        offerTitle: candidate.offerTitle,
      });

      message.success(`Statut mis à jour : ${decision === 'accepted' ? 'Accepté' : 'Refusé'}`);

      setCandidates((prevCandidates) =>
        prevCandidates.map((c) =>
          c._id === candidate._id ? { ...c, status: decision } : c
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de la décision :", error.response?.data || error.message);
      message.error("Erreur lors de l'envoi de la décision.");
    }
  };

const [analyses, setAnalyses] = useState([]);

const handleAnalyzeCandidates = async () => {
  try {
    console.log("🕵️‍♀️ Début de l’analyse des candidats pour l’offre ID :", id);

    const response = await axios.get(`http://localhost:3000/api/${id}/analyze-candidates`);
    const candidates = response.data.allCandidates || [];

    console.log("✅ Candidats analysés :", candidates);

    setAnalyses(candidates);
    message.success("✅ Analyse terminée !");
  } catch (err) {
    console.error("❌ Erreur Axios lors de l’analyse des candidats :", err);

    if (err.response) {
      console.log("📛 Statut HTTP :", err.response.status);
      console.log("📦 Données de l’erreur :", err.response.data);
      console.log("🌐 URL appelée :", err.config.url);
    } else {
      console.log("🌐 Erreur réseau ou autre :", err.message);
    }

    message.error("⚠️ Échec de l’analyse des candidats.");
  }
};



  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Boutons de navigation en haut */}
      <Space style={{ marginBottom: 24 }}>
        <Button 
          onClick={() => navigate(-1)} 
          icon={<ArrowLeftOutlined />}
          type="default"
        >
          Retour aux offres
        </Button>
        <Button 
          onClick={() => navigate('/dashboard')} 
          icon={<DashboardOutlined />}
          type="primary"
        >
          Tableau de bord
        </Button>
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={handleAnalyzeCandidates}
        >
          Analyser tous les CVs
        </Button>
      </Space>
      
      <Title level={2} style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <SolutionOutlined style={{ marginRight: 12, color: '#1890ff' }} />
        Candidats pour cette offre
        {!loading && (
          <Tag color="blue" style={{ marginLeft: 12, fontSize: 14, padding: '2px 8px' }}>
            {candidates.length} candidat{candidates.length !== 1 ? 's' : ''}
          </Tag>
        )}
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" tip="Chargement des candidats..." />
        </div>
      ) : candidates.length === 0 ? (
        <Card 
          style={{ 
            borderRadius: 12, 
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            maxWidth: 600,
            margin: '0 auto'
          }}
        >
          <div style={{ padding: 40 }}>
            <img 
              src="https://img.freepik.com/vecteurs-libre/aucune-donnee-concept-illustration_114360-626.jpg?w=826&t=st=1718201120~exp=1718201720~hmac=dd0c0d0b0a8f8c8d7f8b8b0c6e9a9d7a7d6c1a7c0e3b1d3e9c7a8d8d9d7f8f8" 
              alt="No candidates" 
              style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 24 }}
            />
            <Title level={4} style={{ color: '#6b7280' }}>Aucun candidat pour cette offre</Title>
            <Text style={{ color: '#9ca3af', display: 'block', marginBottom: 24 }}>
              Les candidats apparaîtront ici lorsqu'ils postuleront à votre offre.
            </Text>
            <Space>
              <Button 
                onClick={() => navigate(-1)} 
                icon={<ArrowLeftOutlined />}
              >
                Retour aux offres
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                icon={<DashboardOutlined />}
                type="primary"
              >
                Tableau de bord
              </Button>
            </Space>
          </div>
        </Card>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {candidates.map((candidate) => {
            const application = candidate.appliedOffers?.find(app => app._id === id); // `id` est l'id de l'offre

    const status = application?.status || 'pending'; // default fallback
    const statusColor = status === 'accepted' ? 'green'
                      : status === 'rejected' ? 'red'
                      : status === 'canceled' ? 'gray'
                      : 'geekblue';

    const statusText = status === 'accepted' ? 'Accepté'
                      : status === 'rejected' ? 'Refusé'
                      : status === 'canceled' ? 'Annulé'
                      : 'En attente';
              
              return (
                <Col xs={24} sm={24} md={12} lg={8} xl={8} key={candidate._id}>
                  <Badge.Ribbon 
                    text={statusText} 
                    color={statusColor}
                    style={{ 
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '0 8px',
                      height: 28,
                      lineHeight: '28px'
                    }}
                  >
                    <Card
                      hoverable
                      style={{ 
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #f0f0f0',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                      }}
                      bodyStyle={{ 
                        padding: 20,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', marginBottom: 16 }}>
                        <Avatar
                          size={64}
                          src={`http://localhost:3000/api/users/${candidate._id}/photo`}
                          icon={!candidate.profilePicture && <UserOutlined />}
                          style={{ 
                            marginRight: 16,
                            border: '2px solid #e6f7ff',
                            backgroundColor: '#f5f5f5'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Title level={4} style={{ marginBottom: 4, color: '#1f2937' }}>
                            {candidate.firstName} {candidate.lastName}
                          </Title>
                          
                          <Space size={8} wrap>
                            <Tag 
                              icon={candidate.isVerified ? 
                                <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                              color={candidate.isVerified ? 'green' : 'orange'}
                              style={{ marginBottom: 4 }}
                            >
                              {candidate.isVerified ? 'Vérifié' : 'Non vérifié'}
                            </Tag>
                          </Space>
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <MailOutlined style={{ color: '#1890ff', marginRight: 12, marginTop: 4 }} />
                            <Text style={{ flex: 1 }}>{candidate.email}</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 12, marginTop: 4 }} />
                            <Text style={{ flex: 1 }}>
                              {candidate.address}, {candidate.postalCode} {candidate.city}
                            </Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <CalendarOutlined style={{ color: '#1890ff', marginRight: 12, marginTop: 4 }} />
                            <Text style={{ flex: 1 }}>
                              Inscrit le {new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Text>
                          </div>
                        </Space>
                      </div>

                      <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
                      
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: '#1f2937' }}>
                          <FilePdfOutlined style={{ marginRight: 8 }} /> CV
                        </Text>
                        
                        {candidate.cv && candidate.cv.length > 0 ? (
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {candidate.cv.map((cvItem, index) => (
                              <Button 
                                key={index}
                                type="link"
                                icon={<FilePdfOutlined style={{ color: '#e74c3c' }} />}
                                href={`http://localhost:3000/api/auth/cv/${candidate._id}/${index}`}
                                target="_blank"
                                style={{ 
                                  padding: 0,
                                  height: 'auto',
                                  textAlign: 'left',
                                  display: 'block'
                                }}
                              >
                                <Text style={{ color: '#1890ff' }}>{cvItem.fileName || `CV_${candidate.lastName}_${index + 1}.pdf`}</Text>
                              </Button>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">Aucun CV disponible</Text>
                        )}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
                        <Space 
                          size={12} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap'
                          }}
                        >
                          <Popconfirm
                            title="Confirmer l'acceptation de ce candidat ?"
                            description="Un email de confirmation sera envoyé au candidat."
                            onConfirm={() => handleDecision(id, candidate, 'accepted')}
                            okText="Confirmer"
                            cancelText="Annuler"
                            okButtonProps={{ type: 'primary', danger: false }}
                          >
                            <Button 
                              type="primary" 
                              style={{ 
                                flex: 1,
                                backgroundColor: '#10b981',
                                borderColor: '#10b981',
                                minWidth: 120
                              }}
                              icon={<CheckOutlined />}
                              disabled={candidate.status === 'accepted'}
                            >
                              Accepter
                            </Button>
                          </Popconfirm>

                          <Popconfirm
                            title="Confirmer le refus de ce candidat ?"
                            description="Un email de refus sera envoyé au candidat."
                            onConfirm={() => handleDecision(id, candidate, 'rejected')}
                            okText="Confirmer"
                            cancelText="Annuler"
                            okButtonProps={{ type: 'primary', danger: true }}
                          >
                            <Button 
                              danger
                              style={{ 
                                flex: 1,
                                minWidth: 120
                              }}
                              icon={<CloseOutlined />}
                              disabled={candidate.status === 'rejected'}
                            >
                              Refuser
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
            {analyses.length > 0 && (
  <>
    <Divider />
    <Typography.Title level={3}>📊 Rapport d'analyse des candidats</Typography.Title>
    {analyses.map((a) => (
      <Card key={a.candidateId} title={`${a.candidateName} (Score: ${a.averageScore}/10)`} style={{ marginBottom: 16 }}>
        {a.rawAnalyses.length > 0 ? (
          a.rawAnalyses.map((cv, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <Typography.Text strong>📄 CV : {cv.file}</Typography.Text>
              <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                {cv.analysis}
              </Typography.Paragraph>
            </div>
          ))
        ) : (
          <Typography.Text type="secondary">Aucune analyse disponible pour ce candidat.</Typography.Text>
        )}
      </Card>
    ))}
  </>
)}


         
          {/* Boutons de navigation en bas */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Space>
              <Button 
                onClick={() => navigate(-1)} 
                icon={<ArrowLeftOutlined />}
                style={{ minWidth: 180 }}
                size="large"
              >
                Retour aux offres
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                icon={<DashboardOutlined />}
                type="primary"
                style={{ minWidth: 180 }}
                size="large"
              >
                Tableau de bord
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default OfferCandidates;