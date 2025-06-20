import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SellProduct = () => {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    quantity: 1,
    isNegotiable: false
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Categories for products - matching backend enum
  const categories = [
    { label: 'Books & Study Materials', value: 'books' },
    { label: 'Electronics & Gadgets', value: 'electronics' },
    { label: 'Clothing & Accessories', value: 'clothing' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Food Items', value: 'food' },
    { label: 'Other', value: 'other' }
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size should be less than 5MB' });
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      if (errors.image) {
        setErrors({ ...errors, image: '' });
      }
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!image) {
      newErrors.image = 'Please upload an image of your product';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
      try {
      // Create form data for file upload
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description);
      productFormData.append('price', formData.price);
      productFormData.append('category', formData.category);
      productFormData.append('condition', formData.condition);
      productFormData.append('quantity', formData.quantity);
      productFormData.append('isNegotiable', formData.isNegotiable);
      
      if (image) {
        productFormData.append('images', image);
      }
      
      const response = await api.post('/products', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Product listed successfully!');
      navigate(`/products/${response.data.product.id}`);
      
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        setErrors({ ...errors, general: error.response.data.message });
      } else {
        toast.error('Failed to list product. Please try again.');
        setErrors({ ...errors, general: 'Failed to list product. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h1 className="text-lg leading-6 font-medium text-gray-900">Sell a Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          List items you want to sell to other hostellers
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {errors.general}
            </div>
          )}
            <div className="mb-6">
            <Input
              label="Product Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter a clear, descriptive name"
              error={errors.name}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="form-label">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product, include details about condition, features, reason for selling, etc."
              className={`input-field ${errors.description ? 'ring-red-500 focus:ring-red-500' : ''}`}
              required
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Input
                label="Price (₹)"
                id="price"
                name="price"
                type="number"
                min="1"
                step="any"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price in rupees"
                error={errors.price}
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="form-label">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field ${errors.category ? 'ring-red-500 focus:ring-red-500' : ''}`}
                required              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>
            <div className="mb-6">
            <label className="form-label">Condition</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="condition-new"
                  name="condition"
                  type="radio"
                  value="new"
                  checked={formData.condition === 'new'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="condition-new" className="ml-2 block text-sm text-gray-700">
                  New (unused, with or without original packaging)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="condition-like-new"
                  name="condition"
                  type="radio"
                  value="like new"
                  checked={formData.condition === 'like new'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="condition-like-new" className="ml-2 block text-sm text-gray-700">
                  Like New (used minimally, in excellent condition)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="condition-good"
                  name="condition"
                  type="radio"
                  value="good"
                  checked={formData.condition === 'good'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="condition-good" className="ml-2 block text-sm text-gray-700">
                  Good (in good, working condition with normal wear)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="condition-fair"
                  name="condition"
                  type="radio"
                  value="fair"
                  checked={formData.condition === 'fair'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="condition-fair" className="ml-2 block text-sm text-gray-700">
                  Fair (shows wear but still functional)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="condition-poor"
                  name="condition"
                  type="radio"
                  value="poor"
                  checked={formData.condition === 'poor'}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="condition-poor" className="ml-2 block text-sm text-gray-700">
                  Poor (significant wear but still usable)
                </label>
              </div>            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Input
                label="Quantity"
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="1"
              />
            </div>
            
            <div className="flex items-center h-full">
              <div className="flex items-center">
                <input
                  id="isNegotiable"
                  name="isNegotiable"
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isNegotiable" className="ml-2 block text-sm text-gray-700">
                  Price is negotiable
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <label className="form-label">
              Product Image <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden w-full h-64 bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="mt-1 flex justify-center">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <div className="flex flex-col items-center">
                        <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm text-gray-600">
                          Click to upload an image (Max: 5MB)
                        </span>
                      </div>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              )}
              {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              className="mr-3"
              onClick={() => navigate('/hosteller/marketplace')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              List Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellProduct;
