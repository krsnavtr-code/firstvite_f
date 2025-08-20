import React, { useState } from 'react';
import { Card, List, Input, Button, Avatar, Space, Divider, Tag } from 'antd';
import { MessageOutlined, LikeOutlined, DislikeOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const Discussions = () => {
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      user: 'John Doe',
      avatar: null,
      content: 'Has anyone completed the React hooks assignment? I need some help with the custom hook part.',
      timestamp: '2 hours ago',
      likes: 5,
      dislikes: 0,
      comments: [
        {
          id: 1,
          user: 'Jane Smith',
          avatar: null,
          content: 'I just finished it! The key is to use the useCallback hook to memoize the function.',
          timestamp: '1 hour ago',
          likes: 3,
          dislikes: 0,
        },
      ],
    },
    {
      id: 2,
      user: 'Alex Johnson',
      avatar: null,
      content: 'What are the best practices for state management in large React applications?',
      timestamp: '5 hours ago',
      likes: 8,
      dislikes: 1,
      comments: [],
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const handleAddComment = (discussionId) => {
    if (!newComment.trim()) return;
    
    const updatedDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          comments: [
            ...discussion.comments,
            {
              id: Date.now(),
              user: 'Current User',
              avatar: null,
              content: newComment,
              timestamp: 'Just now',
              likes: 0,
              dislikes: 0,
            },
          ],
        };
      }
      return discussion;
    });
    
    setDiscussions(updatedDiscussions);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleLike = (discussionId, commentId = null) => {
    const updatedDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        if (commentId) {
          // Like a comment
          const updatedComments = discussion.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, likes: comment.likes + 1 };
            }
            return comment;
          });
          return { ...discussion, comments: updatedComments };
        } else {
          // Like a discussion
          return { ...discussion, likes: discussion.likes + 1 };
        }
      }
      return discussion;
    });
    
    setDiscussions(updatedDiscussions);
  };

  const handleDislike = (discussionId, commentId = null) => {
    const updatedDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        if (commentId) {
          // Dislike a comment
          const updatedComments = discussion.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, dislikes: comment.dislikes + 1 };
            }
            return comment;
          });
          return { ...discussion, comments: updatedComments };
        } else {
          // Dislike a discussion
          return { ...discussion, dislikes: discussion.dislikes + 1 };
        }
      }
      return discussion;
    });
    
    setDiscussions(updatedDiscussions);
  };

  const IconText = ({ icon, text, onClick }) => (
    <Space onClick={onClick} style={{ cursor: 'pointer' }}>
      {React.createElement(icon)}
      {text}
    </Space>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Discussions</h1>
        <Button type="primary" icon={<MessageOutlined />}>
          New Discussion
        </Button>
      </div>

      <Card>
        <List
          itemLayout="vertical"
          size="large"
          dataSource={discussions}
          renderItem={(discussion) => (
            <List.Item
              key={discussion.id}
              actions={[
                <IconText
                  icon={LikeOutlined}
                  text={discussion.likes}
                  onClick={() => handleLike(discussion.id)}
                  key="list-vertical-like"
                />,
                <IconText
                  icon={DislikeOutlined}
                  text={discussion.dislikes}
                  onClick={() => handleDislike(discussion.id)}
                  key="list-vertical-dislike"
                />,
                <span 
                  key="list-vertical-comment"
                  onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <MessageOutlined /> {discussion.comments.length} {discussion.comments.length === 1 ? 'comment' : 'comments'}
                </span>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={discussion.avatar ? null : <UserOutlined />} 
                    src={discussion.avatar}
                  />
                }
                title={<a href="#">{discussion.user}</a>}
                description={
                  <>
                    <span>{discussion.timestamp}</span>
                    <div className="mt-2">{discussion.content}</div>
                  </>
                }
              />

              {replyingTo === discussion.id && (
                <div className="mt-4 ml-12">
                  <div className="flex items-start gap-2">
                    <Avatar icon={<UserOutlined />} />
                    <div className="flex-1">
                      <TextArea
                        rows={2}
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => setReplyingTo(null)}>Cancel</Button>
                        <Button 
                          type="primary" 
                          icon={<SendOutlined />}
                          onClick={() => handleAddComment(discussion.id)}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {discussion.comments.length > 0 && (
                <div className="mt-4 ml-12">
                  <Divider orientation="left" className="text-sm">
                    {discussion.comments.length} {discussion.comments.length === 1 ? 'Comment' : 'Comments'}
                  </Divider>
                  <List
                    itemLayout="horizontal"
                    dataSource={discussion.comments}
                    renderItem={(comment) => (
                      <div className="mb-4">
                        <div className="flex items-start gap-2">
                          <Avatar icon={<UserOutlined />} size="small" src={comment.avatar} />
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">{comment.user}</span>
                                <span className="text-gray-500 text-xs ml-2">{comment.timestamp}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-xs text-gray-500 cursor-pointer hover:text-blue-500">
                                  <LikeOutlined className="mr-1" />
                                  {comment.likes}
                                </span>
                                <span className="text-xs text-gray-500 cursor-pointer hover:text-red-500">
                                  <DislikeOutlined className="mr-1" />
                                  {comment.dislikes}
                                </span>
                              </div>
                            </div>
                            <div className="mt-1">{comment.content}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
              )}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Discussions;
