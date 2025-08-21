import React, { useEffect } from 'react';
import { Form, Input, Select, Space, Button, InputNumber, Switch, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const { Option } = Select;
const { TextArea } = Input;

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'matching', label: 'Matching' },
  { value: 'fill_in_blank', label: 'Fill in the Blank' },
];

const QuestionForm = ({ name, form }) => {
  const questionType = Form.useWatch(['questions', name, 'questionType'], form) || 'multiple_choice';
  const options = Form.useWatch(['questions', name, 'options'], form) || [];

  // Set default options when question type changes
  useEffect(() => {
    if (questionType === 'true_false') {
      form.setFieldValue(['questions', name, 'options'], [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false }
      ]);
    } else if (questionType === 'short_answer' || questionType === 'essay') {
      form.setFieldValue(['questions', name, 'options'], []);
    } else if (questionType === 'multiple_choice' && (!options || options.length === 0)) {
      form.setFieldValue(['questions', name, 'options'], [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]);
    }
  }, [questionType, name, form]);

  const renderOptions = () => {
    switch (questionType) {
      case 'multiple_choice':
      case 'matching':
      case 'true_false':
        return (
          <Form.List name={[name, 'options']}>
            {(fields, { add, remove }) => (
              <div style={{ width: '100%' }}>
                {fields.map((field, idx) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'text']}
                      rules={[{ required: true, message: 'Option text is required' }]}
                      style={{ flex: 1 }}
                    >
                      <Input 
                        placeholder={
                          questionType === 'matching' ? 'Match this text...' : 
                          questionType === 'true_false' ? (idx === 0 ? 'True' : 'False') : 
                          `Option ${idx + 1}`
                        }
                        disabled={questionType === 'true_false'}
                      />
                    </Form.Item>
                    
                    {questionType !== 'matching' && (
                      <Form.Item
                        name={[field.name, 'isCorrect']}
                        valuePropName="checked"
                        initialValue={false}
                      >
                        <Switch 
                          checkedChildren={<CheckOutlined />} 
                          unCheckedChildren={<CloseOutlined />} 
                        />
                      </Form.Item>
                    )}

                    {fields.length > 1 && questionType !== 'true_false' && (
                      <Button
                        type="text"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                        danger
                      />
                    )}
                  </Space>
                ))}
                
                {questionType !== 'true_false' && (
                  <Button
                    type="dashed"
                    onClick={() => add({ text: '', isCorrect: false })}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Add {questionType === 'matching' ? 'Match Pair' : 'Option'}
                  </Button>
                )}
              </div>
            )}
          </Form.List>
        );
      
      case 'short_answer':
      case 'essay':
        return (
          <Form.Item
            name={[name, 'correctAnswer']}
            label="Correct Answer"
            rules={[{ required: true, message: 'Please provide the correct answer' }]}
          >
            <TextArea 
              rows={questionType === 'essay' ? 4 : 2} 
              placeholder="Enter the correct answer" 
            />
          </Form.Item>
        );
      
      case 'fill_in_blank':
        return (
          <Form.Item
            name={[name, 'correctAnswer']}
            label="Correct Answer (use _____ for blanks)"
            rules={[{ required: true, message: 'Please provide the correct answer with blanks' }]}
            help="Use underscores (_____) to indicate where the blanks should appear in the question."
          >
            <TextArea 
              rows={2}
              placeholder="E.g., The capital of France is _____" 
            />
          </Form.Item>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Form.Item
        name={[name, 'question']}
        label="Question"
        rules={[{ required: true, message: 'Please enter the question' }]}
      >
        <TextArea 
          rows={2} 
          placeholder={
            questionType === 'fill_in_blank' ? 
            'E.g., The capital of France is _____' : 
            'Enter the question'
          } 
        />
      </Form.Item>

      <div style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
        <Form.Item
          name={[name, 'questionType']}
          label="Question Type"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please select a question type' }]}
        >
          <Select>
            {questionTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name={[name, 'points']}
          label="Points"
          initialValue={1}
          style={{ width: '120px' }}
          rules={[{ required: true, message: 'Points' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </div>

      {renderOptions()}

      <Form.Item
        name={[name, 'explanation']}
        label={
          <span>
            Explanation <Text type="secondary">(optional)</Text>
          </span>
        }
      >
        <TextArea 
          rows={2} 
          placeholder="Add explanation for the correct answer" 
        />
      </Form.Item>
    </div>
  );
};

export default QuestionForm;
