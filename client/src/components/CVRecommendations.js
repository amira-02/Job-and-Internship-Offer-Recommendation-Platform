import React from 'react';
import { Card, List, Typography, Progress, Tag, Space, Divider } from 'antd';
import { CheckCircleOutlined, WarningOutlined, BulbOutlined, TagsOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CVRecommendations = ({ cvAnalysis }) => {
    if (!cvAnalysis) {
        return (
            <Card>
                <Text>Aucune analyse de CV disponible</Text>
            </Card>
        );
    }

    return (
        <Card className="cv-recommendations">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Score Global */}
                <div>
                    <Title level={4}>Score Global</Title>
                    <Progress 
                        type="circle" 
                        percent={cvAnalysis.scoreGlobal * 10} 
                        format={percent => `${cvAnalysis.scoreGlobal}/10`}
                        status={cvAnalysis.scoreGlobal >= 7 ? "success" : cvAnalysis.scoreGlobal >= 5 ? "normal" : "exception"}
                    />
                </div>

                <Divider />

                {/* Points Forts */}
                <div>
                    <Title level={4}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        Points Forts
                    </Title>
                    <List
                        dataSource={cvAnalysis.pointsForts}
                        renderItem={item => (
                            <List.Item>
                                <Text>{item}</Text>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Points Faibles */}
                <div>
                    <Title level={4}>
                        <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        Points à Améliorer
                    </Title>
                    <List
                        dataSource={cvAnalysis.pointsFaibles}
                        renderItem={item => (
                            <List.Item>
                                <Text>{item}</Text>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Recommandations */}
                <div>
                    <Title level={4}>
                        <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        Recommandations
                    </Title>
                    <List
                        dataSource={cvAnalysis.recommandations}
                        renderItem={item => (
                            <List.Item>
                                <Text>{item}</Text>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Mots-clés */}
                <div>
                    <Title level={4}>
                        <TagsOutlined style={{ marginRight: 8 }} />
                        Mots-clés Suggérés
                    </Title>
                    <Space wrap>
                        {cvAnalysis.motsClesSuggérés.map((motCle, index) => (
                            <Tag key={index} color="blue">
                                {motCle}
                            </Tag>
                        ))}
                    </Space>
                </div>
            </Space>
        </Card>
    );
};

export default CVRecommendations; 