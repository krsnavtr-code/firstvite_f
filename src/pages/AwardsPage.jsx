import React, { useState, useEffect } from "react";
import { Input, Select, Button, Card, Tag, Spin, Empty } from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  LinkOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  getAwards,
  getFeaturedAward,
} from "../api/awardApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

const AwardsPage = () => {
  const navigate = useNavigate();
  const [awards, setAwards] = useState([]);
  const [featuredAward, setFeaturedAward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    awardCategory: undefined,
    search: "",
    sort: "-displayOrder -awardDate",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch featured award
      const featuredResponse = await getFeaturedAward();
      setFeaturedAward(featuredResponse.data?.award);

      // Fetch all awards with filters
      const queryParams = {
        awardCategory: filters.awardCategory,
        search: filters.search,
        sort: filters.sort,
        limit: 50,
      };

      const response = await getAwards(queryParams);
      let allAwards = response.data?.awards || [];

      // Remove featured award from the list to avoid duplication
      if (featuredAward) {
        allAwards = allAwards.filter((a) => a._id !== featuredAward._id);
      }

      setAwards(allAwards);
    } catch (error) {
      console.error("Error fetching awards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (value) => {
    setFilters({
      ...filters,
      awardCategory: value || undefined,
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

  const getCategoryLabel = (category) => {
    const categoryMap = {
      excellence: "Excellence Award",
      innovation: "Innovation Award",
      leadership: "Leadership Award",
      recognition: "Recognition",
      achievement: "Achievement",
      partnership: "Partnership",
      other: "Other",
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      excellence: "gold",
      innovation: "purple",
      leadership: "blue",
      recognition: "green",
      achievement: "orange",
      partnership: "cyan",
      other: "default",
    };
    return colorMap[category] || "default";
  };

  const handleCardClick = (award) => {
    if (award.externalLink) {
      window.open(award.externalLink, "_blank", "noopener,noreferrer");
    } else if (award.awardImage) {
      window.open(award.awardImage, "_blank", "noopener,noreferrer");
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
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Awards & Recognition</h1>
          <p className="text-xl md:text-2xl text-amber-100 mb-8">
            Celebrating our achievements and excellence in education
          </p>

          {/* Trust Banner */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-8 opacity-80">
            <div className="text-sm text-amber-200 italic">
              Recognized by: Education Excellence Awards • Innovation Summit • 
              Leadership Forum • Achievement Council
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Award Section */}
        {featuredAward && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">🏆</span> Featured Award
            </h2>
            <Card
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              cover={
                <div className="h-64 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                  {featuredAward.organizationLogo ? (
                    <img
                      src={featuredAward.organizationLogo}
                      alt={featuredAward.organizationName}
                      className="h-32 object-contain"
                    />
                  ) : (
                    <div className="text-white text-6xl font-bold opacity-50">
                      {featuredAward.organizationName?.charAt(0) || "A"}
                    </div>
                  )}
                </div>
              }
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Tag
                    color={getCategoryColor(featuredAward.awardCategory)}
                    className="capitalize"
                  >
                    {getCategoryLabel(featuredAward.awardCategory)}
                  </Tag>
                  <span className="text-gray-500 text-sm flex items-center">
                    <CalendarOutlined className="mr-1" />
                    {dayjs(featuredAward.awardDate).format(
                      "MMMM D, YYYY",
                    )}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {featuredAward.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {featuredAward.description}
                </p>
                {featuredAward.recipientName && (
                  <p className="text-gray-700 mb-4">
                    <span className="font-medium">Recipient:</span> {featuredAward.recipientName}
                    {featuredAward.recipientRole && (
                      <span className="text-gray-500"> ({featuredAward.recipientRole})</span>
                    )}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    {featuredAward.organizationName}
                  </span>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => handleCardClick(featuredAward)}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    View Details
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
                placeholder="Search by keyword or organization..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Filter by category"
                allowClear
                size="large"
                onChange={handleCategoryFilter}
                className="w-full"
              >
                <Option value="excellence">Excellence Award</Option>
                <Option value="innovation">Innovation Award</Option>
                <Option value="leadership">Leadership Award</Option>
                <Option value="recognition">Recognition</Option>
                <Option value="achievement">Achievement</Option>
                <Option value="partnership">Partnership</Option>
                <Option value="other">Other</Option>
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
                <Option value="-displayOrder -awardDate">Display Order</Option>
                <Option value="-awardDate">Newest First</Option>
                <Option value="awardDate">Oldest First</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Awards Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Awards</h2>
          
          {awards.length === 0 ? (
            <Empty
              description="No awards found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((award) => (
                <Card
                  key={award._id}
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleCardClick(award)}
                  cover={
                    award.awardImage ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={award.awardImage}
                          alt={award.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <TrophyOutlined className="text-6xl text-amber-400" />
                      </div>
                    )
                  }
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag
                        color={getCategoryColor(award.awardCategory)}
                        className="capitalize text-xs"
                      >
                        {getCategoryLabel(award.awardCategory)}
                      </Tag>
                      <span className="text-gray-500 text-xs flex items-center">
                        <CalendarOutlined className="mr-1" />
                        {dayjs(award.awardDate).format("MMM YYYY")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {award.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {award.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-medium">
                        {award.organizationName}
                      </span>
                      {award.externalLink && (
                        <LinkOutlined className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AwardsPage;