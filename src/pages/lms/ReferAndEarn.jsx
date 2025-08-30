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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <Title level={2} className=" mb-6">Refer & Earn</Title>
      
      <Card 
        title={<span className="dark:text-white">Your Referral Program</span>} 
        loading={loading}
        className="mb-6 bg-gray-200 dark:bg-[#001525] shadow-sm"
        headStyle={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0',
          color: 'inherit'
        }}
        bodyStyle={{ color: 'inherit' }}
      >
        <div className="text-center mb-6">
          <GiftOutlined className="text-5xl text-blue-600 dark:text-blue-400 mb-4" />
          <Title level={3} className="dark:text-white">Earn ₹500 for every friend who signs up and completes their first purchase!</Title>
          <Text className="dark:text-gray-300">Share your referral code with friends and earn rewards after they join and complete their first purchase.</Text>
        </div>

        <Divider className="dark:text-gray-400 dark:border-gray-600">Your Referral Code</Divider>
        
        <div className="text-center my-6">
          <Input
            value={referralCode}
            readOnly
            className="w-64 text-center font-bold tracking-wider bg-gray-200 dark:bg-[#001a33] dark:text-white dark:border-gray-600"
            addonAfter={
              <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <Button 
                  icon={<CopyOutlined className="dark:text-white" />} 
                  onClick={handleCopyCode}
                  type="text"
                  className="dark:text-white dark:hover:bg-gray-700"
                />
              </Tooltip>
            }
          />
          
          {/* <Button 
            type="primary" 
            icon={<ShareAltOutlined />} 
            onClick={handleShare}
            className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
          >
            Share Referral Link
          </Button> */}
        </div>

        <Divider className="dark:text-gray-400 dark:border-gray-600">Your Referral Stats</Divider>
        
        <div className="flex flex-col sm:flex-row justify-around text-center gap-4">
          <div className="p-4 bg-gray-50 dark:bg-[#001a33] rounded-lg flex-1">
            <Title level={2} className="m-0 text-blue-600 dark:text-blue-400">{stats.totalReferrals}</Title>
            <Text className="dark:text-gray-300">Total Referrals</Text>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#001a33] rounded-lg flex-1">
            <Title level={2} className="m-0 text-green-600 dark:text-green-400">{stats.activeReferrals}</Title>
            <Text className="dark:text-gray-300">Active Referrals</Text>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#001a33] rounded-lg flex-1">
            <Title level={2} className="m-0 text-yellow-500 dark:text-yellow-400">₹{stats.earnedRewards}</Title>
            <Text className="dark:text-gray-300">Earned Rewards</Text>
          </div>
        </div>
      </Card>

      <Card 
        title={<span className="dark:text-white">How It Works</span>}
        className="mb-6 bg-gray-200 dark:bg-[#001529] shadow-sm"
        headStyle={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0',
          color: 'inherit'
        }}
        bodyStyle={{ color: 'inherit' }}
      >
        <Space direction="vertical" size="middle" className="w-full">
          <div className="p-4 bg-gray-50 dark:bg-[#001a33] rounded-lg">
            <Text strong className="text-lg dark:text-white">1. Share Your Referral Link</Text>
            <div className="mt-2 dark:text-gray-300">Share your unique referral link with friends and colleagues.</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#001a33] rounded-lg">
            <Text strong className="text-lg dark:text-white">2. They Sign Up</Text>
            <div className="mt-2 dark:text-gray-300">Your friends sign up using your referral link or code.</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#001a33] rounded-lg">
            <Text strong className="text-lg dark:text-white">3. You Both Earn Rewards</Text>
            <div className="mt-2 dark:text-gray-300">When they make their first purchase or complete a specific action, you both earn rewards!</div>
          </div>
        </Space>
      </Card>

      <Card 
        title={<span className="dark:text-white">Terms & Conditions</span>}
        className="mb-6 bg-gray-200 dark:bg-[#001529] shadow-sm"
        headStyle={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0',
          color: 'inherit'
        }}
        bodyStyle={{ color: 'inherit' }}
      >
        <Space direction="vertical" size="small" className="w-full dark:text-gray-300">
          <div>• Referral rewards are subject to terms and conditions.</div>
          <div>• Fraudulent activities may result in account suspension.</div>
          <div>• FirstVITE reserves the right to modify or terminate the program at any time.</div>
        </Space>
      </Card>
    </div>
  );
};

export default ReferAndEarn;
