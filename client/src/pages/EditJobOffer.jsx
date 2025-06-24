import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, message, InputNumber } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const EditJobOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Charger les données de l'offre
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/joboffers/${id}`);


        // Préparer les données pour le formulaire
        const data = {
          ...res.data,
          skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : '',
        };

        form.setFieldsValue(data);
      } catch (error) {
        message.error("Impossible de charger l'offre");
      }
    };
    fetchOffer();
  }, [id, form]);

  // Envoyer les données modifiées
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Transformer skills string en tableau avant envoi
      const payload = {
        ...values,
        skills: values.skills
          ? values.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : [],
      };

      await axios.put(`http://localhost:3000/api/joboffers/edit-job-offer/${id}`, payload,{ withCredentials: true });

      message.success("Offre mise à jour avec succès !");
      navigate('/employer/dashboard');
    } catch (error) {
      message.error("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: '40px' }}>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '2.8rem',
          fontWeight: 700,
          marginBottom: 30,
          background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}
      >
        Modifier l'Offre d'Emploi
      </h1>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="jobTitle" label="Titre du poste" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="jobDescription" label="Description" rules={[{ required: true }]}>
          <TextArea rows={5} />
        </Form.Item>

        <Form.Item name="jobCategory" label="Catégorie" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="jobType" label="Type de contrat" rules={[{ required: true }]}>
          <Select>
            <Option value="Full Time">Full Time</Option>
            <Option value="Part Time">Part Time</Option>
            <Option value="Freelance">Freelance</Option>
            <Option value="Internship">Internship</Option>
            <Option value="Contract">Contract</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="experienceLevel"
          label="Niveau d'expérience"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="Entry Level">Entry Level</Option>
            <Option value="Associate">Associate</Option>
            <Option value="Mid-Senior Level">Mid-Senior Level</Option>
            <Option value="Director">Director</Option>
            <Option value="Executive">Executive</Option>
          </Select>
        </Form.Item>

        <Form.Item name="salaryPeriod" label="Période de salaire" rules={[{ required: true }]}>
          <Select>
            <Option value="monthly">Mensuel</Option>
            <Option value="yearly">Annuel</Option>
            <Option value="hourly">Horaire</Option>
          </Select>
        </Form.Item>

        <Form.Item name="minSalary" label="Salaire minimum" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item name="maxSalary" label="Salaire maximum" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="skills"
          label="Compétences (séparées par des virgules)"
          rules={[{ required: true }]}
        >
          <Input placeholder="ex: JavaScript, React, Node.js" />
        </Form.Item>

        <Form.Item name="address" label="Adresse" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="country" label="Pays" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="sourceUrl" label="Source (URL)">
          <Input type="url" />
        </Form.Item>

        <Form.Item
          name="Offerstatus"
          label="Statut de l'offre"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="expired">Expirée</Option>
            <Option value="draft">Brouillon</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Mettre à jour l'offre
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditJobOffer;
