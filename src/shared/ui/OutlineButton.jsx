import React from 'react';
import Button from './Button';

const OutlineButton = ({ children, ...props }) => {
  return (
    <Button variant="outline" {...props}>
      {children}
    </Button>
  );
};

export default OutlineButton;
