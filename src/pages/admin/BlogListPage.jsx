import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Space, Tag, message, Popconfirm, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getBlogPosts, deleteBlogPost } from '../../api/blogApi';

const { Search } = Input;
const { Option } = Select;

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined,
    search: '',
  });

  const fetchPosts = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      const queryParams = {
        page: params.pagination?.current || current,
        limit: params.pagination?.pageSize || pageSize,
        status: filters.status,
        search: filters.search,
        ...params,
      };

      const response = await getBlogPosts(queryParams);
      
      setPosts(response.data?.posts || []);
      setPagination({
        ...pagination,
        total: response.data?.total || 0,
        current: response.data?.currentPage || 1,
      });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      message.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const handleTableChange = (pagination, filters, sorter) => {
    fetchPosts({
      pagination,
      ...filters,
      ...(sorter.field && {
        sortBy: `${sorter.order === 'descend' ? '-' : ''}${sorter.field}`,
      }),
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlogPost(id);
      message.success('Blog post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      message.error(error.response?.data?.message || 'Failed to delete blog post');
    }
  };

  const handleStatusFilter = (value) => {
    setFilters({
      ...filters,
      status: value || undefined,
    });
  };

  const handleSearch = (value) => {
    setFilters({
      ...filters,
      search: value,
    });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => (
        <Link to={`/admin/blog/edit/${record._id}`} className="text-blue-600 hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
        { text: 'Archived', value: 'archived' },
      ],
      render: (status) => {
        let color = 'default';
        if (status === 'published') color = 'green';
        if (status === 'draft') color = 'orange';
        if (status === 'archived') color = 'red';

        return (
          <Tag color={color} className="capitalize">
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Author',
      dataIndex: ['author', 'fullname'],
      key: 'author',
    },
    {
      title: 'Published At',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      sorter: true,
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'Draft'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/admin/blog/edit/${record._id}`}>
            <Button type="link" icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this post?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-900 dark:text-white font-bold">Blog Posts</h1>
        <Link to="/admin/blog/new">
          <Button type="primary" icon={<PlusOutlined />}
          className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'>
            New Post
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <Search
              placeholder="Search posts..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select
              placeholder="Filter by status"
              allowClear
              onChange={handleStatusFilter}
              className="w-full"
            >
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} posts`,
          }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
};

export default BlogListPage;
