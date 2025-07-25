import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
  return <i className={`fas fa-${name} ${className}`} aria-hidden="true"></i>;
};

export default Icon;
