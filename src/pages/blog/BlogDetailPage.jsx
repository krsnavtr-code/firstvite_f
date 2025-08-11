import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import { Skeleton, Button, message, Divider, Tag, Empty } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TagOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getBlogPostBySlug, getPostsByCategory } from "../../api/blogApi";
import "github-markdown-css/github-markdown.css";
import "./BlogDetailPage.css";

dayjs.extend(relativeTime);

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log("Fetching blog post with slug:", slug);
        setIsLoading(true);
        const response = await getBlogPostBySlug(slug);
        console.log("API Response:", response);

        // Updated to handle the correct response structure
        const postData = response?.data?.post || response?.post;

        if (!postData) {
          console.error("No post data in response:", response);
          throw new Error("No post data received");
        }

        setPost(postData);
        console.log("Post state set:", postData);

        // Fetch related posts after the main post is loaded
        if (postData?.categories?.length > 0) {
          console.log(
            "Fetching related posts for category:",
            postData.categories[0]._id
          );
          fetchRelatedPosts(postData.categories[0]._id, postData._id);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError(
          "Failed to load blog post. It may have been moved or deleted."
        );
        setIsLoading(false);
      }
    };

    const fetchRelatedPosts = async (categoryId, excludePostId) => {
      try {
        console.log("Fetching related posts for category:", categoryId);
        setIsRelatedLoading(true);
        const response = await getPostsByCategory(categoryId, {
          exclude: excludePostId,
          limit: 3,
        });

        // Handle both response structures: response.data.posts and response.posts
        const relatedPosts = response?.data?.posts || response?.posts || [];
        console.log("Related posts response:", { response, relatedPosts });

        setRelatedPosts(Array.isArray(relatedPosts) ? relatedPosts : []);
      } catch (error) {
        console.error("Error fetching related posts:", error);
        setRelatedPosts([]); // Ensure we always set an array, even if there's an error
      } finally {
        setIsRelatedLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
      <div className="mb-12">
        <Skeleton.Image className="w-full h-96" />
      </div>
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} active paragraph={{ rows: 3 }} />
        ))}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Empty
        description={
          <span className="text-gray-600 dark:text-gray-400">
            {error || "Blog post not found"}
          </span>
        }
      >
        <Button
          type="primary"
          onClick={() => navigate("/blog")}
          className="mt-4"
        >
          Back to Blog
        </Button>
      </Empty>
    </div>
  );

  if (isLoading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    console.error("Error state:", { error, post });
    return renderErrorState();
  }

  if (!post) {
    console.error("No post data available");
    return renderErrorState();
  }

  const {
    title,
    content,
    excerpt,
    featuredImage,
    author,
    createdAt,
    categories,
    tags,
    readingTime,
  } = post;

  // Generate SEO metadata based on the blog post
  const seoTitle = post ? `${post.title} | FirstVITE Blog` : 'Blog Post | FirstVITE';
  const seoDescription = post?.excerpt || 'Read this article on FirstVITE';
  const seoKeywords = post?.tags?.join(', ') || 'blog, article, education, learning';
  const canonicalUrl = post ? `https://firstvite.com/blog/${post.slug}` : 'https://firstvite.com/blog';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonicalUrl}
        og={{
          title: post?.title || 'FirstVITE Blog',
          description: post?.excerpt || 'Read this article on FirstVITE',
          type: 'article',
          image: post?.imageUrl,
          url: canonicalUrl
        }}
      />
      {/* Header with back button and share */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/blog")}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              size="large"
            >
              Back to Blog
            </Button>

            <Button
              type="primary"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              className="flex items-center bg-blue-600 hover:bg-blue-700 border-none"
              size="large"
            >
              Share Article
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Blog Content (75%) */}
        <section className="lg:col-span-3">
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Keep your entire blog article section here (image, title, author, markdown, tags etc.) */}
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Featured Image */}
              {featuredImage && (
                <div className="w-full h-96 overflow-hidden">
                  <img
                    src={featuredImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <div className="p-3 sm:p-6 md:p-12">
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories?.map((category) => (
                    <Link
                      key={category._id}
                      to={`/blog?category=${category.slug}`}
                      className="inline-block"
                    >
                      <Tag color="blue" className="text-sm">
                        {category.name}
                      </Tag>
                    </Link>
                  ))}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center mr-6 mb-2 sm:mb-0">
                    <UserOutlined className="mr-1" />
                    <span>{author?.name || "FirstVITE"}</span>
                  </div>
                  <div className="flex items-center mr-6 mb-2 sm:mb-0">
                    <CalendarOutlined className="mr-1" />
                    <time dateTime={createdAt}>
                      {dayjs(createdAt).format("MMMM D, YYYY")}
                    </time>
                  </div>
                  <div className="flex items-center">
                    <ClockCircleOutlined className="mr-1" />
                    <span>{Math.ceil(readingTime || 5)} min read</span>
                  </div>
                </div>

                {excerpt && (
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-3 font-medium">
                    {excerpt}
                  </p>
                )}
              </div>

              {/* Article Content */}
              <div className="px-3 sm:px-6 md:px-12 pb-6">
                <div className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: ({ node, ...props }) => (
                        <img
                          {...props}
                          className="rounded-lg shadow-md my-6 w-full h-auto"
                          alt={props.alt || ""}
                        />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <pre className="bg-white p-4 rounded-lg overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-white px-1.5 py-0.5 rounded text-sm">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Tags */}
              {tags?.length > 0 && (
                <div className="px-3 sm:px-6 md:px-12 pb-6">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <TagOutlined className="text-gray-500 mr-2" />
                      {tags.map((tag, index) => (
                        <Link
                          key={index}
                          to={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="inline-block"
                        >
                          <Tag className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {tag}
                          </Tag>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="">
              <Divider orientation="left" className="text-xl font-semibold">
                Related Articles
              </Divider>

              {isRelatedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-3 sm:p-6 md:p-12"
                    >
                      <Skeleton.Image className="w-full h-48" />
                      <div className="p-6">
                        <Skeleton active paragraph={{ rows: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <article
                      key={relatedPost._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-3 sm:p-6 md:p-12"
                    >
                      {relatedPost.featuredImage && (
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="block h-48 overflow-hidden"
                        >
                          <img
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {relatedPost.categories
                            ?.slice(0, 2)
                            .map((category) => (
                              <Link
                                key={category._id}
                                to={`/blog?category=${category.slug}`}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {category.name}
                              </Link>
                            ))}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          <Link
                            to={`/blog/${relatedPost.slug}`}
                            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <ClockCircleOutlined className="mr-1" />
                          <span>
                            {Math.ceil(relatedPost.readingTime || 5)} min read
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Related Posts Full Width */}
          {relatedPosts.length > 0 && (
            <section className="">
              <Divider orientation="left" className="text-xl font-semibold">
                Related Articles
              </Divider>
              {/* Related Posts Grid */}
              ...
            </section>
          )}
        </section>

        {/* Right: Sidebar (25%) */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Author Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              About the Author
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              {author?.bio ||
                "This author loves writing about technology, design, and web development."}
            </p>
            {/* <p className="text-sm text-gray-400">
              Written by <strong>{author?.name || "Admin"}</strong>
            </p> */}
          </div>

          {/* Share Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Enjoyed the post?
            </p>
            <Button
              type="primary"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              className="w-full"
            >
              Share This Post
            </Button>
          </div>

          {/* Categories */}
          {categories?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Categories
              </h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      to={`/blog?category=${category.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Link key={index} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Tag>{tag}</Tag>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
