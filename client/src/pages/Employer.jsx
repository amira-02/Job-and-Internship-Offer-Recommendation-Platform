import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Radio, Select, Checkbox, Upload } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, BankOutlined, UploadOutlined } from '@ant-design/icons';
import '../styles/Employer.css';

const { Option } = Select;

function Employer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Employer component mounted');
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Form values before processing:', values);
    
    try {
      // Vérifier que les mots de passe correspondent
      if (values.password !== values.confirmPassword) {
        message.error('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      // Supprimer confirmPassword car il n'est pas nécessaire côté serveur
      const { confirmPassword, ...dataToSend } = values;

      // S'assurer que tous les champs requis sont présents
      const requiredFields = {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        companyName: values.companyName,
        phone: values.phone,
        location: values.location,
        agreement: values.agreement
      };

      // Vérifier si tous les champs requis sont remplis
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        message.error(`Veuillez remplir tous les champs requis: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('Data being sent to server:', dataToSend);

      const response = await fetch('http://localhost:3000/api/employer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        // Sauvegarder le token dans le localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        message.success('Inscription réussie ! Bienvenue sur votre espace employeur.');
        
        // Rediriger vers le dashboard employeur
        navigate('/employer/dashboard');
      } else {
        if (data.errors) {
          data.errors.forEach(error => message.error(error));
        } else {
          message.error(data.message || 'Échec de l\'inscription. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Failed to fetch') {
        message.error('Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.');
      } else {
        message.error('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dummy upload function for Ant Design Upload component
  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <div className="employer-container">
      <Card className="employer-card">
        <div className="header-section">
          <h1>Create Your Employer Space</h1>
          <p className="subtitle">It only takes 5 seconds :)</p>

          {/* Radio Button Group */}
          <div className="job-search-type">
            <span>I am looking for</span>
            <Radio.Group defaultValue="publish">
              <Radio value="search">A job</Radio>
              <Radio value="publish">To post offers</Radio>
            </Radio.Group>
          </div>
        </div>
        
        <div className="main-content">
          {/* Left Column: Benefits and Social Login */}
          <div className="left-column">
            <div className="benefits-section">
              <p className="benefits-title">💡 Creating a Tanitjobs profile will help you to</p>
              <ul>
                <li>» Access the largest database of Tunisian professional talents</li>
                <li>» Control your hiring process from start to finish</li>
                <li>» Save time by contacting the right candidates</li>
              </ul>
            </div>

            <div className="social-login-section">
              <p className="social-login-text">🧡 Connect via social networks</p>
              <Button
                type="primary"
                className="facebook-button"
                size="large"
                // onClick handler for Facebook login
              >
                Sign in with Facebook
              </Button>
            </div>

            <div className="jobseeker-section">
              <p className="jobseeker-text">Looking for a job?</p>
              <p>If you are looking for a job, go to the <a href="/register">Registration</a> section for job seekers</p>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="right-column">
            <Form
              name="employer_registration"
              onFinish={onFinish}
              layout="vertical"
              className="employer-form"
            >
              <div className="form-row">
                <Form.Item
                  name="email"
                  label="Email *"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                  className="form-item-half"
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  name="fullName"
                  label="Full Name: *"
                  rules={[{ required: true, message: 'Please input your full name!' }]
                  }
                  className="form-item-half"

                >
                  <Input size="large" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="password"
                  label="Password *"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                  className="form-item-half"
                >
                  <Input.Password size="large" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password *"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                  className="form-item-half"
                >
                  <Input.Password size="large" />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="companyName"
                  label="Company Name *"
                  rules={[{ required: true, message: 'Please input your company name!' }]}
                  className="form-item-half"
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  name="website"
                  label="Website"
                  className="form-item-half"
                >
                  <Input size="large" />
                </Form.Item>
              </div>

               <div className="form-row">
                <Form.Item
                  name="phone"
                  label="Phone *"
                   rules={[{ required: true, message: 'Please input your phone number!' }]}
                  className="form-item-half"
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  name="location"
                  label="Location (Address) *"
                   rules={[{ required: true, message: 'Please input your location!' }]}
                  className="form-item-half"
                >
                  <Input size="large" />
                </Form.Item>
              </div>

           

              <Form.Item
                name="description"
                label="Company Description"
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              

              

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')),
                  },
                ]}
              >
                <Checkbox>I accept the <a href="#">terms of use</a> *</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="register-button"
                  size="large"
                >
                  REGISTER
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Login Link at the bottom */}
        <div className="footer-link">
          Already have an account? <a href="/login">Sign In</a>
        </div>

      </Card>
    </div>
  );
}

export default Employer; 