import React, { useState, useEffect } from "react";
import { Input, Select, Button, Card, Tag, Spin, Empty } from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  getMediaMentions,
  getFeaturedMediaMention,
} from "../api/mediaMentionApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

const MediaMentionsPage = () => {
  const navigate = useNavigate();
  const [mentions, setMentions] = useState([]);
  const [featuredMention, setFeaturedMention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    newsType: undefined,
    search: "",
    sort: "-publishedDate",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch featured mention
      const featuredResponse = await getFeaturedMediaMention();
      setFeaturedMention(featuredResponse.data?.mention);

      // Fetch all mentions with filters
      const queryParams = {
        newsType: filters.newsType,
        search: filters.search,
        sort: filters.sort,
        limit: 50,
      };

      const response = await getMediaMentions(queryParams);
      let allMentions = response.data?.mentions || [];

      // Remove featured mention from the list to avoid duplication
      if (featuredMention) {
        allMentions = allMentions.filter((m) => m._id !== featuredMention._id);
      }

      setMentions(allMentions);
    } catch (error) {
      console.error("Error fetching media mentions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (value) => {
    setFilters({
      ...filters,
      newsType: value || undefined,
    });
  };

  const handleSearch = (value) => {
    setFilters({
      ...filters,
      search: value,
    });
  };

  const handleSort = (value) => {
    setFilters({
      ...filters,
      sort: value,
    });
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      print: "Print Media",
      digital: "Digital Article",
      video: "Video",
      press_release: "Press Release",
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type) => {
    const colorMap = {
      print: "blue",
      digital: "green",
      video: "purple",
      press_release: "orange",
    };
    return colorMap[type] || "default";
  };

  const handleCardClick = (mention) => {
    if (mention.externalLink) {
      window.open(mention.externalLink, "_blank", "noopener,noreferrer");
    } else if (mention.mediaUpload) {
      window.open(mention.mediaUpload, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">In the News</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            See what leading publications are saying about our certification
            programs
          </p>

          {/* Trust Banner - Placeholder for publication logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-8 opacity-80">
            <div className="text-sm text-blue-200 italic">
              Featured in: Times of India • TechCrunch • Digital Learning
              Magazine • Forbes India
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured News Section */}
        {featuredMention && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">⭐</span> Featured Story
            </h2>
            <Card
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              cover={
                <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  {featuredMention.publisherLogo ? (
                    <img
                      src={featuredMention.publisherLogo}
                      alt={featuredMention.publisherName}
                      className="h-32 object-contain"
                    />
                  ) : (
                    <div className="text-white text-6xl font-bold opacity-50">
                      {featuredMention.publisherName?.charAt(0) || "N"}
                    </div>
                  )}
                </div>
              }
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Tag
                    color={getTypeColor(featuredMention.newsType)}
                    className="capitalize"
                  >
                    {getTypeLabel(featuredMention.newsType)}
                  </Tag>
                  <span className="text-gray-500 text-sm flex items-center">
                    <CalendarOutlined className="mr-1" />
                    {dayjs(featuredMention.publishedDate).format(
                      "MMMM D, YYYY",
                    )}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {featuredMention.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {featuredMention.shortDescription}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    {featuredMention.publisherName}
                  </span>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => handleCardClick(featuredMention)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Read Full Article
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Search by keyword or publication..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Filter by type"
                allowClear
                size="large"
                onChange={handleTypeFilter}
                className="w-full"
              >
                <Option value="print">Print Media</Option>
                <Option value="digital">Digital Article</Option>
                <Option value="video">Video</Option>
                <Option value="press_release">Press Release</Option>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Sort by"
                size="large"
                value={filters.sort}
                onChange={handleSort}
                className="w-full"
              >
                <Option value="-publishedDate">Newest First</Option>
                <Option value="publishedDate">Oldest First</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Media Mentions
            <span className="text-gray-500 text-lg font-normal ml-2">
              ({mentions.length})
            </span>
          </h2>

          {mentions.length === 0 ? (
            <Empty description="No media mentions found" className="py-12" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentions.map((mention) => (
                <Card
                  key={mention._id}
                  className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleCardClick(mention)}
                  cover={
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
                      {mention.publisherLogo ? (
                        <img
                          src={mention.publisherLogo}
                          alt={mention.publisherName}
                          className="h-20 object-contain"
                        />
                      ) : mention.mediaUpload ? (
                        <img
                          src={mention.mediaUpload}
                          alt={mention.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileTextOutlined className="text-4xl text-gray-400" />
                      )}
                    </div>
                  }
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag
                        color={getTypeColor(mention.newsType)}
                        className="text-xs capitalize"
                      >
                        {getTypeLabel(mention.newsType)}
                      </Tag>
                      <span className="text-gray-400 text-xs flex items-center">
                        <CalendarOutlined className="mr-1" />
                        {dayjs(mention.publishedDate).format("MMM D, YYYY")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                      {mention.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                      {mention.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium">
                        {mention.publisherName}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        icon={<LinkOutlined />}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {mention.newsType === "print"
                          ? "View Clipping"
                          : "Read More"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Media Kit & PR Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Media Kit</h3>
              <p className="text-gray-300 mb-6">
                Download our official media kit including company logo,
                founder's bio, brand guidelines, and high-resolution images for
                press use.
              </p>
              <Button
                type="primary"
                size="large"
                icon={<FileTextOutlined />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Download Media Kit
              </Button>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">PR Contact</h3>
              <p className="text-gray-300 mb-4">
                For media inquiries, press releases, or interview requests,
                please reach out to our PR team.
              </p>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-semibold">Email:</span>{" "}
                  press@eklabya.com
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Phone:</span> +91 XXXXX XXXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaMentionsPage;
