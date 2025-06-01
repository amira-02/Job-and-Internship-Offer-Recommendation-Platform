import React, { useState } from 'react';
import { Card, Button, Modal, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import CVRecommendations from './CVRecommendations';

const Profile = ({ user }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showRecommendations = () => {
        if (!user.cv || !user.cv.analysis) {
            message.warning('Aucune analyse de CV disponible. Veuillez d\'abord télécharger votre CV.');
            return;
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <Card title="Profil Utilisateur">
            {/* Autres informations du profil */}
            <div style={{ marginTop: 16 }}>
                <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    onClick={showRecommendations}
                >
                    Voir les Recommandations CV
                </Button>
            </div>

            <Modal
                title="Analyse de votre CV"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <CVRecommendations cvAnalysis={user.cv?.analysis} />
            </Modal>
        </Card>
    );
};

export default Profile; 