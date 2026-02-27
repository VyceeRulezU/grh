import React from 'react';
import LoginPage from './LoginPage';

const AdminLoginPage = (props) => {
  return <LoginPage {...props} isAdmin={true} />;
};

export default AdminLoginPage;
