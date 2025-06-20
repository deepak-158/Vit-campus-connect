import React, { useState, useEffect } from 'react';
import api from '../../api';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

const UserRating = ({ userId, size = 'md' }) => {
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/ratings/user/${userId}`);
        setRating(response.data.rating);
      } catch (error) {
        console.error('Error fetching user rating:', error);
        setError('Failed to load rating');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchRating();
    }
  }, [userId]);
  
  if (loading) {
    return (
      <div className="flex items-center">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }
  
  if (error || !rating) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const starClass = sizeClasses[size] || sizeClasses.md;
  
  // Round to nearest 0.5
  const roundedRating = Math.round(rating.average * 2) / 2;
  
  // Generate array of 5 stars
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(roundedRating)) {
      // Full star
      stars.push(<StarIconSolid key={i} className={`${starClass} text-yellow-400`} />);
    } else if (i - 0.5 === roundedRating) {
      // Half star (use full star with CSS clip)
      stars.push(
        <div key={i} className="relative">
          <StarIconOutline className={`${starClass} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <StarIconSolid className={`${starClass} text-yellow-400`} />
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(<StarIconOutline key={i} className={`${starClass} text-gray-300`} />);
    }
  }
  
  return (
    <div className="flex items-center">
      <div className="flex mr-1">
        {stars}
      </div>
      <span className={`text-${size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs'} text-gray-600`}>
        ({rating.count})
      </span>
    </div>
  );
};

export default UserRating;
