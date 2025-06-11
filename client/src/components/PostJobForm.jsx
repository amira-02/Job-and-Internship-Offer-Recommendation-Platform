import React, { useState } from 'react';
import { Form, Input, Button, Select, Tag, Space, Typography, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const { Title } = Typography;
const { Option } = Select;

const PostJobForm = ({ onJobPosted }) => {
  const [form] = Form.useForm();
  const [skills, setSkills] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [cookies] = useCookies(['jwt']);

  const handleCloseSkill = (removedSkill) => {
    const newSkills = skills.filter((skill) => skill !== removedSkill);
    setSkills(newSkills);
  };

  const showSkillInput = () => {
    setInputVisible(true);
  };

  const handleSkillInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddSkill = () => {
    if (inputValue && skills.indexOf(inputValue) === -1) {
      setSkills([...skills, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleFormSubmit = async (values) => {
    try {
      const jobData = {
        ...values,
        skills: skills,
      };

      if (!cookies.jwt) {
        message.error('Authentification requise. Veuillez vous connecter.');
        return;
      }

      const response = await axios.post('http://localhost:3000/api/joboffers', jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Offre d\'emploi publiée avec succès !');
        form.resetFields();
        setSkills([]);
        if (onJobPosted) {
          onJobPosted();
        }
      } else {
        message.error(response.data.message || 'Erreur lors de la publication de l\'offre');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      message.error(error.response?.data?.message || 'Une erreur est survenue lors de la soumission du formulaire');
    }
  };

  // Placeholder options for Job Category, Job Type, Experience, Industry, Country
  const jobCategories = ['Designer', 'Developer', 'Marketing', 'IT & Technology', 'Business', 'Engineer', 'Account'];
  const jobTypes = ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Contract'];
  const experiences = ['Entry Level', 'Associate', 'Mid-Senior Level', 'Director', 'Executive'];
  const industries = ['Technology', 'Design', 'Finance', 'Healthcare', 'Education', 'Automobile'];
  const countries = ['France', 'USA', 'Canada', 'UK', 'Germany', 'Spain'];

  return (
    <Card className="post-job-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
      >
        <Title level={4}>Job Details</Title>
        <Form.Item
          label="Job Title*"
          name="jobTitle"
          rules={[{ required: true, message: 'Please input the job title!' }]}
        >
          <Input placeholder="Ex: Product Designer" />
        </Form.Item>

        <Form.Item
          label="Job Description*"
          name="jobDescription"
          rules={[{ required: true, message: 'Please input the job description!' }]}
        >
          <Input.TextArea rows={4} placeholder="Write about the job in details..." />
        </Form.Item>

        <Space align="start" gutter={16}>
          <Form.Item
            label="Job Category*"
            name="jobCategory"
            rules={[{ required: true, message: 'Please select a job category!' }]}
          >
            <Select placeholder="Select a category">
              {jobCategories.map(category => <Option key={category} value={category}>{category}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Job Type*"
            name="jobType"
            rules={[{ required: true, message: 'Please select a job type!' }]}
          >
            <Select placeholder="Select a type">
              {jobTypes.map(type => <Option key={type} value={type}>{type}</Option>)}
            </Select>
          </Form.Item>
        </Space>
        
        <Title level={4} style={{ marginTop: '20px' }}>Salary*</Title>
         <Space align="start" gutter={16}>
            <Form.Item
              label="Period"
              name="salaryPeriod"
              rules={[{ required: true, message: 'Please select salary period!' }]}
            >
              <Select placeholder="Monthly" style={{ width: 120 }}>
                 <Option value="monthly">Monthly</Option>
                 <Option value="yearly">Yearly</Option>
                 <Option value="hourly">Hourly</Option>
              </Select>
            </Form.Item>
             <Form.Item
              label="Min"
              name="minSalary"
              rules={[{ required: true, message: 'Please input minimum salary!' }]}
            >
              <Input type="number" placeholder="Min" />
            </Form.Item>
             <Form.Item
              label="Max"
              name="maxSalary"
              rules={[{ required: true, message: 'Please input maximum salary!' }]}
            >
              <Input type="number" placeholder="Max" />
            </Form.Item>
         </Space>

        <Title level={4} style={{ marginTop: '20px' }}>Skills & Experience</Title>
        <Form.Item label="Skills*" rules={[{ required: true, message: 'Please add at least one skill!' }]}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: '8px 12px' }}>
             {skills.map((skill, index) => {
              const isLongTag = skill.length > 20;
              const tagElem = (
                <Tag
                  key={skill}
                  closable={true}
                  onClose={() => handleCloseSkill(skill)}
                >
                  {isLongTag ? `${skill.slice(0, 20)}...` : skill}
                </Tag>
              );
              return isLongTag ? ( <span key={skill}>{tagElem}</span> ) : (tagElem);
            })}
            {inputVisible && (
              <Input
                type="text"
                size="small"
                style={{ width: 78 }}
                value={inputValue}
                onChange={handleSkillInputChange}
                onBlur={handleAddSkill}
                onPressEnter={handleAddSkill}
              />
            )}
            {!inputVisible && (
              <Tag onClick={showSkillInput} className="site-tag-plus">
                <PlusOutlined /> Add Skill
              </Tag>
            )}
          </div>
        </Form.Item>

        <Form.Item
          label="Experience*"
          name="experienceLevel"
          rules={[{ required: true, message: 'Please select experience level!' }]}
        >
          <Select placeholder="Select experience level">
            {experiences.map(exp => <Option key={exp} value={exp}>{exp}</Option>)}
          </Select>
        </Form.Item>
        
         <Title level={4} style={{ marginTop: '20px' }}>Address & Location</Title>
         <Form.Item
          label="Address*"
          name="address"
          rules={[{ required: true, message: 'Please input the address!' }]}
         >
          <Input placeholder="Cowrasta, Chandana, Gazipur Sadar" />
         </Form.Item>

         <Form.Item
          label="Country*"
          name="country"
          rules={[{ required: true, message: 'Please select a country!' }]}
         >
          <Select placeholder="Select a country">
             {countries.map(country => <Option key={country} value={country}>{country}</Option>)}
          </Select>
         </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Job
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PostJobForm; 