import React from 'react';
import Button from './Button';

const SecondaryButton = ({ children, ...props }) => {
  return (
    <Button variant="secondary" {...props}>
      {children}
    </Button>
  );
};

export default SecondaryButton;
