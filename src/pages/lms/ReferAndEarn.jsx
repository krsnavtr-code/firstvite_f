import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Typography, Divider, Space, Tooltip } from 'antd';
import { CopyOutlined, ShareAltOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from "../../contexts/AuthContext";
import axios from 'axios';

const { Title, Text } = Typography;

const ReferAndEarn = () => {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    earnedRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, you would fetch this from your backend
    const fetchReferralData = async () => {
      try {
        // Simulate API call
        // const response = await axios.get(`/api/referral/${user.id}`);
        // setReferralCode(response.data.referralCode);
        // setStats(response.data.stats);
        
        // Mock data for demo
        setTimeout(() => {
          setReferralCode('FIRSTVITE' + Math.floor(1000 + Math.random() * 9000));
          setStats({
            totalReferrals: 0,
            activeReferrals: 0,
            earnedRewards: 0
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching referral data:', error);
        message.error('Failed to load referral data');
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user?.id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    message.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join me on FirstVITE!',
      text: `Use my referral code ${referralCode} to get started on FirstVITE and earn rewards!`,
      url: window.location.origin + '/signup?ref=' + referralCode,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        message.success('Referral link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      await navigator.clipboard.writeText(shareData.url);
      message.success('Referral link copied to clipboard!');
    }
  };

  return (
    <div className="refer-and-earn-container" style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Refer & Earn</Title>
      
      <Card 
        title="Your Referral Program" 
        loading={loading}
        style={{ marginBottom: '24px' }}
        headStyle={{ fontSize: '18px', fontWeight: 'bold' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <GiftOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>Earn ₹500 for every friend who signs up and complete their first purchase!</Title>
          <Text type="secondary">Share your referral code with friends and earn rewards after they join and complete their first purchase.</Text>
        </div>

        <Divider>Your Referral Code</Divider>
        
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <Input
            value={referralCode}
            readOnly
            style={{
              width: '200px',
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginRight: '8px',
            }}
            addonAfter={
              <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={handleCopyCode}
                  type="text"
                />
              </Tooltip>
            }
          />
          
          <Button 
            type="primary" 
            icon={<ShareAltOutlined />} 
            onClick={handleShare}
            style={{ marginTop: '16px' }}
          >
            Share Referral Link
          </Button>
        </div>

        <Divider>Your Referral Stats</Divider>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>{stats.totalReferrals}</Title>
            <Text type="secondary">Total Referrals</Text>
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: '#52c41a' }}>{stats.activeReferrals}</Title>
            <Text type="secondary">Active Referrals</Text>
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: '#faad14' }}>₹{stats.earnedRewards}</Title>
            <Text type="secondary">Earned Rewards</Text>
          </div>
        </div>
      </Card>

      <Card 
        title="How It Works"
        style={{ marginBottom: '24px' }}
        headStyle={{ fontSize: '18px', fontWeight: 'bold' }}
      >
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <div>
            <Text strong>1. Share Your Referral Link</Text>
            <br />
            <Text type="secondary">Share your unique referral link with friends and colleagues.</Text>
          </div>
          <div>
            <Text strong>2. They Sign Up</Text>
            <br />
            <Text type="secondary">Your friends sign up using your referral link or code.</Text>
          </div>
          <div>
            <Text strong>3. You Both Earn Rewards</Text>
            <br />
            <Text type="secondary">When they make their first purchase or complete a specific action, you both earn rewards!</Text>
          </div>
        </Space>
      </Card>

      <Card 
        title="Terms & Conditions"
        style={{ marginBottom: '24px' }}
        headStyle={{ fontSize: '18px', fontWeight: 'bold' }}
      >
        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          <Text type="secondary">• Referral rewards are subject to terms and conditions.</Text>
          <Text type="secondary">• Fraudulent activities may result in account suspension.</Text>
          <Text type="secondary">• FirstVITE reserves the right to modify or terminate the program at any time.</Text>
        </Space>
      </Card>
    </div>
  );
};

export default ReferAndEarn;
