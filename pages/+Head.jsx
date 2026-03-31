import React from 'react'

export default function Head() {
  return (
    <>
      <link rel="icon" type="image/png" href="/icon.png?v=1" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1" />
      <link rel="shortcut icon" href="/favicon.ico?v=1" />
      <link rel="apple-touch-icon" href="/icon.png?v=1" />
      <meta name="theme-color" content="#4DA771" />
      
      {/* DNS Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Typography & Iconography */}
      <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    </>
  )
}
