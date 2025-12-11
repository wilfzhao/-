import React, { useEffect, useRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ indeterminate = false, className, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`rounded border-gray-300 text-blue-600 focus:ring-0 bg-white accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 ${className || ''}`}
      {...props}
    />
  );
};