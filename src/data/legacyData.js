export const COURSES = [
  { 
    id:1, 
    title:"Foundations of Public Governance", 
    category:"Governance Basics", 
    level:"Beginner", 
    duration:"8 hrs", 
    lessons:12, 
    students:3420, 
    rating:4.8, 
    instructor:"Dr. Amaka Okonkwo", 
    thumbnail:"🏛️", 
    description:"A comprehensive introduction to public governance principles, accountability frameworks, and institutional design.", 
    trending:true, 
    featured:true, 
    progress:0,
    sections:[
      {title:"Introduction to Governance",topics:["What is Governance?","Historical Context","Governance Models Quiz"]},
      {title:"Accountability Frameworks",topics:["Horizontal Accountability","Vertical Accountability","Case Study Practice"]},
      {title:"Institutional Design",topics:["Three Arms of Government","Separation of Powers","Quiz: Institutional Checks"]},
      {title:"Public Policy Process",topics:["Policy Cycle Overview","Agenda Setting","Policy Implementation"]},
      {title:"Transparency & Openness",topics:["Open Government","Freedom of Information","Data Governance"]},
      {title:"Anti-Corruption Mechanisms",topics:["Types of Corruption","UNCAC Framework","Quiz: Integrity Systems"]},
      {title:"Legislative Oversight",topics:["Parliamentary Committees","Budget Scrutiny","Case Studies"]},
      {title:"Judicial Independence",topics:["Rule of Law","Judicial Review","International Standards"]},
      {title:"Decentralisation",topics:["Fiscal Federalism","Local Governance","Community Participation"]},
      {title:"Civil Society & Governance",topics:["NGO Roles","Civic Engagement","Participatory Budgeting"]},
      {title:"Digital Governance",topics:["E-Government","Digital ID Systems","Open Data Initiatives"]},
      {title:"Final Assessment & Certificate",topics:["Comprehensive Quiz","Reflection Essay","Certificate Claim"]}
    ]
  },
  { 
    id:2, 
    title:"Corporate Governance Essentials", 
    category:"Corporate", 
    level:"Intermediate", 
    duration:"10 hrs", 
    lessons:14, 
    students:2180, 
    rating:4.7, 
    instructor:"Prof. Chidi Nwachukwu", 
    thumbnail:"📊", 
    description:"Master corporate governance including board structures, shareholder rights, and compliance frameworks.", 
    trending:true, 
    featured:false, 
    progress:35,
    sections:[
      {title:"Corporate Governance Intro",topics:["History","OECD Principles","Why It Matters"]},
      {title:"Board of Directors",topics:["Board Composition","Independent Directors","Board Committees"]},
      {title:"Shareholder Rights",topics:["Types of Shareholders","Shareholder Activism","Quiz"]},
      {title:"Executive Compensation",topics:["Pay Structures","Performance Metrics","Governance Failures"]},
      {title:"Risk Management",topics:["Enterprise Risk","Risk Appetite","Case Study: Enron"]},
      {title:"Internal Controls",topics:["COSO Framework","Internal Audit","Whistleblower Policies"]},
      {title:"Financial Reporting",topics:["IFRS Standards","Audit Independence","Disclosure"]},
      {title:"ESG Integration",topics:["Environmental Factors","Social Responsibility","Governance Ratings"]},
      {title:"Regulatory Compliance",topics:["SEC Requirements","Sarbanes-Oxley","Global Frameworks"]},
      {title:"Conflict of Interest",topics:["Related Party Transactions","Ethics Codes","Real Cases"]},
      {title:"Stakeholder Management",topics:["Mapping Stakeholders","Engagement Strategies","Reporting"]},
      {title:"Digital Transformation",topics:["Cybersecurity Governance","AI Ethics","Tech Risks"]},
      {title:"Crisis Governance",topics:["Leadership in Crisis","Board Responsibilities","Recovery"]},
      {title:"Final Assessment",topics:["Capstone Quiz","Certificate"]}
    ]
  },
  { 
    id:3, 
    title:"Public Financial Management", 
    category:"Finance", 
    level:"Advanced", 
    duration:"12 hrs", 
    lessons:12, 
    students:1650, 
    rating:4.9, 
    instructor:"Dr. Fatima Al-Hassan", 
    thumbnail:"💰", 
    description:"Deep-dive into government budgeting, public expenditure, revenue management and fiscal accountability.", 
    trending:false, 
    featured:true, 
    progress:0,
    sections:[
      {title:"PFM Systems Overview",topics:["PFM Framework","PEFA Assessment","Key Players"]},
      {title:"Budget Preparation",topics:["MTEF","Budget Circular","Sector Ceilings"]},
      {title:"Revenue Administration",topics:["Tax Policy","Revenue Forecasting","Customs Management"]},
      {title:"Treasury Management",topics:["TSA","Cash Management","Debt Management"]},
      {title:"Budget Execution",topics:["Warrant System","Commitment Controls","Virements"]},
      {title:"Procurement & Contracts",topics:["Procurement Laws","Tender Processes","PPP Governance"]},
      {title:"Internal Audit",topics:["Risk-Based Auditing","IAU Independence","Reporting Lines"]},
      {title:"Financial Reporting",topics:["IPSAS","Whole of Government Accounts","Transparency"]},
      {title:"External Audit",topics:["SAI Independence","Performance Audit","INTOSAI Standards"]},
      {title:"Legislative Scrutiny",topics:["PAC Functions","Budget Hearings","Oversight Reports"]},
      {title:"Subnational PFM",topics:["Fiscal Transfers","Local Revenue","Conditional Grants"]},
      {title:"Certification",topics:["Final Exam","Certificate of Completion"]}
    ]
  },
  { 
    id:4, 
    title:"Anti-Corruption & Integrity Systems", 
    category:"Integrity", 
    level:"Intermediate", 
    duration:"9 hrs", 
    lessons:12, 
    students:2890, 
    rating:4.6, 
    instructor:"Ms. Ngozi Adebayo", 
    thumbnail:"⚖️", 
    description:"Build integrity systems, understand anti-corruption legislation, and design prevention mechanisms.", 
    trending:true, 
    featured:false, 
    progress:70,
    sections:[
      {title:"Understanding Corruption",topics:["Definitions","Types & Forms","Measurement Indices"]},
      {title:"UNCAC Framework",topics:["Prevention","Criminalisation","Asset Recovery"]},
      {title:"Integrity Systems",topics:["National Integrity System","Institutional Pillars","TI Framework"]},
      {title:"Asset Declaration",topics:["Disclosure Laws","Verification Systems","Public Access"]},
      {title:"Conflict of Interest",topics:["Legal Frameworks","Management Strategies","Case Studies"]},
      {title:"Anti-Money Laundering",topics:["FATF Standards","Customer Due Diligence","Reporting"]},
      {title:"Whistleblower Protection",topics:["International Standards","Mechanisms","Case Studies"]},
      {title:"Investigation Techniques",topics:["Financial Investigations","Open Source Intelligence","Digital Evidence"]},
      {title:"Prosecution & Courts",topics:["Asset Forfeiture","Mutual Legal Assistance","Enforcement"]},
      {title:"Private Sector Compliance",topics:["Anti-Bribery Laws","Due Diligence","ISO 37001"]},
      {title:"Prevention & Education",topics:["Awareness Campaigns","Education Programs","Behavior Change"]},
      {title:"Capstone",topics:["Final Assessment","Certificate"]}
    ]
  },
  { 
    id:5, 
    title:"Electoral Systems & Democracy", 
    category:"Democracy", 
    level:"Beginner", 
    duration:"7 hrs", 
    lessons:12, 
    students:4100, 
    rating:4.5, 
    instructor:"Dr. Emeka Chibuike", 
    thumbnail:"🗳️", 
    description:"Understand electoral systems, democratic processes, voter rights, and election integrity mechanisms.", 
    trending:false, 
    featured:false, 
    progress:0, 
    sections:[
      {title:"Democracy Fundamentals",topics:["Types of Democracy","Democratic Values","Global Trends"]},
      {title:"Electoral Systems",topics:["Proportional Representation","First-Past-the-Post","Mixed Systems"]},
      {title:"Electoral Management",topics:["EMB Independence","Election Planning","Voter Registration"]},
      {title:"Campaign Finance",topics:["Regulations","Disclosure","Foreign Funding"]},
      {title:"Voter Rights",topics:["Universal Suffrage","Special Populations","Disenfranchisement"]},
      {title:"Election Technology",topics:["Electronic Voting","Biometrics","Cybersecurity"]},
      {title:"Election Observation",topics:["International Standards","Domestic Observation","EISA Framework"]},
      {title:"Electoral Disputes",topics:["Adjudication Systems","Courts vs Tribunals","Case Studies"]},
      {title:"Women in Elections",topics:["Gender Quotas","Barriers","Best Practices"]},
      {title:"Election Violence",topics:["Root Causes","Prevention","Early Warning"]},
      {title:"Post-Election Reviews",topics:["Lessons Learned","Recommendations","Reform Processes"]},
      {title:"Final Assessment",topics:["Exam","Certificate"]}
    ]
  },
  { 
    id:6, 
    title:"Open Government & Civic Tech", 
    category:"Digital", 
    level:"Intermediate", 
    duration:"8 hrs", 
    lessons:12, 
    students:1340, 
    rating:4.7, 
    instructor:"Adaeze Eze, MSc", 
    thumbnail:"🌐", 
    description:"Explore open government principles, civic technology, transparency platforms and participatory governance.", 
    trending:false, 
    featured:false, 
    progress:15, 
    sections:[
      {title:"Open Government Partnership",topics:["OGP Overview","National Action Plans","Key Commitments"]},
      {title:"Transparency Tools",topics:["Freedom of Info Laws","Proactive Disclosure","Open Contracting"]},
      {title:"Civic Technology",topics:["GovTech Ecosystem","Citizen Portals","Digital Services"]},
      {title:"Open Data",topics:["Open Data Standards","Data Quality","Use Cases"]},
      {title:"Participatory Governance",topics:["e-Participation","Online Consultations","Digital Town Halls"]},
      {title:"Right to Information",topics:["RTI Laws","Proactive Publishing","Exemptions"]},
      {title:"Accountability Platforms",topics:["Budget Trackers","Contract Portals","Citizen Feedback"]},
      {title:"Social Accountability",topics:["Community Scorecards","Public Hearings","Social Audits"]},
      {title:"Digital ID & Services",topics:["National ID Systems","Service Delivery","Privacy"]},
      {title:"Smart Cities",topics:["Urban Governance","IoT in Cities","Data Governance"]},
      {title:"Cybersecurity & Governance",topics:["Critical Infrastructure","Policy Frameworks","Response"]},
      {title:"Certification",topics:["Comprehensive Test","Certificate"]}
    ]
  },
];

export const RESOURCES = [
  {id:1,title:"Public Financial Management Handbook",type:"Book",category:"Finance",author:"World Bank",year:2023,pages:312,tags:["PFM","budget","treasury"],featured:true,description:"A comprehensive guide to public financial management systems, covering budget preparation, execution, and accountability."},
  {id:2,title:"Anti-Corruption in the Public Sector",type:"Report",category:"Integrity",author:"Transparency International",year:2023,pages:88,tags:["anti-corruption","UNCAC","integrity"],featured:true,description:"In-depth analysis of anti-corruption mechanisms across 180 countries, with case studies and reform recommendations."},
  {id:3,title:"Governance Indicators: A User's Guide",type:"Article",category:"Governance",author:"OECD",year:2022,pages:45,tags:["indicators","measurement","data"],featured:false,description:"Guide to interpreting and applying governance indicators for policy assessment and reform tracking."},
  {id:4,title:"Electoral Systems and Democratic Governance",type:"Book",category:"Democracy",author:"IDEA International",year:2022,pages:256,tags:["elections","democracy","reform"],featured:false,description:"Comprehensive analysis of electoral system design and its implications for democratic representation."},
  {id:5,title:"Open Government Partnership Progress Report",type:"Report",category:"Transparency",author:"OGP Secretariat",year:2023,pages:124,tags:["open government","OGP","transparency"],featured:true,description:"Annual review of member countries' progress on open government commitments and action plans."},
  {id:6,title:"Digital Governance Readiness Assessment",type:"Article",category:"Digital",author:"UNDP",year:2023,pages:62,tags:["digital","e-government","readiness"],featured:false,description:"Framework and methodology for assessing a government's readiness to deliver digital public services."},
  {id:7,title:"Local Government Finance: Best Practices",type:"Book",category:"Finance",author:"UN-Habitat",year:2022,pages:198,tags:["local government","fiscal decentralisation"],featured:false,description:"Best practices in subnational government finance, covering revenue mobilisation and expenditure management."},
  {id:8,title:"Legislative Strengthening Toolkit",type:"Report",category:"Governance",author:"NDI",year:2023,pages:78,tags:["legislature","oversight","capacity"],featured:false,description:"Practical toolkit for strengthening parliamentary functions including oversight, lawmaking and representation."},
  {id:9,title:"Gender and Governance: A Global Review",type:"Article",category:"Governance",author:"UN Women",year:2023,pages:54,tags:["gender","inclusion","participation"],featured:true,description:"Global review of women's participation in governance institutions and policy-making processes."},
  {id:10,title:"PEFA Framework: Assessing PFM Systems",type:"Report",category:"Finance",author:"PEFA Secretariat",year:2022,pages:104,tags:["PEFA","assessment","PFM"],featured:false,description:"The Public Expenditure and Financial Accountability framework for assessing the quality of PFM systems."},
];

export const HISTORY_DATA = [
  {id:1,title:"PFM reform strategies",date:"Today"},
  {id:2,title:"Electoral system comparison",date:"Yesterday"},
  {id:3,title:"Anti-corruption frameworks",date:"This week"},
  {id:4,title:"Open government initiatives",date:"This week"},
];

export const SUGGESTED = [
  "What are the key principles of good governance?",
  "Explain the PEFA framework for PFM assessment",
  "How does UNCAC address corruption prevention?",
  "What are best practices in electoral design?",
  "Describe the Open Government Partnership",
  "How can governments strengthen oversight?",
];

export const COUNTRIES = [
  { 
    id: "ng", name: "Nigeria", flag: "🇳🇬", score: 64, trend: "+3",
    scores: { va: 68, ps: 52, ge: 61, rq: 64, rl: 59, cc: 45 }
  },
  { 
    id: "gh", name: "Ghana", flag: "🇬🇭", score: 72, trend: "+5",
    scores: { va: 75, ps: 68, ge: 70, rq: 68, rl: 72, cc: 65 }
  },
  { 
    id: "ke", name: "Kenya", flag: "🇰🇪", score: 67, trend: "+2",
    scores: { va: 70, ps: 55, ge: 65, rq: 62, rl: 68, cc: 58 }
  },
  { 
    id: "rw", name: "Rwanda", flag: "🇷🇼", score: 78, trend: "+8",
    scores: { va: 55, ps: 85, ge: 88, rq: 82, rl: 75, cc: 80 }
  },
  { 
    id: "za", name: "South Africa", flag: "🇿🇦", score: 70, trend: "-1",
    scores: { va: 82, ps: 58, ge: 72, rq: 75, rl: 78, cc: 55 }
  },
  { 
    id: "uk", name: "United Kingdom", flag: "🇬🇧", score: 88, trend: "+1",
    scores: { va: 92, ps: 85, ge: 90, rq: 94, rl: 95, cc: 90 }
  }
];

export const DIMENSIONS = [
  { 
    id: "va", title: "Voice & Accountability", icon: "📢", color: "#4DA771", 
    description: "Extent to which citizens participate in selecting their government, as well as freedom of expression." 
  },
  { 
    id: "ps", title: "Political Stability", icon: "🛡️", color: "#3B82F6", 
    description: "Likelihood that the government will be destabilized or overthrown by unconstitutional means." 
  },
  { 
    id: "ge", title: "Government Effectiveness", icon: "⚙️", color: "#8B5CF6", 
    description: "Quality of public services, civil service, and the degree of its independence from political pressures." 
  },
  { 
    id: "rq", title: "Regulatory Quality", icon: "📋", color: "#F59E0B", 
    description: "Ability of the government to formulate and implement sound policies that permit private sector development." 
  },
  { 
    id: "rl", title: "Rule of Law", icon: "⚖️", color: "#EF4444", 
    description: "Extent to which agents have confidence in and abide by the rules of society, specifically contract enforcement." 
  },
  { 
    id: "cc", title: "Control of Corruption", icon: "🛡️", color: "#6366F1", 
    description: "Extent to which public power is exercised for private gain, including both petty and grand forms of corruption." 
  }
];


export const MENTORS = [
  {
    id: 1,
    name: "Dr. Amaka Okonkwo",
    role: "Governance Specialist, World Bank",
    category: "Governance",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80"
  },
  {
    id: 2,
    name: "Dr. Fatima Al-Hassan",
    role: "PFM Advisor, IMF",
    category: "Public Finance",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80"
  },
  {
    id: 3,
    name: "Prof. Chidi Nwachukwu",
    role: "Corporate Governance, Lagos BSE",
    category: "Corporate",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80"
  },
  {
    id: 4,
    name: "Ms. Ngozi Adebayo",
    role: "Anti-Corruption Specialist, AU",
    category: "Integrity",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80"
  },
  {
    id: 5,
    name: "Dr. Emeka Chibuike",
    role: "Electoral Systems Expert, IDEA",
    category: "Democracy",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80"
  },
  {
    id: 6,
    name: "Adaeze Eze, MSc",
    role: "Civic Tech & Open Government",
    category: "Digital",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80"
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Emeka Okafor",
    role: "Budget Director, Federal Ministry of Finance",
    text: "The PFM course completely changed how I approach budget execution in my ministry. The PEFA framework module alone was worth the entire programme. Highly practical and evidence-based.",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80",
    rating: 5,
    featured: true
  },
  {
    id: 2,
    name: "Amina Bello",
    role: "Compliance Officer, EFCC",
    text: "The anti-corruption modules gave our compliance team a shared framework. We implemented UNCAC-aligned internal controls within a month of completion.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80",
    rating: 5
  },
  {
    id: 3,
    name: "Taiwo Adeyemi",
    role: "Policy Researcher, CLEEN Foundation",
    text: "Excellent content and well-paced. The electoral systems course gave me the comparative context I needed for our reform advocacy work.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80",
    rating: 4
  },
  {
    id: 4,
    name: "Chinwe Eze",
    role: "LGA Finance Officer, Anambra State",
    text: "As a local government official, I found the decentralisation and fiscal federalism sections incredibly relevant. Now I can articulate our fiscal gaps with data.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80",
    rating: 5
  },
  {
    id: 5,
    name: "Babatunde Lawal",
    role: "Policy Advisor, Ogun State Government",
    text: "The open government course gave me the tools to draft our state's first transparency policy. Real frameworks, not theory.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80",
    rating: 5
  }
];

