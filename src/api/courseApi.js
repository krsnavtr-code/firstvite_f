import axios from './axios';

// Get all courses with optional category filter
export const getCourses = async (category = '') => {
    try {
        const url = category ? `/courses?category=${category}` : '/courses';
        console.log('Fetching courses from:', url);
        const response = await axios.get(url);
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

// Get single course by ID
export const getCourseById = async (id) => {
    try {
        console.log(`Fetching course with ID: ${id}`);
        const response = await axios.get(`/courses/${id}`);
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
        console.log('Creating course with data:', courseData);
        const response = await axios.post('/courses', courseData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 10000 // 10 seconds timeout
        });
        
        if (!response.data) {
            throw new Error('No data received in response');
        }
        
        console.log('Course created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
};

// Update a course (full or partial update)
export const updateCourse = async (id, courseData, isPartial = false) => {
    try {
        console.log(`${isPartial ? 'Partially' : 'Fully'} updating course ${id} with data:`, courseData);
        const method = isPartial ? 'patch' : 'put';
        const response = await axios[method](`/courses/${id}`, courseData, {
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

// Get all categories for course form
export const getCategoriesForForm = async () => {
    try {
        console.log('Fetching categories for form');
        const response = await axios.get('/categories');
        console.log('Categories fetched successfully:', response.data);
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
