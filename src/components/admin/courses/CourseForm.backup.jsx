import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createCourse, updateCourse, getCourseById, getCategoriesForForm, updateCourseSection } from '../../../api/courseApi';
import {
  FormField,
  RichTextEditor,
  FileUpload,
  TabPanel,
  TabButton,
  DynamicList
} from '../../common/FormComponents';

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
  // const [activeTab, setActiveTab] = useState('basic');


  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      mentors: [{
        name: '',
        title: '',
        bio: '',
        image: '',
        socialLinks: { linkedin: '', twitter: '', github: '' }
      }],
      curriculum: [{
        week: 1,
        title: '',
        description: '',
        topics: [''],
        duration: ''
      }],
      faqs: [{ question: '', answer: '' }],
      benefits: [''],
      skills: [''],
      prerequisites: [''],
      tags: [''],
      certificateIncluded: true,
      isFeatured: false,
      isPublished: false,
      language: 'English'
    }
  });

  // Field arrays for dynamic form sections
  const { fields: mentorFields, append: appendMentor, remove: removeMentor } = useFieldArray({
    control,
    name: 'mentors'
  });

  const { fields: curriculumFields, append: appendWeek, remove: removeWeek } = useFieldArray({
    control,
    name: 'curriculum'
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: 'faqs'
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: 'benefits'
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  });

  const { fields: prerequisiteFields, append: appendPrerequisite, remove: removePrerequisite } = useFieldArray({
    control,
    name: 'prerequisites'
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
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

  // Save a specific section of the course
  const saveSection = async (section, sectionData) => {
    if (!courseId) {
      // If no course ID exists yet, create a new course first with just the title
      try {
        setSavingSection('basic');
        const newCourse = await createCourse({
          title: watch('title') || 'New Course',
          status: 'draft'
        });
        setCourseId(newCourse._id);
      } catch (error) {
        console.error('Error creating new course:', error);
        toast.error('Failed to create new course');
        return;
      } finally {
        setSavingSection(null);
      }
    }

    try {
      setSavingSection(section);
      console.log(`Saving section ${section} with data:`, sectionData);

      if (section === 'basic') {
        // For basic info, we can update the course directly
        await updateCourse(courseId, sectionData, true);
      } else {
        // For other sections, use the section-specific endpoint
        await updateCourseSection(courseId, section, sectionData);
      }

      // Mark this section as saved
      setSavedSections(prev => new Set([...prev, section]));
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} saved successfully`);
      return true;
    } catch (error) {
      console.error(`Error saving section ${section}:`, error);

      let errorMessage = `Failed to save ${section} section. `;
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please try again.';
      }

      toast.error(errorMessage);
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  // Handle saving the current tab
  const handleSaveSection = async (section) => {
    const formData = getValues();
    let sectionData = {};

    // Extract only the relevant fields for this section
    switch (section) {
      case 'basic':
        sectionData = {
          title: formData.title,
          shortDescription: formData.shortDescription,
          description: formData.description,
          category: formData.category,
          instructor: formData.instructor,
          price: Number(formData.price),
          duration: Number(formData.duration),
          level: formData.level,
          language: formData.language,
          isPublished: formData.isPublished,
          isFeatured: formData.isFeatured,
          hasCertificate: formData.hasCertificate
        };
        break;

      case 'details':
        sectionData = {
          benefits: formData.benefits.filter(b => b.trim() !== ''),
          prerequisites: formData.prerequisites.filter(p => p.trim() !== ''),
          faqs: formData.faqs.filter(faq =>
            faq.question.trim() !== '' && faq.answer.trim() !== ''
          )
        };
        break;

      case 'curriculum':
        sectionData = {
          curriculum: formData.curriculum
            .map(week => ({
              ...week,
              topics: week.topics.filter(t => t.trim() !== '')
            }))
            .filter(week =>
              week.title.trim() !== '' ||
              week.description.trim() !== '' ||
              week.topics.length > 0
            )
        };
        break;

      case 'mentors':
        sectionData = {
          mentors: formData.mentors.filter(mentor => mentor.name.trim() !== '')
        };
        break;

      case 'media':
        sectionData = {
          image: formData.image,
          previewVideo: formData.previewVideo,
          thumbnail: formData.thumbnail
        };
        break;

      case 'seo':
        sectionData = {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          slug: formData.slug,
          tags: formData.tags.filter(t => t.trim() !== '')
        };
        break;
    }

    return await saveSection(section, sectionData);
  };

  // Handle form submission (save all sections)
  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      // Save each section one by one
      const sections = ['basic', 'details', 'curriculum', 'mentors', 'media', 'seo'];

      for (const section of sections) {
        const success = await handleSaveSection(section);
        if (!success) {
          // If any section fails to save, stop and show error
          return;
        }
      }

      // If we get here, all sections saved successfully
      toast.success('Course saved successfully!');
      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add a new item to a field array
  const addNewItem = (appendFn, defaultValue = '') => {
    appendFn(defaultValue);
  };

  // Helper function to render input with label and error message
  const renderInput = (label, name, type = 'text', options = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {options.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name, { required: options.required, ...options })}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message || 'This field is required'}</p>
      )}
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
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message || 'This field is required'}</p>
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
          <div className={errors[name] ? 'border border-red-500 rounded' : ''}>
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

  const [activeTab, setActiveTab] = useState('basic');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderDynamicList = (fields, appendFn, removeFn, placeholder, name) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900">{name}</h3>
        <button
          type="button"
          onClick={() => appendFn(name === 'faqs' ? { question: '', answer: '' } : '')}
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </h1>
        <div className="space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-1">
            {['basic', 'details', 'curriculum', 'mentors', 'media', 'seo'].map((tab) => (
              <TabButton
                key={tab}
                tab={tab}
                currentTab={activeTab}
                onClick={handleTabChange}
              >
                {tab.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </TabButton>
            ))}
          </nav>
        </div>

        {/* Basic Info Tab */}
        <TabPanel isActive={activeTab === 'basic'}>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {renderInput('Course Title *', 'title', 'text', { required: true })}
              {renderTextarea('Short Description', 'shortDescription')}
              {renderRichText('Detailed Description', 'description')}
              {renderInput('Price', 'price', 'number')}
              {renderInput('Duration (weeks)', 'duration', 'number')}
              {renderInput('Language', 'language')}
              {renderInput('Category', 'category')}
              {renderInput('Level', 'level')}
            </div>
          </div>
        </TabPanel>

        {/* Details Tab */}
        <TabPanel isActive={activeTab === 'details'}>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {renderInput('What You Will Learn', 'whatYouWillLearn', 'textarea')}
              {renderInput('Who This Course Is For', 'targetAudience', 'textarea')}
              {renderInput('Requirements', 'requirements', 'textarea')}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Skills You'll Gain</h3>
                {renderDynamicList(skillFields, appendSkill, removeSkill, 'Add a skill', 'skills')}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Prerequisites</h3>
                {renderDynamicList(prerequisiteFields, appendPrerequisite, removePrerequisite, 'Add a prerequisite', 'prerequisites')}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                {renderDynamicList(tagFields, appendTag, removeTag, 'Add a tag', 'tags')}
              </div>
              }
            })
          }
          className="w-full flex justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Another Mentor
        </button>
      </div>
    </TabPanel>

    {/* Media Tab */}
    <TabPanel isActive={activeTab === 'media'}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Image</h3>
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
                          setValue('image', event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
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
                    {renderInput('Full Name *', `mentors.${index}.name`, 'text', { required: true })}
                    {renderInput('Title/Role', `mentors.${index}.title`)}
                    {renderTextarea('Bio', `mentors.${index}.bio`, { rows: 4 })}
                  </div>
                  <div className="space-y-4">
                    {renderInput('Profile Image URL', `mentors.${index}.image`, 'url')}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Social Links</h4>
                      {renderInput('LinkedIn', `mentors.${index}.socialLinks.linkedin`, 'url')}
                      {renderInput('Twitter', `mentors.${index}.socialLinks.twitter`, 'url')}
                      {renderInput('GitHub', `mentors.${index}.socialLinks.github`, 'url')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                appendMentor({
                  name: '',
                  title: '',
                  bio: '',
                  image: '',
                  socialLinks: {
                    linkedin: '',
                    twitter: '',
                    github: ''
                  }
                })
              }
              className="w-full flex justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Another Mentor
            </button>
          </div>
        </TabPanel>

        {/* Media Tab */}
        <TabPanel isActive={activeTab === 'media'}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Image</h3>
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
                              setValue('image', event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {watch('image') && (
                <div className="mt-2">
                  <img
                    src={watch('image')}
                    alt="Course preview"
                    className="h-40 w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Preview Video</h3>
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
              {watch('previewVideo') && (
                <div className="mt-2">
                  <video
                    src={watch('previewVideo')}
                    controls
                    className="w-full rounded-md"
                  />
                </div>
              )}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or enter video URL
                </label>
                Meta Description
              </label>
              <textarea
                {...register('metaDescription', {
                  maxLength: { value: 160, message: 'Recommended: 150-160 characters' }
                })}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="A brief description of the page for search engines"
              />
              <p className="mt-1 text-xs text-gray-500">
                {watch('metaDescription')?.length || 0}/160 characters
              </p>
              {errors.metaDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>
              )}
            </div>
            {renderTextarea('Keywords (comma-separated)', 'tags', {
              placeholder: 'e.g., programming, web development, coding',
              rows: 2
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Settings</h3>
          <div className="space-y-4">
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

            <div className="flex items-center">
              <input
                id="isFeatured"
                type="checkbox"
                {...register('isFeatured')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Feature this course on the homepage
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="hasCertificate"
                type="checkbox"
                {...register('hasCertificate')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="hasCertificate" className="ml-2 block text-sm text-gray-700">
                Issue certificate upon completion
              </label>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Access
              </label>
              <select
                {...register('accessType')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="free">Free - Anyone can enroll</option>
                <option value="paid">Paid - Requires purchase</option>
                <option value="subscription">Subscription - Available to subscribers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                {...register('difficulty')}
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
                {...register('estimatedHours', { min: 1 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 10"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
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
                  {...register('slug')}
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
                {...register('customScripts')}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-sm"
                placeholder="<!-- Add custom scripts here (e.g., Google Analytics) -->"
              />
              <p className="mt-1 text-xs text-gray-500">
                These scripts will be added to the head section of this course page
              </p>
            </div>
          </div>
        </div>
    </div>
  </TabContent >

      </form >
    </div >
  );
};

export default CourseForm;
