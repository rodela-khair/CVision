const Job = require('../models/Job');

// existing getJobs…
exports.getJobs = async (req, res) => {
  const jobs = await Job.find();
  res.json({ jobs });
};

// 新增: Create a job
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, requiredSkills, description } = req.body;
    const job = new Job({ title, company, location, requiredSkills, description });
    await job.save();
    res.json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// 新增: Update a job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// 新增: Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
