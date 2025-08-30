import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Avatar,
  Space,
  Divider,
  Tag,
  Tabs,
  Dropdown,
  Menu,
  Badge,
  Modal,
  Select,
} from "antd";
import {
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
  SendOutlined,
  UserOutlined,
  BellOutlined,
  EllipsisOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined,
  PushpinOutlined,
  PushpinFilled,
  LockOutlined,
  UnlockOutlined,
  FlagOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../../contexts/AuthContext";
import {
  getDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  toggleReaction,
} from "../../api/discussionService";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const FirstviteCommunity = () => {
  const { currentUser, token } = useAuth();
  const categories = [
    "All",
    "General",
    "Technical",
    "Q&A",
    "Announcements",
    "Feedback",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  
  // Helper function to ensure discussions is always an array
  const safeSetDiscussions = (data) => {
    // console.log('safeSetDiscussions called with data:', data);
    
    if (Array.isArray(data)) {
      // console.log('Data is an array, setting discussions directly');
      setDiscussions(data);
    } else if (data && Array.isArray(data.results)) {
      // console.log('Data has results array, setting discussions to data.results');
      setDiscussions(data.results);
    } else if (data && Array.isArray(data.discussions)) {
      // console.log('Data has discussions array, setting discussions to data.discussions');
      setDiscussions(data.discussions);
    } else if (data && data.data && Array.isArray(data.data)) {
      // console.log('Data is in data.data array, setting discussions to data.data');
      setDiscussions(data.data);
    } else {
      // console.warn('Unexpected discussions data format, defaulting to empty array. Data received:', data);
      setDiscussions([]);
    }
  };

  // Fetch discussions from API
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const filters = {};
        if (selectedCategory !== "All") {
          filters.category = selectedCategory;
        }
        if (searchQuery) {
          filters.search = searchQuery;
        }
        if (activeTab === "unanswered") {
          filters.unanswered = true;
        } else if (activeTab === "top") {
          filters.sortBy = "popular";
        }

        const data = await getDiscussions(filters);
        safeSetDiscussions(data);
      } catch (err) {
        console.error("Error fetching discussions:", err);
        setError("Failed to load discussions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [selectedCategory, searchQuery, activeTab]);

  // Handle creating a new discussion
  const handleNewPost = async () => {
    if (!currentUser) {
      console.error("User not authenticated");
      setError("Please log in to create a discussion");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const newDiscussion = {
        ...newPost,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userPhoto: currentUser.photoURL || "",
      };

      const createdDiscussion = await createDiscussion(newDiscussion);
      
      safeSetDiscussions([createdDiscussion, ...discussions]);
      setNewPost({ title: "", content: "", category: "General" });
      setIsModalVisible(false);
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError(err.response?.data?.message || "Failed to create discussion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (discussionId) => {
    if (!newComment.trim() || !currentUser) return;

    try {
      const commentData = {
        content: newComment
      };

      const response = await addComment(discussionId, commentData);
      
      setDiscussions(prevDiscussions => {
        if (!Array.isArray(prevDiscussions)) return [];
        
        return prevDiscussions.map(discussion => {
          if (discussion._id !== discussionId) return discussion;
          
          // Create updated discussion with the new comment
          return {
            ...discussion,
            comments: [
              ...(discussion.comments || []),
              {
                ...response.data,
                user: {
                  _id: currentUser.uid,
                  name: currentUser.displayName || "Anonymous",
                  avatar: currentUser.photoURL || ""
                },
                likes: [],
                dislikes: []
              }
            ],
            commentsCount: (discussion.commentsCount || 0) + 1
          };
        });
      });

      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
    }
  };

  // Handle like/dislike
  const handleReaction = async (discussionId, type, commentId = null) => {
    if (!currentUser) return;

    try {
      const response = await toggleReaction(discussionId, type, commentId);
      
      setDiscussions(prevDiscussions => {
        if (!Array.isArray(prevDiscussions)) return [];
        
        return prevDiscussions.map(discussion => {
          if (discussion._id !== discussionId) return discussion;
          
          // If it's a comment reaction
          if (commentId) {
            const updatedComments = (discussion.comments || []).map(comment => {
              if (comment._id !== commentId) return comment;
              return {
                ...comment,
                likes: response.data?.likes?.map(like => like.user?._id || like.user) || [],
                dislikes: response.data?.dislikes?.map(dislike => dislike.user?._id || dislike.user) || [],
                likesCount: response.data?.likes?.length || 0,
                dislikesCount: response.data?.dislikes?.length || 0
              };
            });
            return { ...discussion, comments: updatedComments };
          }
          
          // If it's a discussion reaction
          return {
            ...discussion,
            likes: response.data?.likes?.map(like => like.user?._id || like.user) || [],
            dislikes: response.data?.dislikes?.map(dislike => dislike.user?._id || dislike.user) || [],
            likesCount: response.data?.likes?.length || 0,
            dislikesCount: response.data?.dislikes?.length || 0
          };
        });
      });
    } catch (err) {
      console.error("Error updating reaction:", err);
      setError("Failed to update reaction. Please try again.");
    }
  };

  // Handle deleting a discussion
  const handleDeleteDiscussion = async (discussionId) => {
    if (!currentUser) return;

    try {
      await deleteDiscussion(discussionId);
      safeSetDiscussions(
        discussions.filter((discussion) => discussion._id !== discussionId)
      );
    } catch (err) {
      console.error("Error deleting discussion:", err);
      setError("Failed to delete discussion. Please try again.");
    }
  };

  // Handle marking a comment as solution
  const handleMarkAsSolution = async (discussionId, commentId) => {
    if (!currentUser) return;

    try {
      const updatedDiscussion = await updateDiscussion(discussionId, { markAsSolution: commentId });

      safeSetDiscussions(
        discussions.map((discussion) =>
          discussion._id === updatedDiscussion._id
            ? updatedDiscussion
            : discussion
        )
      );
    } catch (err) {
      console.error("Error marking solution:", err);
      setError("Failed to mark as solution. Please try again.");
    }
  };

  // Debug log for discussions data
  // console.log('All discussions:', discussions);
  // console.log('Selected category:', selectedCategory);
  // console.log('Search query:', searchQuery);
  // console.log('Active tab:', activeTab);

  // Filter and sort discussions
  const filteredDiscussions = discussions
    .filter((discussion) => {
      if (!discussion) {
        console.warn('Found undefined discussion in array');
        return false;
      }
      
      const matchesCategory =
        selectedCategory === "All" || 
        (discussion.category && discussion.category === selectedCategory);
        
      const matchesSearch = searchQuery === '' || 
        (discussion.title && discussion.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (discussion.content && discussion.content.toLowerCase().includes(searchQuery.toLowerCase()));
        
      // console.log('Discussion:', {
      //   id: discussion._id,
      //   title: discussion.title,
      //   category: discussion.category,
      //   matchesCategory,
      //   matchesSearch,
      //   timestamp: discussion.timestamp
      // });
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (activeTab === "recent")
        return new Date(b.timestamp) - new Date(a.timestamp);
      if (activeTab === "popular")
        return b.likes - b.dislikes - (a.likes - a.dislikes);
      if (activeTab === "unanswered")
        return a.comments.length - b.comments.length;
      return 0;
    });

  // Format timestamp to relative time
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1)
      return `${interval} year${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1)
      return `${interval} month${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1)
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;

    return "Just now";
  };

  // Menu for discussion actions
  const renderDiscussionMenu = (discussion) => (
    <Menu>
      {currentUser?.uid === discussion.userId && (
        <Menu.Item key="edit" icon={<EditOutlined />}>
          Edit Post
        </Menu.Item>
      )}
      {currentUser?.uid === discussion.userId && (
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDeleteDiscussion(discussion._id)}
        >
          Delete Post
        </Menu.Item>
      )}
      {currentUser?.isAdmin && (
        <Menu.Item
          key="pin"
          icon={discussion.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
          onClick={() =>
            handlePinDiscussion(discussion._id, !discussion.isPinned)
          }
        >
          {discussion.isPinned ? "Unpin Post" : "Pin Post"}
        </Menu.Item>
      )}
      {currentUser?.isAdmin && (
        <Menu.Item
          key="lock"
          icon={discussion.isLocked ? <UnlockOutlined /> : <LockOutlined />}
          danger={!discussion.isLocked}
          onClick={() =>
            handleLockDiscussion(discussion._id, !discussion.isLocked)
          }
        >
          {discussion.isLocked ? "Unlock Post" : "Lock Post"}
        </Menu.Item>
      )}
      <Menu.Item key="report" icon={<FlagOutlined />}>
        Report
      </Menu.Item>
    </Menu>
  );

  // Icon with text component
  const IconText = ({
    icon,
    text,
    onClick,
    active = false,
    className = "",
  }) => (
    <Space
      onClick={onClick}
      className={`flex items-center text-gray-500 hover:text-blue-500 cursor-pointer ${
        active ? "text-blue-500" : ""
      } ${className}`}
    >
      {React.cloneElement(icon, { className: "text-lg" })}
      <span className="ml-1">{text}</span>
    </Space>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                FirstVITE Community
              </h1>
              <p className="text-gray-500">
                Connect, share and learn with the FirstVITE community
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
              >
                New Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card className="mb-4 bg-gray-200 dark:bg-[#001525] text-black dark:text-white">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg mb-3">Categories</h3>
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`p-2 rounded cursor-pointer transition-colors dark:text-blue-500 dark:hover:bg-blue-50 dark:hover:text-black ${
                      selectedCategory === category
                        ? "bg-blue-50 dark:text-black dark:bg-blue-50 font-medium"
                        : "hover:bg-blue-400 dark:text-black dark:hover:bg-blue-400"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Card className="mb-6 bg-gray-200 dark:bg-[#001525]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search discussions..."
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  className="
    flex-shrink-0 

    [&_.ant-tabs-tab-btn]:text-black 
    dark:[&_.ant-tabs-tab-btn]:text-white

    [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-[#722ed1] 
    dark:[&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-[#722ed1]
  "
                >
                  <TabPane tab="Recent" key="recent" />
                  <TabPane tab="Popular" key="popular" />
                  <TabPane tab="Unanswered" key="unanswered" />
                </Tabs>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading discussions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                  <Button type="link" onClick={() => window.location.reload()}>
                    Try again
                  </Button>
                </div>
              ) : filteredDiscussions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageOutlined className="text-4xl text-black dark:text-white mb-3" />
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    No discussions found
                  </h3>
                  <p className="text-black dark:text-white mt-1">
                    Be the first to start a discussion!
                  </p>
                  <Button
                    className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                  >
                    New Post
                  </Button>
                </div>
              ) : (
                <List
                  itemLayout="vertical"
                  size="large"
                  dataSource={filteredDiscussions}
                  renderItem={(discussion) => (
                    <List.Item
                      key={discussion._id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 mb-4"
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar
                              src={discussion.userPhoto}
                              icon={!discussion.userPhoto && <UserOutlined />}
                              className="bg-blue-100 text-blue-600"
                            />
                            <div className="ml-3">
                              <div className="font-medium ">
                                {discussion.userName}
                              </div>
                              <div className="text-xs text-black">
                                {formatTimeAgo(discussion.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {discussion.isPinned && (
                              <Tag color="blue" className="mr-2">
                                Pinned
                              </Tag>
                            )}
                            {discussion.isLocked && (
                              <Tag color="red" className="mr-2">
                                Locked
                              </Tag>
                            )}
                            <Dropdown
                              overlay={renderDiscussionMenu(discussion)}
                              trigger={["click"]}
                            >
                              <Button type="text" icon={<EllipsisOutlined />} />
                            </Dropdown>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h3 className="text-lg font-medium mb-2">
                            {discussion.title}
                          </h3>
                          <div
                            className="prose max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{
                              __html: discussion.content,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Tag color="blue">{discussion.category}</Tag>
                          {discussion.tags?.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <IconText
                              icon={
                                <LikeOutlined
                                  className={
                                    discussion.likes?.includes(currentUser?.uid)
                                      ? "text-blue-500"
                                      : ""
                                  }
                                />
                              }
                              text={discussion.likes?.length || 0}
                              onClick={() =>
                                handleReaction(discussion._id, "like")
                              }
                              active={discussion.likes?.includes(
                                currentUser?.uid
                              )}
                            />
                            <IconText
                              icon={
                                <DislikeOutlined
                                  className={
                                    discussion.dislikes?.includes(
                                      currentUser?.uid
                                    )
                                      ? "text-red-500"
                                      : ""
                                  }
                                />
                              }
                              text={discussion.dislikes?.length || 0}
                              onClick={() =>
                                handleReaction(discussion._id, "dislike")
                              }
                              active={discussion.dislikes?.includes(
                                currentUser?.uid
                              )}
                            />
                            <IconText
                              icon={<MessageOutlined />}
                              text={`${discussion.comments?.length || 0}`}
                              onClick={() =>
                                setReplyingTo(
                                  replyingTo === discussion._id
                                    ? null
                                    : discussion._id
                                )
                              }
                            />
                          </div>
                          {/* <div className="text-sm text-gray-500">
                            {discussion.views} views
                          </div> */}
                        </div>

                        {/* Comment form */}
                        {replyingTo === discussion._id && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-100">
                            <div className="mb-3">
                              <TextArea
                                rows={3}
                                placeholder="Write your comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button onClick={() => setReplyingTo(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleAddComment(discussion._id)}
                                icon={<SendOutlined />}
                                disabled={!newComment.trim()}
                                className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
                              >
                                Post Comment
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        {discussion.comments?.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-100">
                            <List
                              className="rounded bg-gray-200 dark:bg-[#001525] dark:text-white"
                              dataSource={discussion.comments}
                              renderItem={(comment) => (
                                <List.Item
                                  key={comment._id}
                                  className={`!py-3 ${
                                    comment.isSolution
                                      ? "bg-green-50 rounded p-3 -mx-3"
                                      : ""
                                  }`}
                                >
                                  <div className="w-full">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center mb-2">
                                        <Avatar
                                          src={comment.userPhoto}
                                          icon={
                                            !comment.userPhoto && (
                                              <UserOutlined />
                                            )
                                          }
                                          size="small"
                                          className="bg-gray-100 border-gray-200 mr-2 dark:bg-[#001525] dark:border-gray-700 dark:text-white"
                                        />
                                        <div>
                                          <div className="font-medium text-black dark:text-white">
                                            {comment.userName}
                                          </div>
                                          <div className="text-xs text-black dark:text-white ">
                                            {formatTimeAgo(comment.timestamp)}
                                            {comment.isSolution && (
                                              <span className="ml-2 text-green-600 font-medium">
                                                <CheckOutlined /> Solution
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="mt-2 text-gray-800 prose prose-sm max-w-none dark:text-white"
                                      dangerouslySetInnerHTML={{
                                        __html: comment.content,
                                      }}
                                    />
                                    <div className="mt-2 flex items-center space-x-4 text-sm">
                                      <IconText
                                        icon={
                                          <LikeOutlined
                                            className={
                                              comment.likes?.includes(
                                                currentUser?.uid
                                              )
                                                ? "text-blue-500"
                                                : ""
                                            }
                                          />
                                        }
                                        text={comment.likes?.length || 0}
                                        onClick={() =>
                                          handleReaction(
                                            discussion._id,
                                            "like",
                                            comment._id
                                          )
                                        }
                                        active={comment.likes?.includes(
                                          currentUser?.uid
                                        )}
                                      />
                                      <IconText
                                        icon={
                                          <DislikeOutlined
                                            className={
                                              comment.dislikes?.includes(
                                                currentUser?.uid
                                              )
                                                ? "text-red-500"
                                                : ""
                                            }
                                          />
                                        }
                                        text={comment.dislikes?.length || 0}
                                        onClick={() =>
                                          handleReaction(
                                            discussion._id,
                                            "dislike",
                                            comment._id
                                          )
                                        }
                                        active={comment.dislikes?.includes(
                                          currentUser?.uid
                                        )}
                                      />
                                    </div>
                                  </div>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* New Post Modal */}
      <Modal
        title="Create New Post"
        open={isModalVisible}
        onOk={handleNewPost}
        onCancel={() => setIsModalVisible(false)}
        okText="Post"
        okButtonProps={{
          disabled: !newPost.title.trim() || !newPost.content.trim(),
          className: "text-white bg-[#1677ff] hover:bg-[#1677ff]",
        }}
        width={700}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              placeholder="What's your question or topic?"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              className="w-full"
              value={newPost.category}
              onChange={(value) => setNewPost({ ...newPost, category: value })}
            >
              {categories
                .filter((c) => c !== "All")
                .map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <ReactQuill
              theme="snow"
              value={newPost.content}
              onChange={(content) => setNewPost({ ...newPost, content })}
              placeholder="Write your post here..."
              className="h-48"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FirstviteCommunity;
