// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Job      = require('./models/Job');

async function seed() {
  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });


  // 3. Sample jobs array
  const sampleJobs = [
    {
      title: 'Software Engineer',
      company: 'TechSoft',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['JavaScript', 'Node.js', 'React', 'Git'],
      description: 'Develop and maintain web applications using the MERN stack.'
    },
    {
      title: 'Frontend Developer',
      company: 'WebWorks',
      location: 'Chittagong, Bangladesh',
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Vue.js'],
      description: 'Build responsive UI components for client projects.'
    },
    {
      title: 'Backend Developer',
      company: 'DataCorp',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
      description: 'Design and implement server-side logic and database schemas.'
    },
    {
      title: 'Full-Stack Developer',
      company: 'InnovateX',
      location: 'Remote',
      requiredSkills: ['JavaScript', 'Node.js', 'React', 'AWS'],
      description: 'End-to-end development on cloud-based web platforms.'
    },
    {
      title: 'Data Scientist',
      company: 'Insight Analytics',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Python', 'Pandas', 'scikit-learn', 'Machine Learning'],
      description: 'Analyze data and build predictive models to drive business insights.'
    },
    {
      title: 'Data Analyst',
      company: 'Insight Analytics',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['SQL', 'Excel', 'Tableau', 'Python'],
      description: 'Generate reports and visualizations from large datasets.'
    },
    {
      title: 'Registered Nurse',
      company: 'MediCare Hospital',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Patient Care', 'Vital Signs Monitoring', 'Medication Administration'],
      description: 'Provide nursing care and support to in-patients and out-patients.'
    },
    {
      title: 'Medical Officer',
      company: 'City Health Clinic',
      location: 'Chittagong, Bangladesh',
      requiredSkills: ['Clinical Diagnosis', 'Patient Counseling', 'Record Keeping'],
      description: 'Examine patients and prescribe treatment plans.'
    },
    {
      title: 'Lab Technician',
      company: 'Central Lab',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Sample Collection', 'Microscopy', 'Lab Safety'],
      description: 'Perform lab tests and maintain laboratory equipment.'
    },
    {
      title: 'Pharmacy Assistant',
      company: 'HealthPlus Pharmacy',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Dispensing', 'Inventory Management', 'Customer Service'],
      description: 'Assist pharmacists and manage medication stock.'
    },
    {
      title: 'MTO Clerk',
      company: 'Road Transport Office',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Data Entry', 'Record Keeping', 'Customer Service'],
      description: 'Process vehicle registrations and driver licenses.'
    },
    {
      title: 'Accountant',
      company: 'FinancePro',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Accounting', 'Excel', 'QuickBooks', 'TAX Regulations'],
      description: 'Manage financial records and prepare tax filings.'
    },
    {
      title: 'HR Manager',
      company: 'PeopleFirst',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Recruitment', 'Employee Relations', 'HR Policies'],
      description: 'Oversee hiring processes and maintain employee welfare programs.'
    },
    {
      title: 'Marketing Specialist',
      company: 'MarketGuru',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['SEO', 'Google Analytics', 'Content Creation'],
      description: 'Plan and execute digital marketing campaigns.'
    },
    {
      title: 'Sales Associate',
      company: 'RetailMart',
      location: 'Chittagong, Bangladesh',
      requiredSkills: ['Customer Service', 'Sales', 'POS Systems'],
      description: 'Assist customers and process transactions in-store.'
    },
    {
      title: 'Customer Support Representative',
      company: 'TechSupport Co.',
      location: 'Remote',
      requiredSkills: ['Communication', 'Troubleshooting', 'CRM'],
      description: 'Provide technical support to end users via phone and email.'
    },
    {
      title: 'Graphic Designer',
      company: 'CreativeStudio',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Adobe Photoshop', 'Illustrator', 'UI/UX Design'],
      description: 'Design marketing materials and user interfaces.'
    },
    {
      title: 'Mechanical Engineer',
      company: 'AutoMech Industries',
      location: 'Gazipur, Bangladesh',
      requiredSkills: ['CAD', 'Mechanical Design', 'Manufacturing Processes'],
      description: 'Design mechanical components and oversee production.'
    },
    {
      title: 'Civil Engineer',
      company: 'BuildIt Constructions',
      location: 'Sylhet, Bangladesh',
      requiredSkills: ['AutoCAD', 'Project Management', 'Structural Analysis'],
      description: 'Plan and manage civil engineering projects.'
    },
    {
      title: 'Electrician',
      company: 'PowerGrid Services',
      location: 'Dhaka, Bangladesh',
      requiredSkills: ['Electrical Wiring', 'Maintenance', 'Safety Compliance'],
      description: 'Install and repair electrical systems.'
    }
  ];

  const additionalJobs = [
  {
    title: 'Project Manager',
    company: 'BRAC',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Project Planning',
      'Stakeholder Management',
      'Risk Management',
      'MS Project',
      'Communication'
    ],
    description: 'Lead cross-functional teams to deliver social impact projects on time and on budget.'
  },
  {
    title: 'Business Analyst',
    company: 'JP Morgan',
    location: 'Singapore',
    requiredSkills: [
      'Business Analysis',
      'Requirements Gathering',
      'SQL',
      'UML',
      'Documentation'
    ],
    description: 'Analyze and document business processes, then translate them into technical requirements.'
  },
  {
    title: 'Finance Manager',
    company: 'Unilever Bangladesh',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Financial Reporting',
      'Budget Management',
      'Excel',
      'SAP',
      'Analytical Skills'
    ],
    description: 'Oversee financial operations, prepare annual budgets, and ensure compliance with global standards.'
  },
  {
    title: 'Quality Assurance Engineer',
    company: 'Grameenphone',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Selenium',
      'Java',
      'API Testing',
      'Test Planning',
      'Bug Tracking'
    ],
    description: 'Design and execute test plans for web and mobile applications to maintain high service quality.'
  },
  {
    title: 'DevOps Engineer',
    company: 'Robi Axiata',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'AWS',
      'Docker',
      'Kubernetes',
      'CI/CD',
      'Terraform'
    ],
    description: 'Automate deployment pipelines and manage cloud infrastructure for high-availability services.'
  },
  {
    title: 'Mobile App Developer',
    company: 'Pathao',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Flutter',
      'Dart',
      'Firebase',
      'REST APIs',
      'Git'
    ],
    description: 'Build and maintain cross-platform mobile applications used by millions of users.'
  },
  {
    title: 'UI/UX Designer',
    company: 'Banglalink',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Figma',
      'Adobe XD',
      'Sketch',
      'User Research',
      'Prototyping'
    ],
    description: 'Create intuitive interfaces and experiences for web and mobile products.'
  },
  {
    title: 'Content Writer',
    company: 'The Daily Star',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Content Writing',
      'SEO',
      'Editing',
      'WordPress',
      'Research'
    ],
    description: 'Produce and edit articles, features, and web content for our online and print publications.'
  },
  {
    title: 'Digital Marketing Manager',
    company: 'Nestlé Bangladesh',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Google Ads',
      'Facebook Ads',
      'SEO',
      'Content Strategy',
      'Analytics'
    ],
    description: 'Plan and execute digital campaigns to boost brand awareness and drive online sales.'
  },
  {
    title: 'Logistics Coordinator',
    company: 'DHL Express',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Logistics Management',
      'SAP',
      'Inventory Control',
      'Customer Service',
      'Documentation'
    ],
    description: 'Coordinate shipments, manage customs documentation, and ensure timely delivery of goods.'
  },
  {
    title: 'Data Engineer',
    company: 'Microsoft',
    location: 'Singapore',
    requiredSkills: [
      'Hadoop',
      'Spark',
      'Python',
      'SQL',
      'ETL'
    ],
    description: 'Design and maintain large-scale data pipelines and warehouses for analytics solutions.'
  },
  {
    title: 'Research Scientist',
    company: 'BCSIR',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Research',
      'Data Analysis',
      'Scientific Writing',
      'Experimentation',
      'Problem Solving'
    ],
    description: 'Conduct scientific experiments and publish findings in peer-reviewed journals.'
  },
  {
    title: 'Mechanical Technician',
    company: 'Bangladesh Railway',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Mechanical Maintenance',
      'Troubleshooting',
      'Blueprint Reading',
      'Welding',
      'Safety Compliance'
    ],
    description: 'Perform maintenance and repair on locomotives and rolling stock.'
  },
  {
    title: 'Electrical Engineer',
    company: 'Bangladesh Power Development Board',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Circuit Design',
      'AutoCAD',
      'Power Systems',
      'Maintenance',
      'Troubleshooting'
    ],
    description: 'Design, test, and maintain electrical power systems for the national grid.'
  },
  {
    title: 'Mathematics Teacher',
    company: 'International School Dhaka',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Teaching',
      'Curriculum Development',
      'Classroom Management',
      'Assessment',
      'Communication'
    ],
    description: 'Teach math to grades 6–12 using the IB and Cambridge curricula.'
  },
  {
    title: 'Customer Success Manager',
    company: 'bKash',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Customer Relationship',
      'CRM',
      'Problem Solving',
      'Account Management',
      'Communication'
    ],
    description: 'Build and maintain relationships with key clients to ensure product adoption.'
  },
  {
    title: 'HR Generalist',
    company: 'Square Pharmaceuticals',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Recruitment',
      'Onboarding',
      'HR Policies',
      'Employee Relations',
      'HRIS'
    ],
    description: 'Manage full-cycle recruitment and employee engagement programs.'
  },
  {
    title: 'Legal Counsel',
    company: 'British American Tobacco Bangladesh',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Legal Research',
      'Contract Drafting',
      'Regulatory Compliance',
      'Risk Management',
      'Communication'
    ],
    description: 'Advise on corporate governance, contracts, and local regulations.'
  },
  {
    title: 'UX Researcher',
    company: 'Evaly',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'User Research',
      'Usability Testing',
      'Interviewing',
      'Persona Development',
      'Data Analysis'
    ],
    description: 'Conduct user studies and translate insights into actionable design recommendations.'
  },
  {
    title: 'Audio-Video Production Specialist',
    company: 'RTV',
    location: 'Dhaka, Bangladesh',
    requiredSkills: [
      'Video Editing',
      'Audio Mixing',
      'Final Cut Pro',
      'Camera Operation',
      'Lighting'
    ],
    description: 'Produce and edit broadcast-quality video and audio content for TV and online platforms.'
  }
];

// Then, in your seed script:
const allJobs = [...sampleJobs, ...additionalJobs];
await Job.insertMany(allJobs);

  // 5. Disconnect
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
