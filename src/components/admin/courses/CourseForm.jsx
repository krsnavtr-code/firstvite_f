import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createCourse,
  updateCourse,
  getCourseById,
  getCategoriesForForm,
  uploadCourseImage
} from "../../../api/courseApi";
import userApi from "../../../api/userApi";

// Component to handle each week in the curriculum
const WeekItem = ({ week, weekIndex, removeWeek, register, control, errors }) => {
  const {
    fields: topicFields,
    append: appendTopic,
    remove: removeTopic,
  } = useFieldArray({
    control,
    name: `curriculum.${weekIndex}.topics`,
    keyName: 'topicId' // Ensure we have a unique key for each topic
  });

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Week {weekIndex + 1}</h4>
        <button
          type="button"
          onClick={() => removeWeek(weekIndex)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove Week
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Week Title *
          </label>
          <input
            type="text"
            {...register(`curriculum.${weekIndex}.title`, {
              required: "Week title is required",
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
                  required: "Topic is required"
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

const CourseForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
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
      category: "",
      instructor: "",
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
      prerequisites: [""],
      whatYouWillLearn: [""],
      skills: [""],
      curriculum: [
        {
          week: 1,
          title: "Introduction",
          description: "",
          duration: 0,
          topics: [""],
        },
      ],
    },
  });

  // Fetch course data in edit mode
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesData = await getCategoriesForForm();
        setCategories(categoriesData);

        // Fetch instructors (assuming we have a way to get instructors)
        const instructorsData = await userApi.getUsers({ role: "instructor" });
        setInstructors(instructorsData);

        // If in edit mode, fetch course data
        if (isEdit && id) {
          const courseData = await getCourseById(id);
          // Format the data to match form structure
          const formattedData = {
            ...courseData,
            // Ensure all required arrays exist
            prerequisites: courseData.prerequisites?.length
              ? courseData.prerequisites
              : [""],
            whatYouWillLearn: courseData.whatYouWillLearn?.length
              ? courseData.whatYouWillLearn
              : [""],
            skills: courseData.skills?.length ? courseData.skills : [""],
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
          };
          reset(formattedData);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error("Failed to load form data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, isEdit, reset]);

  // Field arrays for curriculum
  const {
    fields: curriculumFields,
    append: appendWeek,
    remove: removeWeek,
  } = useFieldArray({
    control,
    name: 'curriculum',
    shouldUnregister: true,
  });

  const {
    fields: prerequisiteFields,
    append: appendPrerequisite,
    remove: removePrerequisite,
  } = useFieldArray({
    control,
    name: 'prerequisites',
  });

  const {
    fields: learningsFields,
    append: appendLearning,
    remove: removeLearning,
  } = useFieldArray({
    control,
    name: 'whatYouWillLearn',
  });

  const {
    fields: skillsFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  });

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await uploadCourseImage(formData);
      return { location: response.imageUrl };
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
      return { location: '' };
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEdit) {
        await updateCourse(id, data);
        toast.success('Course updated successfully!');
      } else {
        await createCourse(data);
        toast.success('Course created successfully!');
      }
      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const updateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
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
    <div className="container mx-auto px-4 py-8">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <Editor
                  // apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                  apiKey="pqt3p849mrd0644ple5h621x04w9j3t6npvqkj7322xm4m0j"
                  value={field.value}
                  onEditorChange={field.onChange}
                  init={{
                    height: 300,
                    menubar: true,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media table paste code help wordcount",
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic backcolor | \
                      alignleft aligncenter alignright alignjustify | \
                      bullist numlist outdent indent | removeformat | help",
                    images_upload_handler: handleImageUpload,
                  }}
                />
              )}
            />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (INR) *
              </label>
              <input
                type="number"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price cannot be negative" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2999"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4999"
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
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.level.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="certificateIncluded"
                  {...register("certificateIncluded")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  {...register("isFeatured")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublished"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Publish Now
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

        {/* Prerequisites */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>

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
              + Add Week
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

