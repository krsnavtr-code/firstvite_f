import axios from './axios';

// Upload course image
export const uploadCourseImage = async (formData) => {
    try {
        // Create a new instance of axios without the default JSON content-type
        const uploadAxios = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const response = await uploadAxios.post('/courses/upload-image', formData);
        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

// Get all courses with optional category filter
// If isAdmin is true, will include unpublished courses
export const getCourses = async (category = '', isAdmin = false) => {
    try {
        const params = {};
        if (category) params.category = category;
        if (isAdmin) params.all = 'true'; // This will tell the backend to return all courses
        
        // console.log('Fetching courses with params:', params);
        const response = await axios.get('/courses', { params });
        console.log('Courses fetched successfully');
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

// Get single course by ID with all necessary fields
export const getCourseById = async (id) => {
    try {
        console.log(`Fetching course with ID: ${id}`);
        const response = await axios.get(`/courses/${id}`, {
            params: {
                fields: 'title,description,shortDescription,category,instructor,price,originalPrice,discount,thumbnail,rating,enrolledStudents,duration,whatYouWillLearn,requirements,whoIsThisFor,curriculum,reviews,isFeatured,slug,status,metaTitle,metaDescription,tags'
            }
        });
        console.log('Course fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching course with ID ${id}:`, error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

// Create a new course
export const createCourse = async (courseData) => {
    try {
        // Ensure required fields are present
        const requiredFields = ['title', 'description', 'category', 'instructor', 'price', 'level'];
        const missingFields = requiredFields.filter(field => !courseData[field]);
        
        if (missingFields.length > 0) {
            const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
            error.name = 'ValidationError';
            throw error;
        }
        
        // Clean up the data
        const cleanData = {
            title: courseData.title,
            shortDescription: courseData.shortDescription || '',
            description: courseData.description,
            category: courseData.category,
            instructor: courseData.instructor,
            price: Number(courseData.price) || 0,
            originalPrice: courseData.originalPrice ? Number(courseData.originalPrice) : Number(courseData.price) || 0,
            totalHours: courseData.totalHours ? Number(courseData.totalHours) : 0,
            duration: courseData.duration || '',
            level: courseData.level || 'Beginner',
            language: courseData.language || 'English',
            benefits: Array.isArray(courseData.benefits) ? courseData.benefits : 
                     (typeof courseData.benefits === 'string' ? courseData.benefits.split('\n').filter(b => b.trim() !== '') : []),
            prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites.filter(p => p.trim() !== '') : 
                         (typeof courseData.prerequisites === 'string' ? courseData.prerequisites.split('\n').filter(p => p.trim() !== '') : []),
            whatYouWillLearn: Array.isArray(courseData.whatYouWillLearn) ? courseData.whatYouWillLearn.filter(l => l.trim() !== '') : 
                             (typeof courseData.whatYouWillLearn === 'string' ? courseData.whatYouWillLearn.split('\n').filter(l => l.trim() !== '') : []),
            skills: Array.isArray(courseData.skills) ? courseData.skills.filter(s => s.trim() !== '') : 
                   (typeof courseData.skills === 'string' ? courseData.skills.split('\n').filter(s => s.trim() !== '') : []),
            certificateIncluded: Boolean(courseData.certificateIncluded),
            isFeatured: Boolean(courseData.isFeatured),
            isPublished: Boolean(courseData.isPublished),
            status: courseData.status || 'draft',
            curriculum: courseData.curriculum || [
                {
                    week: 1,
                    title: 'Introduction',
                    description: '',
                    duration: 0,
                    topics: ['Course introduction']
                }
            ]
        };
        
        // Ensure all array fields are present and properly formatted
        const arrayFields = ['benefits', 'prerequisites', 'skills'];
        arrayFields.forEach(field => {
            if (!Array.isArray(cleanData[field])) {
                cleanData[field] = [];
            }
        });
        
        // Remove undefined values
        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === undefined) {
                delete cleanData[key];
            }
        });
        
        console.log('Creating course with cleaned data:', JSON.stringify(cleanData, null, 2));
        
        const response = await axios.post('/courses', cleanData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 10000 // 10 seconds timeout
        });

        const responseData = response.data;
        const responseCourseData = responseData.data || responseData;

        if (!responseCourseData) {
            throw new Error('No data received in response');
        }

        // Ensure the course ID is available
        if (!responseCourseData._id && !responseCourseData.id) {
            console.error('Invalid response - missing course ID:', responseData);
            throw new Error('Invalid response: Missing course ID');
        }
        
        console.log('Course created successfully:', responseCourseData);
        return responseCourseData;
    } catch (error) {
        console.error('Error creating course:', error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            
            // If we have a validation error from the server
            if (error.response.status === 400 || error.response.status === 422) {
                const errorMessage = error.response.data.message || 'Validation failed';
                throw new Error(`Validation Error: ${errorMessage}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            throw new Error('No response received from server. Please check your connection.');
        } else if (error.name === 'ValidationError') {
            console.error('Validation Error:', error.message);
            throw error; // Re-throw validation errors
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        
        // Default error message
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create course';
        throw new Error(errorMessage);
    }
};

// Update a course (full or partial update)
export const updateCourse = async (id, courseData, isPartial = false) => {
    try {
        console.log(`${isPartial ? 'Partially' : 'Fully'} updating course ${id} with data:`, courseData);
        
        // Clean and format the data similar to createCourse
        const cleanData = {
            ...courseData,
            price: courseData.price !== undefined ? Number(courseData.price) : undefined,
            originalPrice: courseData.originalPrice !== undefined ? Number(courseData.originalPrice) : undefined,
            totalHours: courseData.totalHours !== undefined ? Number(courseData.totalHours) : undefined,
            certificateIncluded: courseData.certificateIncluded !== undefined ? Boolean(courseData.certificateIncluded) : undefined,
            isFeatured: courseData.isFeatured !== undefined ? Boolean(courseData.isFeatured) : undefined,
            isPublished: courseData.isPublished !== undefined ? Boolean(courseData.isPublished) : undefined,
            benefits: courseData.benefits !== undefined ? (
                Array.isArray(courseData.benefits) 
                    ? courseData.benefits.filter(b => b && b.trim() !== '') 
                    : (typeof courseData.benefits === 'string' 
                        ? courseData.benefits.split('\n').filter(b => b.trim() !== '') 
                        : [])
            ) : undefined,
            prerequisites: courseData.prerequisites !== undefined ? (
                Array.isArray(courseData.prerequisites) 
                    ? courseData.prerequisites.filter(p => p && p.trim() !== '') 
                    : (typeof courseData.prerequisites === 'string' 
                        ? courseData.prerequisites.split('\n').filter(p => p.trim() !== '') 
                        : [])
            ) : undefined,
            whatYouWillLearn: courseData.whatYouWillLearn !== undefined ? (
                Array.isArray(courseData.whatYouWillLearn) 
                    ? courseData.whatYouWillLearn.filter(l => l && l.trim() !== '') 
                    : (typeof courseData.whatYouWillLearn === 'string' 
                        ? courseData.whatYouWillLearn.split('\n').filter(l => l.trim() !== '') 
                        : [])
            ) : undefined,
            skills: courseData.skills !== undefined ? (
                Array.isArray(courseData.skills) 
                    ? courseData.skills.filter(s => s && s.trim() !== '') 
                    : (typeof courseData.skills === 'string' 
                        ? courseData.skills.split('\n').filter(s => s.trim() !== '') 
                        : [])
            ) : undefined
        };

        // Remove undefined values for partial updates
        const dataToSend = isPartial 
            ? Object.fromEntries(
                Object.entries(cleanData).filter(([_, v]) => v !== undefined)
              )
            : cleanData;

        console.log('Sending cleaned data:', dataToSend);
        
        const method = isPartial ? 'patch' : 'put';
        const response = await axios[method](`/courses/${id}`, dataToSend, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Course ${isPartial ? 'partially ' : ''}updated successfully:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error ${isPartial ? 'partially ' : ''}updating course ${id}:`, error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

// Update specific course section
export const updateCourseSection = async (id, section, sectionData) => {
    try {
        console.log(`Updating course ${id} section '${section}' with data:`, sectionData);
        const response = await axios.patch(`/courses/${id}/section/${section}`, sectionData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`Course section '${section}' updated successfully:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error updating course ${id} section '${section}':`, error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

// Delete a course
export const deleteCourse = async (id) => {
    try {
        console.log(`Deleting course with ID: ${id}`);
        const response = await axios.delete(`/courses/${id}`);
        console.log('Course deleted successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error deleting course ${id}:`, error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

// Get courses by category
// If no categoryId is provided, returns all published courses
export const getCoursesByCategory = async (categoryId = '') => {
  try {
    const params = {
      fields: 'title,description,price,originalPrice,thumbnail,duration,level,instructor,rating,enrolledStudents,isFeatured,category,slug,whatYouWillLearn,requirements,whoIsThisFor,curriculum,reviews,isFeatured,status'
    };
    
    // Add category filter if provided
    if (categoryId) {
      params.category = categoryId;
    }
    
    // console.log('Fetching courses with params:', params);
    const response = await axios.get('/courses', { params });
    // console.log('Courses fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    throw error;
  }
};

// Get all categories for course form
export const getCategoriesForForm = async () => {
    try {
        console.log('Fetching categories for form');
        const response = await axios.get('/categories');
        // console.log('Categories fetched successfully:', response.data);
        return response.data.map(cat => ({
            value: cat._id,
            label: cat.name
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};
