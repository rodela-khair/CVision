// server/services/customResumeParser.js
const pdfParse = require('pdf-parse');
const fs = require('fs');

class CustomResumeParser {
  constructor() {
    // Common skill keywords organized by category
    this.skillPatterns = {
      programming: [
        'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
        'typescript', 'scala', 'perl', 'r programming', 'matlab', 'visual basic', 'assembly', 'cobol',
        'fortran', 'dart', 'elixir', 'haskell', 'clojure', 'erlang', 'lua', 'objective-c'
      ],
      webDevelopment: [
        'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'laravel', 'spring',
        'bootstrap', 'jquery', 'html', 'css', 'sass', 'less', 'webpack', 'babel', 'grunt', 'gulp',
        'next.js', 'nuxt.js', 'svelte', 'ember.js', 'backbone.js', 'gatsby', 'astro'
      ],
      databases: [
        'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis', 'cassandra', 'dynamodb',
        'elasticsearch', 'neo4j', 'mariadb', 'firebase', 'couchdb', 'influxdb', 'snowflake'
      ],
      cloud: [
        'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible',
        'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci', 'heroku', 'vercel',
        'digitalocean', 'cloudflare', 'serverless', 'lambda', 'ec2', 's3', 'rds'
      ],
      tools: [
        'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'trello',
        'postman', 'insomnia', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
        'vs code', 'intellij', 'eclipse', 'vim', 'emacs', 'sublime text'
      ],
      testing: [
        'jest', 'mocha', 'jasmine', 'cypress', 'selenium', 'puppeteer', 'pytest', 'junit',
        'rspec', 'cucumber', 'testng', 'karma', 'protractor', 'enzyme'
      ],
      mobile: [
        'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'phonegap',
        'android development', 'ios development', 'mobile development'
      ],
      dataScience: [
        'machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'keras',
        'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'anaconda',
        'data analysis', 'data visualization', 'statistics', 'tableau', 'power bi', 'excel'
      ],
      methodologies: [
        'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices',
        'restful api', 'graphql', 'soap', 'mvc', 'mvvm', 'clean architecture'
      ]
    };

    // Education patterns
    this.educationPatterns = [
      'bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'certificate',
      'b\\.?s\\.?', 'm\\.?s\\.?', 'b\\.?a\\.?', 'm\\.?a\\.?', 'b\\.?tech', 'm\\.?tech',
      'computer science', 'software engineering', 'information technology', 'electrical engineering',
      'data science', 'artificial intelligence', 'cybersecurity', 'business administration'
    ];

    // Experience patterns
    this.experiencePatterns = [
      'software engineer', 'developer', 'programmer', 'architect', 'senior', 'junior', 'lead',
      'manager', 'director', 'analyst', 'consultant', 'specialist', 'administrator', 'designer',
      'data scientist', 'devops engineer', 'full stack', 'front end', 'backend', 'mobile developer',
      'qa engineer', 'test engineer', 'product manager', 'project manager', 'scrum master'
    ];
  }

  async parseResume(filePath) {
    try {
      console.log('📄 Parsing resume with custom parser:', filePath);
      
      // Read and parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text.toLowerCase();
      
      console.log('📝 Extracted text length:', text.length);

      // Extract information
      const skills = this.extractSkills(text);
      const education = this.extractEducation(text);
      const experience = this.extractExperience(text);
      const contact = this.extractContactInfo(text);

      const result = {
        fullText: pdfData.text,
        skills,
        education,
        experience,
        contact,
        metadata: {
          pages: pdfData.numpages,
          extractedAt: new Date(),
          parser: 'custom-pdf-parse'
        }
      };

      console.log('✅ Parsing complete:', {
        skillsFound: skills.length,
        educationEntries: education.length,
        experienceEntries: experience.length
      });

      return result;
    } catch (error) {
      console.error('❌ Resume parsing error:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  extractSkills(text) {
    const foundSkills = new Set();
    
    // Search through all skill categories
    Object.values(this.skillPatterns).forEach(categorySkills => {
      categorySkills.forEach(skill => {
        const pattern = new RegExp(`\\b${skill}\\b`, 'gi');
        if (pattern.test(text)) {
          // Normalize the skill name
          const normalizedSkill = skill
            .replace(/\\b|\\+|\\./g, '') // Remove regex characters
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          foundSkills.add(normalizedSkill);
        }
      });
    });

    return Array.from(foundSkills).sort();
  }

  extractEducation(text) {
    const education = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are too short or look like garbage
      if (line.length < 3 || line.includes('�') || line.match(/^[^\w\s]+$/)) {
        continue;
      }
      
      // Look for education keywords
      const hasEducationKeyword = this.educationPatterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(line);
      });
      
      if (hasEducationKeyword && line.length > 10 && line.length < 150) {
        // Look for years (4-digit numbers)
        const yearMatch = line.match(/\b(19|20)\d{2}\b/g);
        const years = yearMatch ? yearMatch.map(y => parseInt(y)) : [];
        
        // Clean up the line
        const cleanLine = line.replace(/[^\w\s.,()-]/g, ' ').trim();
        
        education.push({
          degree: cleanLine,
          institution: this.findInstitution(lines, i),
          years: years,
          raw: cleanLine
        });
      }
    }
    
    // Remove duplicates and limit results
    const uniqueEducation = education.filter((item, index, self) => 
      index === self.findIndex(t => t.degree === item.degree)
    );
    
    return uniqueEducation.slice(0, 3); // Limit to 3 entries
  }

  extractExperience(text) {
    const experience = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are too short or look like garbage
      if (line.length < 5 || line.includes('�') || line.match(/^[^\w\s]+$/)) {
        continue;
      }
      
      // Look for job titles or experience keywords
      const hasExperienceKeyword = this.experiencePatterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(line);
      });
      
      if (hasExperienceKeyword && line.length > 5 && line.length < 150) {
        // Look for years and duration
        const yearMatch = line.match(/\b(19|20)\d{2}\b/g);
        const years = yearMatch ? yearMatch.map(y => parseInt(y)) : [];
        
        // Clean up the line
        const cleanLine = line.replace(/[^\w\s.,()-]/g, ' ').trim();
        
        // Look for company name in surrounding lines
        const company = this.findCompany(lines, i);
        
        experience.push({
          title: cleanLine,
          company: company,
          years: years,
          duration: this.calculateDuration(years),
          raw: cleanLine
        });
      }
    }
    
    // Remove duplicates and limit results
    const uniqueExperience = experience.filter((item, index, self) => 
      index === self.findIndex(t => t.title === item.title && t.company === item.company)
    );
    
    return uniqueExperience.slice(0, 5); // Limit to 5 entries
  }

  extractContactInfo(text) {
    const contact = {};
    
    // Email extraction
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }
    
    // Phone extraction
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      contact.phone = phoneMatch[0];
    }
    
    // LinkedIn extraction
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
      contact.linkedin = 'https://' + linkedinMatch[0];
    }
    
    // GitHub extraction
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) {
      contact.github = 'https://' + githubMatch[0];
    }
    
    return contact;
  }

  findInstitution(lines, currentIndex) {
    // Look in the next few lines for institution names
    for (let i = currentIndex + 1; i < Math.min(currentIndex + 3, lines.length); i++) {
      const line = lines[i].trim();
      // Clean and validate the line
      const cleanLine = line.replace(/[^\w\s.,()-]/g, ' ').trim();
      if (cleanLine && cleanLine.length > 3 && cleanLine.length < 100 && !cleanLine.match(/^\d+$/)) {
        return cleanLine;
      }
    }
    return '';
  }

  findCompany(lines, currentIndex) {
    // Look in the previous and next few lines for company names
    for (let i = Math.max(0, currentIndex - 2); i < Math.min(currentIndex + 3, lines.length); i++) {
      if (i === currentIndex) continue;
      
      const line = lines[i].trim();
      // Clean the line first
      const cleanLine = line.replace(/[^\w\s.,()-]/g, ' ').trim();
      
      // Simple heuristic: if line has common company indicators
      if (cleanLine && cleanLine.length > 3 && cleanLine.length < 100 && 
          (cleanLine.includes('Inc') || cleanLine.includes('LLC') || cleanLine.includes('Corp') || 
           cleanLine.includes('Ltd') || cleanLine.includes('Company') || cleanLine.includes('Technologies'))) {
        return cleanLine;
      }
    }
    return '';
  }

  calculateDuration(years) {
    if (years.length >= 2) {
      const start = Math.min(...years);
      const end = Math.max(...years);
      return end - start;
    }
    return 0;
  }
}

module.exports = new CustomResumeParser();
