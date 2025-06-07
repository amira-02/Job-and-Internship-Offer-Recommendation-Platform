import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import {
  UserOutlined, 
  BankOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

function EmployerProfileForm({ initialValues, onSubmit, onCancel }) {
  const [form] = Form.useForm();

  // Mettre à jour le formulaire quand les initialValues changent
  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues} // Initialisez le formulaire avec les données existantes
      className="edit-profile-form"
    >
      <Form.Item
        name="companyName"
        label="Nom de l'entreprise"
        rules={[{ required: true, message: "Veuillez entrer le nom de l'entreprise" }]}
      >
        <Input prefix={<BankOutlined />} />
      </Form.Item>

      <Form.Item
        name="fullName"
        label="Nom du contact"
        rules={[{ required: true, message: "Veuillez entrer le nom du contact" }]} // Assurez-vous que ceci correspond à votre schéma
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
        <Space>
          <Button onClick={onCancel}>
            Annuler
          </Button>
          <Button type="primary" htmlType="submit">
            Enregistrer
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default EmployerProfileForm; 