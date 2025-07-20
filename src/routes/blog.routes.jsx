import React from 'react';
import { Navigate } from 'react-router-dom';
import BlogListPage from '../pages/blog/BlogListPage';
import BlogDetailPage from '../pages/blog/BlogDetailPage';
import BlogPostList from '../pages/admin/BlogListPage';
import BlogPostForm from '../pages/admin/BlogPostForm';

const BlogRoutes = {
  path: 'blog',
  children: [
    // Public blog routes
    { path: '', element: <BlogListPage /> },
    { path: ':slug', element: <BlogDetailPage /> },
    
    // Admin blog management routes
    { 
      path: 'admin',
      children: [
        { index: true, element: <Navigate to="/admin/blog" replace /> },
        { path: 'blog', element: <BlogPostList /> },
        { path: 'blog/new', element: <BlogPostForm /> },
        { path: 'blog/edit/:id', element: <BlogPostForm /> },
      ]
    }
  ]
};

export default BlogRoutes;
