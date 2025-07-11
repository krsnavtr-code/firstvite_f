import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getCategoryById, createCategory, updateCategory } from '../../../api/categoryApi';

const CategoryForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    imageFile: null,
    isActive: true,
    showOnHome: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(id);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image ? `${import.meta.env.VITE_API_BASE_URL}${category.image}` : '',
        imageFile: null,
        isActive: category.isActive !== false,
        showOnHome: category.showOnHome || false
      });
    } catch (err) {
      console.error('Error fetching category:', err);
      // Error toast will be shown by the API interceptor
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 3 and 50 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    // Only validate image on create or if a new file is being uploaded
    if (!isEditing && !formData.imageFile) {
      newErrors.image = 'Image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for the request
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || ''); // Ensure description is not null
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('showOnHome', formData.showOnHome || false); // Add showOnHome field
      
      // If we have a new image file, append it
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }
      
      console.log('Sending form data with keys:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      if (isEditing) {
        const response = await updateCategory(id, formDataToSend);
        console.log('Update response:', response);
        toast.success('Category updated successfully');
      } else {
        const response = await createCategory(formDataToSend);
        console.log('Create response:', response);
        toast.success('Category created successfully');
      }
      
      navigate('/admin/categories');
    } catch (err) {
      console.error('Error saving category:', err);
      // Error toast will be shown by the API interceptor
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="p-8">Loading category data...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-black font-bold">
          {isEditing ? `Edit Category: ${formData.name}` : 'Add New Category'}
        </h2>
        {isEditing && (
          <p className="text-sm text-gray-500 mt-1">
            Update the details for this category
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.name ? 'border-red-500' : ''
            }`}
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.description ? 'border-red-500' : ''
            }`}
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Category Image
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({
                      ...prev,
                      image: reader.result,
                      imageFile: file
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              disabled={loading}
            />
            <label
              htmlFor="image"
              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Choose File
            </label>
            <span className="ml-2 text-sm text-gray-500">
              {formData.imageFile ? formData.imageFile.name : 'No file chosen'}
            </span>
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
          {(formData.image || formData.imageUrl) && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Image Preview:</p>
              <img 
                src={formData.image || formData.imageUrl} 
                alt="Preview" 
                className="mt-1 h-32 w-32 object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={loading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="showOnHome"
              name="showOnHome"
              type="checkbox"
              checked={formData.showOnHome}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={loading}
            />
            <label htmlFor="showOnHome" className="ml-2 block text-sm text-gray-900">
              Show on Home Page
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
