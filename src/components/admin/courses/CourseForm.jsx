import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createCourse,
  updateCourse,
  getCourseById,
  getCategoriesForForm,
  updateCourseSection,
} from "../../../api/courseApi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CourseForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savingSection, setSavingSection] = useState(null);
  const [savedSections, setSavedSections] = useState(new Set());
  const [courseId, setCourseId] = useState(isEdit ? id : null);
  const [categories, setCategories] = useState([]);
  const [courseImage, setCourseImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  // Tab navigation state
  const [activeTab, setActiveTab] = useState("basic");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
    trigger, // Add trigger for manual validation
  } = useForm({
    defaultValues: {
      mentors: [
        {
          name: "",
          title: "",
          bio: "",
          image: "",
          socialLinks: { linkedin: "", twitter: "", github: "" },
        },
      ],
      curriculum: [
        {
          week: 1,
          title: "",
          description: "",
          topics: [""],
          duration: "",
        },
      ],
      faqs: [{ question: "", answer: "" }],
      benefits: [""],
      skills: [""],
      prerequisites: [""],
      tags: [""],
      certificateIncluded: true,
      isFeatured: false,
      isPublished: false,
      language: "English",
    },
  });

  // Field arrays for dynamic form sections
  const {
    fields: mentorFields,
    append: appendMentor,
    remove: removeMentor,
  } = useFieldArray({
    control,
    name: "mentors",
  });

  const {
    fields: curriculumFields,
    append: appendWeek,
    remove: removeWeek,
  } = useFieldArray({
    control,
    name: "curriculum",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faqs",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
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
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags",
  });

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
            if (key === "category") {
              setValue(key, value._id);
            } else if (value !== null) {
              setValue(key, value);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data");
      }
    };

    fetchData();
  }, [id, isEdit, setValue]);

  // Save a specific section of the course
  const saveSection = async (section, sectionData) => {
    console.group(`[saveSection] Starting to save section: ${section}`);
    try {
      console.log('Section data:', JSON.stringify(sectionData, null, 2));
      
      // If no course ID exists yet, create a new course first
      if (!courseId) {
        console.log('[saveSection] No course ID found, creating new course');
        try {
          setSavingSection("basic");
          const courseTitle = watch("title") || "New Course";
          console.log('[saveSection] Creating new course with title:', courseTitle);
          
          // Basic validation
          if (!courseTitle) {
            throw new Error('Course title is required');
          }
          
          // Prepare course data with all fields from sectionData
          const preparedData = {
            title: courseTitle,
            shortDescription: sectionData.shortDescription || '',
            description: sectionData.description || '',
            category: sectionData.category || null,
            instructor: sectionData.instructor || '',
            price: sectionData.price ? Number(sectionData.price) : 0,
            originalPrice: sectionData.originalPrice ? Number(sectionData.originalPrice) : undefined,
            totalHours: sectionData.totalHours ? Number(sectionData.totalHours) : 0,
            duration: sectionData.duration || '',
            level: sectionData.level || 'Beginner',
            language: sectionData.language || 'English',
            benefits: sectionData.benefits || [],
            prerequisites: sectionData.prerequisites || [],
            skills: sectionData.skills || [],
            certificateIncluded: Boolean(sectionData.certificateIncluded),
            status: 'draft'
          };
          
          // Remove undefined values
          Object.keys(preparedData).forEach(key => {
            if (preparedData[key] === undefined) {
              delete preparedData[key];
            }
          });
          
          // Log the prepared data for debugging
          console.log('[saveSection] Prepared course data:', JSON.stringify({
            ...preparedData,
            description: preparedData.description?.substring(0, 50) + '...',
            shortDescription: preparedData.shortDescription?.substring(0, 50) + '...'
          }, null, 2));
          
          console.log('[saveSection] Sending create course request...');
          const newCourse = await createCourse(preparedData);
          
          if (!newCourse) {
            throw new Error('No course data returned from server');
          }
          
          // Get the course ID from either _id or id field
          const courseId = newCourse._id || newCourse.id;
          
          if (!courseId) {
            console.error('[saveSection] Invalid response - missing course ID:', newCourse);
            throw new Error('Invalid response: Missing course ID');
          }
          
          console.log('[saveSection] New course created with ID:', courseId);
          setCourseId(courseId);
          setValue('_id', courseId);
          
          // Update the form data with the course ID and other fields from the response
          if (newCourse) {
            Object.keys(newCourse).forEach(key => {
              if (key !== '_id' && key !== '__v') { // Skip internal fields
                setValue(key, newCourse[key]);
              }
            });
          }
          
          // If this was just creating a new course, we're done
          if (section === 'basic') {
            toast.success('Course created successfully!');
            return true;
          }
          
          // Continue with saving the section data
          console.log(`[saveSection] Now saving section '${section}' data for new course`);
        } catch (error) {
          console.error('[saveSection] Error creating new course:', error);
          toast.error(`Failed to create course: ${error.message}`);
          return false;
        } finally {
          setSavingSection(null);
        }
      }
      
      // If we have a course ID, update the section
      console.log(`[saveSection] Updating section '${section}' for course ${courseId}`);
      console.log('[saveSection] Section data to save:', sectionData);
      
      setSavingSection(section);
      let response;

      try {
        if (isEdit) {
          console.log(`[saveSection] Updating section '${section}' for existing course`);
          console.log(`[saveSection] Sending data to /courses/${courseId}/section/${section}:`, sectionData);
          response = await updateCourseSection(courseId, section, sectionData);
          console.log(`[saveSection] Section '${section}' update response:`, response);
        } else {
          console.log(`[saveSection] Updating course with section '${section}' data`);
          const updateData = {
            ...sectionData,
            status: section === "basic" ? "draft" : undefined,
          };
          console.log('[saveSection] Update data:', updateData);
          
          response = await updateCourse(courseId, updateData);
        }
      
        console.log(`[saveSection] Save successful for section '${section}':`, response);

        // Mark this section as saved
        setSavedSections((prev) => {
          const updated = new Set([...prev, section]);
          console.log(`[saveSection] Updated saved sections:`, Array.from(updated));
          return updated;
        });
        
        toast.success(
          `${section.charAt(0).toUpperCase() + section.slice(1)} saved successfully`
        );
        return true;
      } catch (error) {
        console.error(`[saveSection] Error saving section '${section}':`, error);
        
        // Log detailed error information
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        }
        
        let errorMessage = `Failed to save ${section} section. `;
        if (error.response) {
          console.error('[saveSection] Error response data:', error.response.data);
          console.error('[saveSection] Error response status:', error.response.status);
          if (error.response.data?.message) {
            errorMessage += error.response.data.message;
          }
        } else if (error.request) {
          console.error('[saveSection] No response received:', error.request);
          errorMessage += "No response from server. ";
        } else {
          console.error('[saveSection] Error message:', error.message);
        }
        
        errorMessage += error.message || "Please try again.";
        toast.error(errorMessage);
        return false;
      } finally {
        setSavingSection(null);
        console.groupEnd();
      }
    } catch (error) {
      console.error(`[saveSection] Unexpected error in saveSection:`, error);
      toast.error('An unexpected error occurred while saving');
      return false;
    }
  };

  // Handle saving the current tab
  const handleSaveSection = async (section) => {
    console.group(`[handleSaveSection] Starting save for section: ${section}`);
    console.log(`[handleSaveSection] Current courseId: ${courseId}`);
    
    try {
      const formData = getValues();
      console.log(`[handleSaveSection] Form data for ${section}:`, formData);
      
      // Process text area fields - handle both strings and arrays
      const processTextArea = (input) => {
        if (!input) return [];
        
        // If input is already an array, return a cleaned copy
        if (Array.isArray(input)) {
          return input
            .map(item => String(item).trim())
            .filter(item => item !== '');
        }
        
        // If input is a string, split by newlines and clean
        if (typeof input === 'string') {
          return input
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        }
        
        // For any other type, convert to string and process
        return String(input)
          .split('\n')
          .map(item => item.trim())
          .filter(item => item !== '');
      };
      
      const processedData = {
        ...formData,
        benefits: processTextArea(formData.benefits),
        prerequisites: processTextArea(formData.prerequisites),
        skills: processTextArea(formData.skills),
        requirements: processTextArea(formData.requirements),
        whoIsThisFor: processTextArea(formData.whoIsThisFor)
      };
      
      let sectionData = {};
      
      // Prepare section data based on the section being saved
      switch (section) {
        case 'basic':
          sectionData = {
            title: processedData.title || '',
            shortDescription: processedData.shortDescription || '',
            description: processedData.description || '',
            category: processedData.category || '',
            instructor: processedData.instructor || '',
            duration: processedData.duration || '',
            totalHours: processedData.totalHours ? Number(processedData.totalHours) : 0,
            level: processedData.level || 'Beginner',
            price: processedData.price ? Number(processedData.price) : 0,
            originalPrice: processedData.originalPrice ? Number(processedData.originalPrice) : 0,
            certificateIncluded: Boolean(processedData.certificateIncluded),
            language: processedData.language || 'English',
            benefits: processedData.benefits,
            prerequisites: processedData.prerequisites,
            skills: processedData.skills,
            status: 'draft'
          };
          
          // Only remove undefined values, keep empty strings
          Object.keys(sectionData).forEach(key => {
            if (sectionData[key] === undefined) {
              delete sectionData[key];
            } else if (typeof sectionData[key] === 'number' && isNaN(sectionData[key])) {
              sectionData[key] = 0; // Convert NaN to 0 for number fields
            }
          });
          
          console.log('Processed basic section data:', sectionData);
          break;
          
        case 'details':
          sectionData = {
            benefits: Array.isArray(processedData.benefits) ? processedData.benefits : [],
            prerequisites: Array.isArray(processedData.prerequisites) ? processedData.prerequisites : [],
            skills: Array.isArray(processedData.skills) ? processedData.skills : [],
            requirements: Array.isArray(processedData.requirements) ? processedData.requirements : [],
            whoIsThisFor: Array.isArray(processedData.whoIsThisFor) ? processedData.whoIsThisFor : [],
            faqs: Array.isArray(processedData.faqs) ? processedData.faqs : []
          };
          
          // Ensure all array fields are present, even if empty
          const requiredFields = ['benefits', 'prerequisites', 'skills', 'requirements', 'whoIsThisFor', 'faqs'];
          requiredFields.forEach(field => {
            if (!(field in sectionData)) {
              sectionData[field] = [];
            }
          });
          
          console.log('Processed details section data:', sectionData);
          break;
          
        case 'curriculum':
          sectionData = {
            curriculum: (formData.curriculum || [])
              .map((week) => ({
                ...week,
                topics: (week.topics || []).filter((t) => t.trim() !== ''),
              }))
              .filter(
                (week) =>
                  (week.title && week.title.trim() !== '') ||
                  (week.description && week.description.trim() !== '') ||
                  (week.topics && week.topics.length > 0)
              ),
          };
          break;
          
        case 'mentors':
          sectionData = {
            mentors: (formData.mentors || [])
              .filter((mentor) => mentor && mentor.name && mentor.name.trim() !== '')
              .map((mentor) => ({
                ...mentor,
                name: mentor.name.trim()
              }))
          };
          break;
          
        case 'media':
          sectionData = {
            image: formData.image || '',
            previewVideo: formData.previewVideo || '',
            thumbnail: formData.thumbnail || '',
          };
          break;
          
        case 'seo':
          sectionData = {
            metaTitle: formData.metaTitle || '',
            metaDescription: formData.metaDescription || '',
            slug: formData.slug || '',
            tags: (formData.tags || []).filter((t) => t && t.trim() !== ''),
          };
          break;
      }

      console.log(`[handleSaveSection] Prepared section data for ${section}:`, sectionData);
      const result = await saveSection(section, sectionData);
      console.log(`[handleSaveSection] saveSection result for ${section}:`, result);
      return result;
    } catch (error) {
      console.error(`[handleSaveSection] Error in handleSaveSection for ${section}:`, error);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  // Handle form submission (save all sections)
  const onSubmit = async (formData) => {
    if (!formData) {
      console.error('No form data provided to onSubmit');
      return;
    }
    console.log('onSubmit called with data:', formData);
    console.group('[onSubmit] Starting form submission');
    console.log('Form submitted with data:', formData);
    setLoading(true);

    try {
      // Save each section one by one
      const sections = [
        "basic",
        "details",
        "curriculum",
        "mentors",
        "media",
        "seo",
      ];

      for (const section of sections) {
        console.log(`[onSubmit] Processing section: ${section}`);
        try {
          console.log(`[onSubmit] Calling handleSaveSection for ${section}`);
          const success = await handleSaveSection(section);
          console.log(`[onSubmit] Section ${section} save result:`, success);
          
          if (!success) {
            // If any section fails to save, stop and show error
            const errorMsg = `[onSubmit] Failed to save section: ${section}`;
            console.error(errorMsg);
            toast.error(`Failed to save ${section} section. Please try again.`);
            console.groupEnd();
            return;
          }
        } catch (error) {
          const errorMsg = `[onSubmit] Error saving section ${section}:`;
          console.error(errorMsg, error);
          toast.error(`Error saving ${section} section. Please check the console for details.`);
          console.groupEnd();
          return;
        }
      }

      // If we get here, all sections saved successfully
      console.log('[onSubmit] All sections saved successfully');
      toast.success("Course saved successfully!");
      console.groupEnd();
      navigate("/admin/courses");
    } catch (error) {
      const errorMsg = '[onSubmit] Unexpected error in form submission:';
      console.error(errorMsg, error);
      toast.error("An unexpected error occurred while saving the course.");
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add a new item to a field array
  const addNewItem = (appendFn, defaultValue = "") => {
    appendFn(defaultValue);
  };

  // Helper function to render input with label and error message
  const renderInput = (label, name, type = "text", options = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {options.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name, { required: options.required, ...options })}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[name].message || "This field is required"}
        </p>
      )}
    </div>
  );

  // Helper function to render a dynamic list of items
  const renderDynamicList = (fields, appendFn, removeFn, placeholder, name) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900">{name}</h3>
        <button
          type="button"
          onClick={() =>
            appendFn(name === "faqs" ? { question: "", answer: "" } : "")
          }
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add {name}
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              {...register(`${name}.${index}`)}
              placeholder={placeholder}
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => removeFn(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Remove any other declarations of activeTab in the file

  // Tab navigation component
  const TabButton = ({ tab, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-t-md ${
        activeTab === tab
          ? "bg-white border-t border-l border-r border-gray-300 text-indigo-600"
          : "text-gray-600 hover:text-gray-800 bg-gray-100"
      }`}
    >
      {children}
    </button>
  );

  // Tab content component
  const TabContent = ({ tab, children }) => (
    <div
      className={`p-6 border border-t-0 rounded-b-md ${
        activeTab === tab ? "block" : "hidden"
      }`}
    >
      {children}
    </div>
  );

  // Helper function to render textarea
  const renderTextarea = (label, name, options = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {options.required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...register(name, { required: options.required, ...options })}
        rows={options.rows || 3}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[name].message || "This field is required"}
        </p>
      )}
    </div>
  );

  // Helper function to render rich text editor
  const renderRichText = (label, name, options = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {options.required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{ required: options.required }}
        render={({ field }) => (
          <div className={errors[name] ? "border border-red-500 rounded" : ""}>
            <ReactQuill
              theme="snow"
              value={field.value}
              onChange={field.onChange}
              className="h-64 mb-12"
            />
          </div>
        )}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">This field is required</p>
      )}
    </div>
  );

  // Handle form submission with React Hook Form
  const onFormSubmit = async (formData) => {
    console.log('=== Form submission started ===');
    console.log('Form data:', formData);
    
    try {
      // Determine which fields to validate based on the current tab
      const tabFields = {
        basic: ['title', 'shortDescription', 'description', 'category', 'instructor', 'duration', 'totalHours', 'price', 'originalPrice', 'certificateIncluded', 'level', 'benefits', 'prerequisites', 'skills', 'language'], 
        details: ['whatYouWillLearn', 'requirements', 'whoIsThisFor'],
        curriculum: ['curriculum'],
        mentors: ['mentors'],
        media: ['image', 'previewVideo', 'thumbnail'],
        seo: ['metaTitle', 'metaDescription', 'slug', 'tags']
      };
      
      // Only validate fields in the current tab
      const fieldsToValidate = tabFields[activeTab] || [];
      console.log('Validating fields:', fieldsToValidate);
      
      // Trigger validation for current tab fields
      const isValid = await trigger(fieldsToValidate);
      console.log('Form validation result:', isValid);
      
      if (!isValid) {
        toast.error(`Please fill in all required fields in the ${activeTab} tab`);
        return;
      }
      
      // If validation passes, proceed with submission
      console.log('Calling onSubmit with form values...');
      await onSubmit(formData);
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An error occurred while submitting the form');
    }
  };

  // Log when the form is rendered
  console.log('Rendering form with handleSubmit:', typeof handleSubmit);
  
  // Create a memoized submit handler
  const handleFormSubmit = React.useCallback((e) => {
    console.log('Form submit event triggered');
    e.preventDefault();
    console.log('Calling handleSubmit...');
    
    // Get the form data
    const formData = getValues();
    console.log('Form data before validation:', formData);
    
    // Call the validation and submission logic directly
    onFormSubmit(formData).catch(error => {
      console.error('Error in form submission:', error);
    });
  }, [getValues, onFormSubmit]);
  
  return (
    <form 
      onSubmit={handleFormSubmit}
      className="space-y-6" 
      noValidate
    >
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        <TabButton tab="basic">Basic Info</TabButton>
        <TabButton tab="details">Course Details</TabButton>
        <TabButton tab="curriculum">Curriculum</TabButton>
        <TabButton tab="mentors">Mentors</TabButton>
        <TabButton tab="media">Media</TabButton>
        <TabButton tab="seo">SEO</TabButton>
      </div>

      {/* Basic Info Tab */}
      <TabContent tab="basic">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            {renderInput("Course Title", "title", "text", { required: true })}
            {renderTextarea("Short Description", "shortDescription", {
              required: true,
              maxLength: { value: 300, message: "Maximum 300 characters" },
            })}
            {renderRichText("Full Description", "description", {
              required: true,
            })}
          </div>

          <div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  {...register("category", { required: true })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    Category is required
                  </p>
                )}
              </div>

              {renderInput("Instructor", "instructor", "text", {
                required: true,
              })}
              {renderInput("Duration", "duration", "text", {
                required: true,
              })}
              {renderInput("Total Hours", "totalHours", "number")}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  {...register("level", { required: true })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {renderInput("Price", "price", "number", {
                    required: true,
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                </div>
                <div>
                  {renderInput("Original Price", "originalPrice", "number", {
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="certificateIncluded"
                  type="checkbox"
                  {...register("certificateIncluded")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="certificateIncluded"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Certificate Included
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {renderTextarea(
              "What will students learn? (One per line)",
              "benefits",
              {
                rows: 6,
                placeholder: "Enter each benefit on a new line",
              }
            )}

            {renderTextarea("Prerequisites (One per line)", "prerequisites", {
              rows: 4,
              placeholder: "Enter each prerequisite on a new line",
            })}

            {renderTextarea("Skills (One per line)", "skills", {
              rows: 4,
              placeholder: "Enter each skill on a new line",
            })}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <input
                type="text"
                {...register("language")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., English, Spanish, etc."
              />
            </div>
          </div>
        </div>
      </TabContent>

      {/* Course Details Tab */}
      <TabContent tab="details">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Course Requirements
              </h3>
              <div className="space-y-4">
                {prerequisiteFields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register(`prerequisites.${index}`)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter a requirement"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendPrerequisite("")}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Requirement
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Target Audience
              </h3>
              <div className="space-y-4">
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register(`benefits.${index}`)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Who is this course for?"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendBenefit("")}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Target Audience
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {faqFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      FAQ #{index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question *
                      </label>
                      <input
                        type="text"
                        {...register(`faqs.${index}.question`, {
                          required: true,
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer *
                      </label>
                      <textarea
                        {...register(`faqs.${index}.answer`, {
                          required: true,
                        })}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter answer"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendFaq({ question: "", answer: "" })}
                className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add FAQ
              </button>
            </div>
          </div>
        </div>
      </TabContent>

      {/* Curriculum Tab */}
      <TabContent tab="curriculum">
        <div className="space-y-6">
          {curriculumFields.map((field, weekIndex) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Week {weekIndex + 1}
                </h3>
                {curriculumFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWeek(weekIndex)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Week
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Week Title *
                    </label>
                    <input
                      type="text"
                      {...register(`curriculum.${weekIndex}.title`, {
                        required: true,
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="e.g., Introduction to React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      {...register(`curriculum.${weekIndex}.duration`)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register(`curriculum.${weekIndex}.description`)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What will students learn this week?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics / Lessons
                  </label>
                  <div className="space-y-2">
                    {field.topics?.map((_, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          {...register(
                            `curriculum.${weekIndex}.topics.${topicIndex}`
                          )}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder={`Topic ${topicIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const topics = watch(
                              `curriculum.${weekIndex}.topics`
                            );
                            const newTopics = [...topics];
                            newTopics.splice(topicIndex, 1);
                            setValue(
                              `curriculum.${weekIndex}.topics`,
                              newTopics
                            );
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const topics =
                          watch(`curriculum.${weekIndex}.topics`) || [];
                        setValue(`curriculum.${weekIndex}.topics`, [
                          ...topics,
                          "",
                        ]);
                      }}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Topic
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendWeek({
                week: curriculumFields.length + 1,
                title: "",
                description: "",
                topics: [""],
                duration: "",
              })
            }
            className="w-full flex justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Week
          </button>
        </div>
      </TabContent>

      {/* Mentors Tab */}
      <TabContent tab="mentors">
        <div className="space-y-6">
          {mentorFields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {field.name || `Mentor ${index + 1}`}
                </h3>
                {mentorFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMentor(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Mentor
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {renderInput("Full Name *", `mentors.${index}.name`, "text", {
                    required: true,
                  })}
                  {renderInput("Title/Role", `mentors.${index}.title`)}
                  {renderTextarea("Bio", `mentors.${index}.bio`, { rows: 4 })}
                </div>
                <div className="space-y-4">
                  {renderInput(
                    "Profile Image URL",
                    `mentors.${index}.image`,
                    "url"
                  )}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Social Links
                    </h4>
                    {renderInput(
                      "LinkedIn",
                      `mentors.${index}.socialLinks.linkedin`,
                      "url"
                    )}
                    {renderInput(
                      "Twitter",
                      `mentors.${index}.socialLinks.twitter`,
                      "url"
                    )}
                    {renderInput(
                      "GitHub",
                      `mentors.${index}.socialLinks.github`,
                      "url"
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendMentor({
                name: "",
                title: "",
                bio: "",
                image: "",
                socialLinks: {
                  linkedin: "",
                  twitter: "",
                  github: "",
                },
              })
            }
            className="w-full flex justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Another Mentor
          </button>
        </div>
      </TabContent>

      {/* Media Tab */}
      <TabContent tab="media">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Course Image
              </h3>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="course-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="course-image"
                        name="course-image"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setValue("image", event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {watch("image") && (
                <div className="mt-2">
                  <img
                    src={watch("image")}
                    alt="Course preview"
                    className="h-40 w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Course Preview Video
              </h3>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="preview-video"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a video</span>
                      <input
                        id="preview-video"
                        name="preview-video"
                        type="file"
                        className="sr-only"
                        accept="video/*"
                      />
                    </label>
                    <p className="pl-1">or paste a URL</p>
                  </div>
                  <p className="text-xs text-gray-500">MP4 up to 50MB</p>
                </div>
              </div>
              {watch("previewVideo") && (
                <div className="mt-2">
                  <video
                    src={watch("previewVideo")}
                    controls
                    className="w-full rounded-md"
                  />
                </div>
              )}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or enter video URL
                </label>
                <input
                  type="url"
                  {...register("previewVideo")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Thumbnail Image
            </h3>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="thumbnail-image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a thumbnail</span>
                    <input
                      id="thumbnail-image"
                      name="thumbnail-image"
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setValue("thumbnail", event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            {watch("thumbnail") && (
              <div className="mt-2">
                <img
                  src={watch("thumbnail")}
                  alt="Thumbnail preview"
                  className="h-40 w-64 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </div>
      </TabContent>

      {/* SEO & Settings Tab */}
      <TabContent tab="seo">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              SEO Settings
            </h3>
            <div className="space-y-4">
              {renderInput("Meta Title", "metaTitle", "text", {
                maxLength: {
                  value: 60,
                  message: "Recommended: 50-60 characters",
                },
              })}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  {...register("metaDescription", {
                    maxLength: {
                      value: 160,
                      message: "Recommended: 150-160 characters",
                    },
                  })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="A brief description of the page for search engines"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {watch("metaDescription")?.length || 0}/160 characters
                </p>
                {errors.metaDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.metaDescription.message}
                  </p>
                )}
              </div>
              {renderTextarea("Keywords (comma-separated)", "tags", {
                placeholder: "e.g., programming, web development, coding",
                rows: 2,
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="isPublished"
                  type="checkbox"
                  {...register("isPublished")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublished"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Publish this course
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="isFeatured"
                  type="checkbox"
                  {...register("isFeatured")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Feature this course on the homepage
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="hasCertificate"
                  type="checkbox"
                  {...register("hasCertificate")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="hasCertificate"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Issue certificate upon completion
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Access
                </label>
                <select
                  {...register("accessType")}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="free">Free - Anyone can enroll</option>
                  <option value="paid">Paid - Requires purchase</option>
                  <option value="subscription">
                    Subscription - Available to subscribers
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  {...register("difficulty")}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time to Complete (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("estimatedHours", { min: 1 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Advanced Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom URL Slug
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    yourwebsite.com/courses/
                  </span>
                  <input
                    type="text"
                    {...register("slug")}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="custom-url-slug"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to auto-generate from course title
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Scripts (Advanced)
                </label>
                <textarea
                  {...register("customScripts")}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-sm"
                  placeholder="<!-- Add custom scripts here (e.g., Google Analytics) -->"
                />
                <p className="mt-1 text-xs text-gray-500">
                  These scripts will be added to the head section of this course
                  page
                </p>
              </div>
            </div>
          </div>
        </div>
      </TabContent>
      
      {/* Form Footer with Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
        <div>
          <button
            type="button"
            onClick={() => {
              console.log('Test button clicked');
              console.log('Form values:', getValues());
              console.log('Form errors:', errors);
              console.log('Active tab:', activeTab);
              console.log('Loading state:', loading);
            }}
            className="px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 mr-3"
          >
            Test Button
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={async () => {
              console.log('Manual save button clicked');
              try {
                const formData = getValues();
                console.log('Form data to submit:', formData);
                await onFormSubmit(formData);
              } catch (error) {
                console.error('Error in manual save:', error);
              }
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
          >
            Manual Save
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CourseForm;
