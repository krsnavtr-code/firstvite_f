import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createCourse, updateCourse, getCourseById, getCategoriesForForm } from '../../../api/courseApi';

const CourseForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue 
  } = useForm();

  // Fetch categories and course data (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories for dropdown
        const categoriesData = await getCategoriesForForm();
        setCategories(categoriesData);
        
        // If editing, fetch the course data
        if (isEdit && id) {
          const course = await getCourseById(id);
          // Set form values with course data
          Object.entries(course).forEach(([key, value]) => {
            if (key === 'category') {
              setValue(key, value._id);
            } else if (value !== null) {
              setValue(key, value);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      }
    };
    
    fetchData();
  }, [id, isEdit, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    console.log('Form submitted with data:', formData);
    
    try {
      // Ensure price is a number
      const dataToSubmit = {
        ...formData,
        price: Number(formData.price)
      };
      
      console.log('Submitting course data:', dataToSubmit);
      
      if (isEdit && id) {
        console.log(`Updating course with ID: ${id}`);
        await updateCourse(id, dataToSubmit);
        toast.success('Course updated successfully');
      } else {
        console.log('Creating new course');
        await createCourse(dataToSubmit);
        toast.success('Course created successfully');
      }
      
      // Navigate back to courses list
      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
        // Show detailed error message from backend if available
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Failed to save course. Please check the form and try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Error:', error.message);
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Course' : 'Create New Course'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Title */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter course title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor *
            </label>
            <input
              type="text"
              {...register('instructor', { required: 'Instructor is required' })}
              className={`w-full px-3 py-2 border rounded-md ${errors.instructor ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter instructor name"
            />
            {errors.instructor && (
              <p className="mt-1 text-sm text-red-600">{errors.instructor.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className={`block w-full pl-7 pr-12 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <input
              type="text"
              {...register('duration', { required: 'Duration is required' })}
              className={`w-full px-3 py-2 border rounded-md ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 8 weeks, 3 months"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              {...register('level')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Image URL */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              {...register('image')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              {...register('description', { required: 'Description is required' })}
              className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter course description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              id="isPublished"
              type="checkbox"
              {...register('isPublished')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Publish this course
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? 'Updating...' : 'Creating...'}
              </span>
            ) : isEdit ? (
              'Update Course'
            ) : (
              'Create Course'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
