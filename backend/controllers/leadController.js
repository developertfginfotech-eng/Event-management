const Lead = require('../models/Lead');
const csvtojson = require('csvtojson');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res, next) => {
  try {
    const { event, status, priority, assignedTo, search } = req.query;
    let query = {};

    if (event) query.event = event;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // If user doesn't have permission to view all leads, show only assigned leads
    if (!req.user.permissions.canViewAllLeads) {
      query.assignedTo = req.user._id;
    }

    const leads = await Lead.find(query)
      .populate('event', 'name startDate endDate')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('event', 'name startDate endDate location')
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check if user has permission to view this lead
    if (
      !req.user.permissions.canViewAllLeads &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this lead',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check if user has permission to update this lead
    if (
      !req.user.permissions.canViewAllLeads &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead',
      });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
exports.addNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.notes.push({
      text: req.body.text,
      createdBy: req.user.id,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add follow-up to lead
// @route   POST /api/leads/:id/followups
// @access  Private
exports.addFollowUp = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.followUps.push({
      date: req.body.date,
      description: req.body.description,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk import leads from CSV
// @route   POST /api/leads/bulk-import
// @access  Private
exports.bulkImport = async (req, res, next) => {
  try {
    const { leads, eventId } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of leads',
      });
    }

    const leadsToCreate = leads.map((lead) => ({
      ...lead,
      event: eventId,
      createdBy: req.user.id,
      source: 'CSV Upload',
    }));

    const createdLeads = await Lead.insertMany(leadsToCreate);

    res.status(201).json({
      success: true,
      count: createdLeads.length,
      data: createdLeads,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign lead to user
// @route   POST /api/leads/:id/assign
// @access  Private (Manager/Admin)
exports.assignLead = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};
