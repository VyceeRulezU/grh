import React from 'react'

export default function Head() {
  return (
    <>
      <link rel="canonical" href="https://www.governanceresourcehub.com" />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.governanceresourcehub.com" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Governance Resource Hub" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://www.governanceresourcehub.com" />
      <meta name="twitter:title" content="Governance Resource Hub | Excellence Redefined" />
      <meta name="twitter:description" content="A premium, unified platform for governance excellence — featuring interactive e-learning, a digital research library, AI-powered insights, and advanced institutional diagnostics." />

      <link rel="icon" type="image/png" href="/icon.png?v=2" />
      <link rel="apple-touch-icon" href="/icon.png?v=2" />
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
