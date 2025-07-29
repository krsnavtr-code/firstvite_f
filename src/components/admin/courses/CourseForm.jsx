import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  createCourse,
  updateCourse,
  getCourseById,
  getCategoriesForForm,
  uploadCourseImage,
} from "../../../api/courseApi";
import userApi from "../../../api/userApi";

// Error boundary for the file upload component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in FileUploadInput:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4 border border-red-300 bg-red-50 rounded">
          <p>Something went wrong with the file upload.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Separate component for file input to prevent re-renders and isolate errors
const FileUploadInput = ({ onFileSelect, thumbnail, onRemove }) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Maximum size is 5MB.");
        return;
      }

      // Reset file input to allow re-uploading the same file
      e.target.value = "";

      const formData = new FormData();
      formData.append("image", file);

      console.log("Starting file upload...");
      const response = await uploadCourseImage(formData);
      console.log("Upload response:", response);

      if (!response || !response.success) {
        throw new Error(response?.message || "Upload failed");
      }

      // Make sure we're storing just the path part, not the full URL
      const imagePath = response.location;
      console.log("Setting image path:", imagePath);

      onFileSelect(imagePath);
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error("Error in file upload:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload thumbnail"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Create a safe thumbnail URL
  const getThumbnailUrl = (thumb) => {
    if (!thumb) return "";
    try {
      if (thumb.startsWith("http")) return thumb;
      // Ensure there's exactly one slash between domain and path
      const baseUrl = import.meta.env.VITE_API_URL;
      const path = thumb.startsWith("/") ? thumb : `/${thumb}`;
      return `${baseUrl}${path}`;
    } catch (error) {
      console.error("Error creating thumbnail URL:", error);
      return "";
    }
  };

  const thumbnailUrl = getThumbnailUrl(thumbnail);

  return (
    <div className="flex items-center space-x-6">
      {/* Thumbnail Preview */}
      <div className="flex-shrink-0">
        <div className="w-40 h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
          {thumbnail ? (
            <img
              key={thumbnail} // Force re-render when thumbnail changes
              src={thumbnailUrl}
              alt="Course thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading image:", e);
                console.error("Failed to load image at URL:", e.target.src);
                console.error("Current thumbnail value:", thumbnail);
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/400x225?text=Thumbnail+Not+Found";
              }}
              onLoad={(e) => {
                console.log("Image loaded successfully:", e.target.src);
              }}
            />
          ) : (
            <span className="text-gray-400 text-sm">No thumbnail</span>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <label
            className={`relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={(e) => {
              if (isUploading) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {isUploading ? "Uploading..." : "Choose File"}
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
            />
          </label>
          {thumbnail && (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Recommended size: 800x450px (16:9 aspect ratio)
        </p>
      </div>
    </div>
  );
};

// Component to handle each week in the curriculum
const WeekItem = ({
  week,
  weekIndex,
  removeWeek,
  register,
  control,
  errors,
}) => {
  const {
    fields: topicFields,
    append: appendTopic,
    remove: removeTopic,
  } = useFieldArray({
    control,
    name: `curriculum.${weekIndex}.topics`,
    keyName: "topicId", // Ensure we have a unique key for each topic
  });

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Module {weekIndex + 1}</h4>
        <button
          type="button"
          onClick={() => removeWeek(weekIndex)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove Module
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Title *
          </label>
          <input
            type="text"
            {...register(`curriculum.${weekIndex}.title`, {
              required: "Module title is required",
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Introduction to React"
          />
          {errors.curriculum?.[weekIndex]?.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.curriculum[weekIndex].title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (hours) *
          </label>
          <input
            type="number"
            {...register(`curriculum.${weekIndex}.duration`, {
              required: "Duration is required",
              min: { value: 1, message: "Minimum 1 hour" },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 5"
          />
          {errors.curriculum?.[weekIndex]?.duration && (
            <p className="mt-1 text-sm text-red-600">
              {errors.curriculum[weekIndex].duration.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register(`curriculum.${weekIndex}.description`)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What will students learn this week?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topics / Lessons
        </label>
        <div className="space-y-2">
          {topicFields.map((topic, topicIndex) => (
            <div key={topic.topicId} className="flex items-center space-x-2">
              <input
                type="text"
                {...register(`curriculum.${weekIndex}.topics.${topicIndex}`, {
                  required: "Topic is required",
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Topic ${topicIndex + 1}`}
              />
              <button
                type="button"
                onClick={() => removeTopic(topicIndex)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendTopic("")}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export const CourseForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    getValues,
    trigger,
  } = useForm({
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      benefits: ["", "", ""],
      category: "",
      instructor: "",
      isFree: false,
      price: 0,
      originalPrice: 0,
      discount: 0,
      duration: "",
      totalHours: 0,
      level: "Beginner",
      language: "English",
      certificateIncluded: true,
      isFeatured: false,
      isPublished: false,
      showOnHome: false,
      status: "draft",
      image: "",
      thumbnail: "",
      previewVideo: "",
      benefits: ["No specific benefits listed"],
      whatYouWillLearn: ["Learn valuable skills"],
      requirements: ["No special requirements"],
      whoIsThisFor: ["Anyone interested in learning"],
      prerequisites: ["No Requirements required"],
      tags: [],
      faqs: [],
      curriculum: [
        {
          week: 1,
          title: "Introduction",
          description: "",
          duration: "0 min",
          topics: ["Course introduction"],
        },
      ],
    },
  });

  // FAQ form array methods
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faqs",
  });

  // Fetch course data in edit mode
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesData = await getCategoriesForForm();
        setCategories(categoriesData);

        // Fetch instructors
        const instructorsData = await userApi.getUsers({ role: "instructor" });
        setInstructors(instructorsData);

        // If in edit mode, fetch course data
        if (isEdit && id) {
          try {
            const response = await getCourseById(id);
            const courseData = response.data;
            console.log("Fetched course data:", courseData);
            console.log("showOnHome in response:", courseData.showOnHome);

            // Helper function to ensure array fields have at least one empty string
            const ensureArray = (arr) =>
              Array.isArray(arr) && arr.length > 0 ? arr : [""];

            // Format the data to match form structure
            const formattedData = {
              ...courseData,
              // Map category (it might be an object with _id or just the ID)
              category: courseData.category?._id || courseData.category || "",
              // Ensure all arrays are properly initialized
              benefits: ensureArray(courseData.benefits),
              whatYouWillLearn: ensureArray(courseData.whatYouWillLearn),
              requirements: ensureArray(courseData.requirements),
              whoIsThisFor: ensureArray(courseData.whoIsThisFor),
              prerequisites: ensureArray(courseData.prerequisites),
              skills: ensureArray(courseData.skills),
              // Handle curriculum - ensure it has at least one week
              curriculum: courseData.curriculum?.length
                ? courseData.curriculum
                : [
                    {
                      week: 1,
                      title: "Introduction",
                      description: "",
                      duration: 0,
                      topics: [""],
                    },
                  ],
              // Handle other fields
              tags: courseData.tags || [],
              faqs: courseData.faqs || [],
              // Ensure boolean fields are properly set
              isFree: Boolean(courseData.isFree),
              isFeatured: Boolean(courseData.isFeatured),
              isPublished: Boolean(courseData.isPublished),
              showOnHome: Boolean(courseData.showOnHome),
              certificateIncluded: courseData.certificateIncluded !== false, // default to true if not set
            };

            console.log("Formatted course data:", formattedData);
            console.log(
              "showOnHome in formatted data:",
              formattedData.showOnHome
            );
            reset(formattedData);

            // Log the form values after reset to verify
            const formValues = getValues();
            console.log(
              "Form values after reset - showOnHome:",
              formValues.showOnHome
            );
          } catch (error) {
            console.error("Error loading course data:", error);
            toast.error("Failed to load course data. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error("Failed to load form data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, isEdit, reset, getCategoriesForForm, userApi, getCourseById, toast]);

  // Field arrays for curriculum
  const {
    fields: curriculumFields,
    append: appendWeek,
    remove: removeWeek,
  } = useFieldArray({
    control,
    name: "curriculum",
    shouldUnregister: true,
  });

  const {
    fields: prerequisiteFields,
    append: appendPrerequisite,
    remove: removePrerequisite,
  } = useFieldArray({
    control,
    name: "prerequisites",
  });

  const {
    fields: learningsFields,
    append: appendLearning,
    remove: removeLearning,
  } = useFieldArray({
    control,
    name: "whatYouWillLearn",
  });

  const {
    fields: skillsFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await uploadCourseImage(formData);
      return { location: response.imageUrl };
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
      return { location: "" };
    }
  };

  // Form submission
  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log("Form submitted with data:", formData);
      console.log(
        "isFeatured in form data:",
        formData.isFeatured,
        "type:",
        typeof formData.isFeatured
      );

      // Validate required fields
      if (!formData.title || formData.title.trim().length < 5) {
        throw new Error("Title must be at least 5 characters long");
      }

      if (!formData.description || formData.description.trim().length < 10) {
        throw new Error("Description must be at least 10 characters long");
      }

      if (!formData.category) {
        throw new Error("Please select a category");
      }

      if (!formData.instructor || formData.instructor.trim().length < 2) {
        throw new Error("Instructor name is required");
      }

      // Clean and format the data before sending to API
      console.log(
        "Before cleaning - isFeatured:",
        formData.isFeatured,
        "type:",
        typeof formData.isFeatured
      );
      
      // Ensure price is always included and properly formatted
      const price = formData.isFree ? 0 : Math.max(0, Number(formData.price) || 0);
      const originalPrice = formData.isFree ? 0 : Math.max(0, Number(formData.originalPrice) || price);
      
      const dataToSend = {
        ...formData,
        // Ensure boolean fields are properly set
        isFree: Boolean(formData.isFree),
        isFeatured: Boolean(formData.isFeatured),
        isPublished: Boolean(formData.isPublished),
        certificateIncluded: formData.certificateIncluded !== false,

        // Ensure strings are properly trimmed
        title: formData.title?.toString().trim(),
        description: formData.description?.toString().trim(),
        instructor: formData.instructor?.toString().trim(),
        shortDescription: formData.shortDescription?.toString().trim() || "",

        // Set price and originalPrice with proper formatting
        price: price,
        originalPrice: originalPrice,
        totalHours: Math.max(0, Number(formData.totalHours) || 0),

        // Ensure arrays are properly formatted
        benefits: Array.isArray(formData.benefits)
          ? formData.benefits.filter((b) => b && b.toString().trim() !== "")
          : ["No specific benefits listed"],

        prerequisites: Array.isArray(formData.prerequisites)
          ? formData.prerequisites
              .filter((p) => p && p.toString().trim() !== "")
              .map((p) => p.toString().trim())
          : ["No Requirements required"],

        skills: Array.isArray(formData.skills)
          ? formData.skills
              .filter((s) => s && s.toString().trim() !== "")
              .map((s) => s.toString().trim())
          : [],

        whatYouWillLearn: Array.isArray(formData.whatYouWillLearn)
          ? formData.whatYouWillLearn
              .filter((w) => w && w.toString().trim() !== "")
              .map((w) => w.toString().trim())
          : ["Learn valuable skills"],

        requirements: Array.isArray(formData.requirements)
          ? formData.requirements
              .filter((r) => r && r.toString().trim() !== "")
              .map((r) => r.toString().trim())
          : ["No special requirements"],

        whoIsThisFor: Array.isArray(formData.whoIsThisFor)
          ? formData.whoIsThisFor
              .filter((w) => w && w.toString().trim() !== "")
              .map((w) => w.toString().trim())
          : ["Anyone interested in learning"],
        // Ensure curriculum is properly formatted
        curriculum: Array.isArray(formData.curriculum)
          ? formData.curriculum
              .filter((week) => week && (week.title || week.week))
              .map((week, index) => ({
                week: Number(week.week) || index + 1,
                title: week.title?.toString().trim() || `Week ${index + 1}`,
                description: week.description?.toString().trim() || "",
                duration: week.duration?.toString().trim() || "0 min",
                topics: Array.isArray(week.topics)
                  ? week.topics
                      .map((topic) => topic?.toString().trim())
                      .filter((topic) => topic && topic !== "")
                  : [],
              }))
          : [
              {
                week: 1,
                title: "Introduction",
                description: "",
                duration: "0 min",
                topics: ["Course introduction"],
              },
            ],
        // Ensure boolean fields are properly set
        certificateIncluded: formData.certificateIncluded !== false,
        isFeatured:
          formData.isFeatured === true || formData.isFeatured === "true",
        isPublished:
          formData.isPublished === true || formData.isPublished === "true",
        // Ensure required fields have values
        level: ["Beginner", "Intermediate", "Advanced"].includes(formData.level)
          ? formData.level
          : "Beginner",
        language: formData.language?.toString().trim() || "English",
        duration: formData.duration?.toString().trim() || "0 min",
      };

      console.log("Submitting course data:", dataToSend);

      if (isEdit) {
        await updateCourse(id, dataToSend);
        toast.success("Course updated successfully!");
      } else {
        await createCourse(dataToSend);
        toast.success("Course created successfully!");
      }
      navigate("/admin/courses");
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(error.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const updateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    // Your existing form JSX
    <div className="container mx-auto text-black px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Course" : "Create New Course"}
      </h1>
      {/* Your form fields here */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                onChange={(e) => {
                  setValue("slug", updateSlug(e.target.value));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Complete Web Development Bootcamp"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                {...register("slug", { required: "Slug is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., web-development-bootcamp"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className="w-full px-3 py-2 bg-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor *
              </label>
              <select
                {...register("instructor", {
                  required: "Instructor is required",
                })}
                className="w-full px-3 py-2 bg-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an instructor</option>
                {Array.isArray(instructors) &&
                  instructors.map((instructor, index) => (
                    <option key={index} value={instructor._id}>
                      {instructor.fullname || instructor.name}
                    </option>
                  ))}
              </select>
              {errors.instructor && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.instructor.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description *
            </label>
            <textarea
              {...register("shortDescription", {
                required: "Short description is required",
                maxLength: {
                  value: 300,
                  message: "Maximum 300 characters",
                },
              })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A brief summary of the course (max 300 characters)"
            />
            {errors.shortDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description *
            </label>
            <div className="prose max-w-none">
              <Controller
                name="description"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field: { onChange, value } }) => (
                  <ReactQuill
                    theme="snow"
                    value={value || ""}
                    onChange={(content) => {
                      onChange(content);
                      // Trigger validation when content changes
                      trigger("description");
                    }}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image"],
                        ["clean"],
                      ],
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "strike",
                      "list",
                      "bullet",
                      "link",
                      "image",
                    ]}
                    placeholder="Enter course description..."
                    className="h-64 bg-gray-300"
                  />
                )}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Pricing & Duration</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 mr-2">
                  Price (INR) *
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFree"
                    {...register("isFree")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isFree"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Free Course
                  </label>
                </div>
              </div>
              <input
                type="number"
                {...register("price", {
                  required: !watch("isFree") ? "Price is required" : false,
                  min: { value: 0, message: "Price cannot be negative" },
                  valueAsNumber: true,
                  validate: (value) => {
                    if (watch("isFree") && value !== 0) {
                      return "Price must be 0 for free courses";
                    }
                    return true;
                  },
                })}
                disabled={watch("isFree")}
                className={`w-full px-3 py-2 border ${
                  watch("isFree")
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                } border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={watch("isFree") ? "Free" : "e.g., 2999"}
                value={watch("isFree") ? 0 : watch("price") || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("price", value, { shouldValidate: true });
                }}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (INR)
              </label>
              <input
                type="number"
                {...register("originalPrice", {
                  min: { value: 0, message: "Price cannot be negative" },
                })}
                disabled={watch("isFree")}
                className={`w-full px-3 py-2 border ${
                  watch("isFree")
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                } border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={watch("isFree") ? "N/A" : "e.g., 4999"}
              />
              {errors.originalPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.originalPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (weeks) *
              </label>
              <input
                type="number"
                {...register("duration", {
                  required: "Duration is required",
                  min: { value: 1, message: "Minimum 1 week" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Hours *
              </label>
              <input
                type="number"
                {...register("totalHours", {
                  required: "Total hours is required",
                  min: { value: 1, message: "Minimum 1 hour" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 40"
              />
              {errors.totalHours && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.totalHours.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level *
              </label>
              <select
                {...register("level", { required: "Level is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.level.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="certificateIncluded"
                  {...register("certificateIncluded")}
                  className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="certificateIncluded"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Certificate Included
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register("isFeatured", { value: false })}
                  defaultChecked={watch("isFeatured")}
                  className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Featured Course
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register("isPublished")}
                  className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublished"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Publish Now
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showOnHome"
                  {...register("showOnHome")}
                  className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="showOnHome"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show on Home
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            What Students Will Learn
          </h3>

          {learningsFields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2 mb-2">
              <input
                type="text"
                {...register(`whatYouWillLearn.${index}`, {
                  required: "This field is required",
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Learning point ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeLearning(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendLearning("")}
            className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add Learning Point
          </button>
        </div>

        {/* Requirements */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Requirements</h3>

          {prerequisiteFields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2 mb-2">
              <input
                type="text"
                {...register(`prerequisites.${index}`)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Prerequisite ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removePrerequisite(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendPrerequisite("")}
            className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add Prerequisite
          </button>
        </div>

        {/* Skills Covered */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Skills Covered</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {skillsFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{watch(`skills.${index}`)}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex">
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (value) {
                    appendSkill(value);
                    e.target.value = "";
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a skill and press Enter"
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                const value = input.value.trim();
                if (value) {
                  appendSkill(value);
                  input.value = "";
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Curriculum */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Course Curriculum</h3>
            <button
              type="button"
              onClick={() =>
                appendWeek({
                  week: curriculumFields.length + 1,
                  title: "",
                  description: "",
                  topics: [""],
                  duration: 0,
                })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Module
            </button>
          </div>

          {curriculumFields.map((week, weekIndex) => (
            <WeekItem
              key={week.id}
              week={week}
              weekIndex={weekIndex}
              removeWeek={removeWeek}
              register={register}
              control={control}
              errors={errors}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Frequently Asked Questions
            </h3>
            <button
              type="button"
              onClick={() => appendFaq({ question: "", answer: "" })}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faqFields.map((faq, index) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">FAQ {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(`faqs.${index}.question`, {
                        required: "Question is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter question"
                    />
                    {errors.faqs?.[index]?.question && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.faqs[index].question.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`faqs.${index}.answer`, {
                        required: "Answer is required",
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter answer"
                    />
                    {errors.faqs?.[index]?.answer && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.faqs[index].answer.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {faqFields.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No FAQs added yet.</p>
                <button
                  type="button"
                  onClick={() => appendFaq({ question: "", answer: "" })}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add your first FAQ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail URL */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Course Thumbnail</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail URL
              </label>
              <input
                type="url"
                {...register("thumbnail")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the URL of the course thumbnail image
              </p>
            </div>
            {watch("thumbnail") && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="w-64 h-36 border border-gray-300 rounded-md overflow-hidden">
                  <img
                    src={watch("thumbnail")}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x225?text=Thumbnail+Not+Found";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
      ;
    </div>
  );
};

export default CourseForm;
