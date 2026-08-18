import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'food' | 'chef';
}

export const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop';
export const DEFAULT_CHEF_IMAGE = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop';

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackType = 'food',
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const defaultSrc = fallbackType === 'chef' ? DEFAULT_CHEF_IMAGE : DEFAULT_FOOD_IMAGE;
  const imageSrc = !src || hasError ? defaultSrc : src;

  return (
    <img loading="lazy" decoding="async" fetchpriority="low"
      {...props}
      src={imageSrc}
      alt={alt || 'تصویر'}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
        }
        if (onError) {
          onError(e);
        }
      }}
    />
  );
};
