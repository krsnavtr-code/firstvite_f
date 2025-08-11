import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Skeleton, Empty, Pagination, Select } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getBlogPosts } from '../../api/blogApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useSearchParams } from 'react-router-dom';

dayjs.extend(relativeTime);

const { Option } = Select;

export default function BlogListPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 9;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getBlogPosts({
          page,
          limit: pageSize,
          status: 'published' // Ensure we only fetch published posts
        });
        setPosts(response.data?.posts || []);
        setTotal(response.data?.total || 0);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Set empty state on error
        setPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const renderPostCard = (post) => (
    <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {post.featuredImage && (
        <div className="h-48 overflow-hidden">
          <Link to={`/blog/${post.slug}`}>
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          </Link>
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span className="flex items-center mr-4">
            <CalendarOutlined className="mr-1" />
            {dayjs(post.createdAt).format('MMM D, YYYY')}
          </span>
          <span className="flex items-center">
            <ClockCircleOutlined className="mr-1" />
            {Math.ceil(post.readingTime || 5)} min read
          </span>
        </div>
        
        <h2 className="text-xl font-semibold mb-3 dark:text-white">
          <Link 
            to={`/blog/${post.slug}`} 
            className="hover:text-blue-600 text-black dark:hover:text-blue-400 transition-colors line-clamp-2"
          >
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {post.excerpt || post.content?.substring(0, 200) + '...'}
        </p>
        
        {post.categories?.length > 0 && (
          <div className="mt-2 mb-4 flex flex-wrap gap-2">
            {post.categories.map(category => (
              <span 
                key={category._id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link 
            to={`/blog/${post.slug}`} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center"
          >
            Read More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Blog | FirstVITE - Latest Articles & Insights"
        description="Explore our latest blog posts on education, career development, and industry insights. Stay updated with FirstVITE's expert articles and resources."
        keywords="education blog, career advice, learning resources, industry insights, FirstVITE articles, professional development"
        og={{
          title: 'FirstVITE Blog - Education & Career Insights',
          description: 'Discover expert articles, study tips, and industry insights from FirstVITE. Stay ahead in your learning journey with our educational blog.',
          type: 'website'
        }}
      />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Insights, tutorials, and updates from our team
          </p>
        </div>

        <div className="mb-5 text-right">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {posts.length} of {total} posts
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Skeleton.Image className="w-full h-48" />
              <div className="p-6">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(renderPostCard)}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={false}
              hideOnSinglePage
              className="pagination-custom"
            />
          </div>
        </>
      ) : (
        <Empty 
          description={
            <span className="text-gray-600 dark:text-gray-400">
              No blog posts found
            </span>
          }
          className="py-12"
        />
      )}
      </div>
    </div>
  );
}
