import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import QuestionForm from './QuestionForm';

const { TextArea } = Input;

const TaskForm = ({ visible, onCancel, onSave, sessionId }) => {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        title: '',
        description: '',
        questions: [{
          question: '',
          questionType: 'multiple_choice',
          points: 1,
          options: [{ text: '', isCorrect: false }],
          explanation: ''
        }]
      });
      setQuestions([0]);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Ensure questions have valid data
      const validatedQuestions = (values.questions || []).map((q, index) => ({
        ...q,
        order: index,
        // Ensure options have required fields
        options: (q.options || []).map(opt => ({
          ...opt,
          text: opt.text || '',
          isCorrect: !!opt.isCorrect
        }))
      }));

      await onSave({
        ...values,
        sessionId,
        questions: validatedQuestions
      });
      
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      }
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      questionType: 'multiple_choice',
      points: 1,
      options: [{ text: '', isCorrect: false }],
      explanation: ''
    };

    // Get current questions from form
    const currentQuestions = form.getFieldValue('questions') || [];
    
    // Update form with new question
    form.setFieldsValue({
      questions: [...currentQuestions, newQuestion]
    });
    
    // Update local state
    setQuestions(prev => [...prev, prev.length]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      message.warning('At least one question is required');
      return;
    }
    
    // Get current questions from form
    const currentQuestions = form.getFieldValue('questions') || [];
    
    // Update form with filtered questions
    form.setFieldsValue({
      questions: currentQuestions.filter((_, i) => i !== index)
    });
    
    // Update local state
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title="Create New Task"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      confirmLoading={loading}
      style={{ top: 20 }}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' }
      }}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
        >
          Save Task
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: '',
          description: '',
          questions: [{
            question: '',
            questionType: 'multiple_choice',
            points: 1,
            options: [{ text: '', isCorrect: false }],
            explanation: ''
          }]
        }}
      >
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Task Description"
        >
          <TextArea rows={3} placeholder="Enter task description" />
        </Form.Item>

        <Divider orientation="left">Questions</Divider>
        
        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <div style={{ marginBottom: 16 }}>
              {fields.map((field, index) => (
                <div 
                  key={field.key} 
                  style={{ 
                    position: 'relative',
                    border: '1px solid #f0f0f0',
                    borderRadius: 4,
                    padding: 16,
                    marginBottom: 16
                  }}
                >
                  <QuestionForm 
                    name={field.name} 
                    form={form} 
                  />
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeQuestion(index)}
                      style={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="dashed"
                onClick={addQuestion}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 8 }}
              >
                Add Question
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default TaskForm;
