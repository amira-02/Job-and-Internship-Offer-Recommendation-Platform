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
  Descriptions,
  Tag,
  Divider,
  Popconfirm,
  message,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const OfferCandidates = () => {
  const { id } = useParams(); // id de l'offre
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
    const response = await axios.post(`http://localhost:3000/api/joboffers/${offerId}/decision`, {
        userId: candidate._id,
      decision, // 'accepted' ou 'rejected'
      email: candidate.email,
      firstName: candidate.firstName,
      offerTitle: candidate.offerTitle,
    });

    message.success(`Statut mis à jour : ${decision}`);

    // Mise à jour locale du candidat dans le state
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


  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Retour
      </Button>
      <Title level={2}>Candidats pour cette offre</Title>

      {loading ? (
        <Spin />
      ) : candidates.length === 0 ? (
        <p>Aucun candidat pour cette offre.</p>
      ) : (
        <Row gutter={[24, 24]}>
          {candidates.map((candidate) => (
            <Col xs={24} sm={12} md={8} key={candidate._id}>
              <Card
                hoverable
                bordered
                style={{ borderRadius: 12 }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Avatar
                    size={64}
                    src={`http://localhost:3000/api/users/${candidate._id}/photo`}
                    icon={!candidate.profilePicture && <UserOutlined />}
                    style={{ marginRight: 16 }}
                  />
                  <div>
                    <Text strong>{candidate.firstName} {candidate.lastName}</Text><br />
                    <Text type="secondary">{candidate.email}</Text><br />
                    <Tag color={candidate.isVerified ? 'green' : 'red'} style={{ marginTop: 4 }}>
                      {candidate.isVerified ? (
                        <>
                          <CheckCircleOutlined /> Vérifié
                        </>
                      ) : (
                        <>
                          <CloseCircleOutlined /> Non vérifié
                        </>
                      )}
                    </Tag>
                  </div>
                </div>

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Adresse">{candidate.address}</Descriptions.Item>
                  <Descriptions.Item label="Ville">{candidate.city}</Descriptions.Item>
                  <Descriptions.Item label="Gouvernorat">{candidate.governorate}</Descriptions.Item>
                  <Descriptions.Item label="Code Postal">{candidate.postalCode}</Descriptions.Item>
                  <Descriptions.Item label="Inscrit le">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>

                <Divider style={{ marginTop: 16, marginBottom: 8 }} />
                <Text strong>CV :</Text>
                {candidate.cv && candidate.cv.length > 0 ? (
                  <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    {candidate.cv.map((cvItem, index) => (
                      <li key={index}>
                        <a
                          href={`http://localhost:3000/api/auth/cv/${candidate._id}/${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cvItem.fileName || `CV #${index + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text type="secondary">Aucun CV</Text>
                )}

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Popconfirm
                    title="Confirmer l'acceptation ?"
                    onConfirm={() => handleDecision(id, candidate, 'accepted')} // <-- ici on passe l'id de l'offre
                    okText="Oui"
                    cancelText="Non"
                  >
                    <Button type="primary" style={{ backgroundColor: '#52c41a' }}>
                      Accepter
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Confirmer le refus ?"
                    onConfirm={() => handleDecision(id, candidate, 'rejected')} // <-- idem ici
                    okText="Oui"
                    cancelText="Non"
                  >
                    <Button danger>Refuser</Button>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default OfferCandidates;
