const Job = require('../models/Job');
const Resume = require('../models/Resume');

class SkillGapService {
  
  /**
   * Normalize skills by converting to lowercase and removing duplicates
   */
  static normalizeSkills(skills) {
    if (!Array.isArray(skills)) return [];
    return [...new Set(skills.map(skill => 
      skill.toString().toLowerCase().trim()
    ))].filter(skill => skill.length > 0);
  }

  /**
   * Compare resume skills against job required skills
   * @param {Array} resumeSkills - Array of resume skills
   * @param {Array} jobRequiredSkills - Array of job required skills
   * @returns {Object} - Analysis result with matching and missing skills
   */
  static analyzeSkillGap(resumeSkills, jobRequiredSkills) {
    const normalizedResumeSkills = this.normalizeSkills(resumeSkills);
    const normalizedJobSkills = this.normalizeSkills(jobRequiredSkills);
    
    const matchingSkills = normalizedJobSkills.filter(jobSkill =>
      normalizedResumeSkills.includes(jobSkill)
    );
    
    const missingSkills = normalizedJobSkills.filter(jobSkill =>
      !normalizedResumeSkills.includes(jobSkill)
    );
    
    const matchPercentage = normalizedJobSkills.length > 0 
      ? Math.round((matchingSkills.length / normalizedJobSkills.length) * 100)
      : 0;
    
    return {
      totalRequiredSkills: normalizedJobSkills.length,
      matchingSkills: matchingSkills,
      missingSkills: missingSkills,
      matchCount: matchingSkills.length,
      missingCount: missingSkills.length,
      matchPercentage: matchPercentage,
      skillGapScore: 100 - matchPercentage
    };
  }

  /**
   * Get skill gap analysis for a specific resume against a specific job
   * This method name matches what the controller expects
   */
  static async getResumeJobSkillGap(resumeId, jobId) {
    try {
      const resume = await Resume.findById(resumeId);
      const job = await Job.findById(jobId);
      
      if (!resume || !job) {
        throw new Error('Resume or Job not found');
      }
      
      // Check different possible skill field names
      const resumeSkills = resume.parsedData?.skills || resume.extractedSkills || resume.skills || [];
      const jobSkills = job.requiredSkills || job.skillsRequired || [];
      
      const analysis = this.analyzeSkillGap(resumeSkills, jobSkills);
      
      return {
        resumeId: resume._id,
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        resume: {
          id: resume._id,
          skills: resumeSkills
        },
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          requiredSkills: jobSkills
        },
        analysis: analysis,
        // Also include flat structure for easier access
        matchPercentage: analysis.matchPercentage,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        totalRequiredSkills: analysis.totalRequiredSkills
      };
    } catch (error) {
      console.error('Error in getResumeJobSkillGap:', error);
      throw error;
    }
  }

  /**
   * Get skill gap analysis for a resume against multiple jobs (top matches)
   * This method name matches what the controller expects
   */
  static async getResumeMultiJobSkillGap(resumeId, limit = 10) {
    try {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      // Get top jobs based on some criteria (you can modify this logic)
      const jobs = await Job.find({}).limit(limit);
      
      const resumeSkills = resume.parsedData?.skills || resume.extractedSkills || resume.skills || [];
      
      const jobAnalyses = jobs.map(job => {
        const jobSkills = job.requiredSkills || job.skillsRequired || [];
        const analysis = this.analyzeSkillGap(resumeSkills, jobSkills);
        return {
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          job: {
            id: job._id,
            title: job.title,
            company: job.company,
            requiredSkills: jobSkills
          },
          analysis: analysis,
          // Flat structure for easier access
          matchPercentage: analysis.matchPercentage,
          matchingSkills: analysis.matchingSkills,
          missingSkills: analysis.missingSkills,
          totalRequiredSkills: analysis.totalRequiredSkills
        };
      });

      // Sort by match percentage (best matches first)
      jobAnalyses.sort((a, b) => b.analysis.matchPercentage - a.analysis.matchPercentage);

      // Aggregate most missing skills across all jobs
      const allMissingSkills = {};
      jobAnalyses.forEach(jobAnalysis => {
        jobAnalysis.analysis.missingSkills.forEach(skill => {
          allMissingSkills[skill] = (allMissingSkills[skill] || 0) + 1;
        });
      });

      // Convert to array and sort by frequency
      const mostMissingSkills = Object.entries(allMissingSkills)
        .map(([skill, count]) => ({ skill, count, frequency: Math.round((count / jobs.length) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15); // Top 15 most missing skills

      return {
        resumeId: resumeId,
        resume: {
          id: resume._id,
          skills: resumeSkills
        },
        totalJobsAnalyzed: jobs.length,
        jobAnalyses: jobAnalyses,
        aggregateAnalysis: {
          totalJobsAnalyzed: jobs.length,
          averageMatchPercentage: Math.round(
            jobAnalyses.reduce((sum, ja) => sum + ja.analysis.matchPercentage, 0) / jobs.length
          ),
          mostMissingSkills: mostMissingSkills,
          resumeSkillsCount: resumeSkills.length
        },
        // Also include flat structure matching controller expectations
        aggregatedInsights: {
          topMissingSkills: mostMissingSkills,
          averageMatchPercentage: Math.round(
            jobAnalyses.reduce((sum, ja) => sum + ja.analysis.matchPercentage, 0) / jobs.length
          )
        }
      };
    } catch (error) {
      console.error('Error in getResumeMultiJobSkillGap:', error);
      throw error;
    }
  }

  /**
   * Get skill recommendations based on job market analysis
   * This method name matches what the controller expects
   */
  static async getSkillRecommendations(resumeId) {
    try {
      const multiJobAnalysis = await this.getResumeMultiJobSkillGap(resumeId, 20);
      
      // Get top missing skills as recommendations
      const recommendations = multiJobAnalysis.aggregateAnalysis.mostMissingSkills
        .slice(0, 10)
        .map(item => ({
          skill: item.skill,
          demandFrequency: item.frequency,
          jobsRequiring: item.count,
          priority: item.frequency > 50 ? 'high' : item.frequency > 25 ? 'medium' : 'low'
        }));

      return {
        resumeId: resumeId,
        recommendations: recommendations,
        criticalSkills: multiJobAnalysis.aggregateAnalysis.mostMissingSkills.slice(0, 5),
        improvementAreas: multiJobAnalysis.aggregateAnalysis.mostMissingSkills.slice(5, 10),
        currentMatchPercentage: multiJobAnalysis.aggregateAnalysis.averageMatchPercentage,
        potentialImprovement: Math.min(
          100, 
          multiJobAnalysis.aggregateAnalysis.averageMatchPercentage + (recommendations.length > 0 ? 15 : 5)
        ),
        analysisDate: new Date(),
        totalJobsAnalyzed: multiJobAnalysis.aggregateAnalysis.totalJobsAnalyzed
      };
    } catch (error) {
      console.error('Error in getSkillRecommendations:', error);
      throw error;
    }
  }
}

module.exports = SkillGapService;
