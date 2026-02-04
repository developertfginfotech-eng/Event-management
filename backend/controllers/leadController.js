const Lead = require('../models/Lead');
const User = require('../models/User');
const Event = require('../models/Event');
const csvtojson = require('csvtojson');
const { createWorker } = require('tesseract.js');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res, next) => {
  try {
    const { source, status, priority, assignedTo, search } = req.query;
    let query = {};

    if (source) query.source = source;
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

    if (!req.user.permissions.canViewAllLeads) {
      query.assignedTo = req.user._id;
    }

    const leads = await Lead.find(query)
      .populate('source', 'name startDate endDate')
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
      .populate('source', 'name startDate endDate location')
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

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
    const { leads, sourceId } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of leads',
      });
    }

    if (!sourceId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sourceId (event ID)',
      });
    }

    const leadsToCreate = leads.map((lead) => ({
      ...lead,
      createdBy: req.user.id,
      source: sourceId,
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


// @desc    Attach file to lead
// @route   POST /api/leads/:id/attachments
// @access  Private
exports.attachFile = async (req, res, next) => {
  try {
    const { name, url } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.attachments.push({ name, url });
    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Scan business card using OCR
// @route   POST /api/leads/scan-business-card
// @access  Private
exports.scanBusinessCard = async (req, res, next) => {
  try {
    const { imageUrl, sourceId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL',
      });
    }

    if (!sourceId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sourceId (event ID)',
      });
    }

    const imagePath = imageUrl.startsWith('/') ? `.${imageUrl}` : imageUrl;

    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    const parsedData = parseBusinessCardText(text);


    try {
      const lead = await Lead.create({
        ...parsedData,
        createdBy: req.user.id,
        source: sourceId,
        businessCardImage: imageUrl,
      });

      res.status(201).json({
        success: true,
        data: {
          lead,
          rawText: text,
          parsedData,
        },
      });
    } catch (validationError) {
      res.status(400).json({
        success: false,
        message: 'OCR completed but some required fields are missing. Please review and complete manually.',
        data: {
          rawText: text,
          parsedData,
          businessCardImage: imageUrl,
          missingFields: validationError.errors
            ? Object.keys(validationError.errors)
            : [],
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// Helper function to parse business card text
function parseBusinessCardText(text) {
  const lines = text.split('\n').filter((line) => line.trim());

  const data = {
    name: '',
    company: '',
    phone: '',
    email: '',
    designation: '',
  };

  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
  const phoneRegex = /(\+?\d{1,4}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;

  const emailMatch = text.match(emailRegex);
  if (emailMatch) data.email = emailMatch[0];

  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    const validPhones = phoneMatches.filter(p => p.replace(/\D/g, '').length >= 8);
    if (validPhones.length > 0) {
      data.phone = validPhones.reduce((a, b) => a.length > b.length ? a : b).trim();
    }
  }

  if (lines.length > 0) data.name = lines[0];

  const designationKeywords = [
    'CEO',
    'CTO',
    'CFO',
    'Manager',
    'Director',
    'VP',
    'President',
    'Executive',
    'Head',
    'Lead',
    'Founder',
    'Owner',
  ];

  for (const line of lines) {
    if (
      designationKeywords.some((keyword) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      data.designation = line;
      break;
    }
  }

  const companyKeywords = ['Inc', 'Ltd', 'LLC', 'Corp', 'Limited', 'Pvt'];
  for (const line of lines) {
    if (
      companyKeywords.some((keyword) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      ) ||
      (!data.company && line !== data.name && line !== data.designation)
    ) {
      data.company = line;
      break;
    }
  }

  if (!data.company && lines.length > 1) {
    data.company = lines[1];
  }

  return data;
}

// @desc    Update follow-up status
// @route   PUT /api/leads/:id/followups/:followupId
// @access  Private
exports.updateFollowUp = async (req, res, next) => {
  try {
    const { completed, description, date } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    const followUp = lead.followUps.id(req.params.followupId);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found',
      });
    }

    if (completed !== undefined) followUp.completed = completed;
    if (description) followUp.description = description;
    if (date) followUp.date = date;

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Track communication (call, email, WhatsApp)
// @route   POST /api/leads/:id/communications
// @access  Private
exports.trackCommunication = async (req, res, next) => {
  try {
    const { type, notes } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.communications.push({
      type,
      notes,
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

// @desc    Get lead reminders (upcoming follow-ups)
// @route   GET /api/leads/reminders
// @access  Private
exports.getReminders = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const leads = await Lead.find({
      assignedTo: req.user._id,
      'followUps.completed': false,
      'followUps.date': {
        $gte: new Date(),
        $lte: endDate,
      },
    })
      .populate('source', 'name startDate')
      .sort('followUps.date');

    const reminders = [];
    leads.forEach((lead) => {
      lead.followUps.forEach((followUp) => {
        if (
          !followUp.completed &&
          followUp.date >= new Date() &&
          followUp.date <= endDate
        ) {
          reminders.push({
            leadId: lead._id,
            leadName: lead.name,
            company: lead.company,
            source: lead.source,
            followUp: {
              id: followUp._id,
              date: followUp.date,
              description: followUp.description,
            },
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get source-wise lead report
// @route   GET /api/leads/reports/source/:sourceId
// @access  Private
exports.getEventReport = async (req, res, next) => {
  try {
    const { sourceId } = req.params;

    const leads = await Lead.find({ source: sourceId }).populate(
      'assignedTo',
      'name'
    );

    const stats = {
      total: leads.length,
      byStatus: {},
      byPriority: {},
      bySource: {},
      byUser: {},
      converted: 0,
      conversionRate: 0,
    };

    leads.forEach((lead) => {
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
      stats.byPriority[lead.priority] = (stats.byPriority[lead.priority] || 0) + 1;
      stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;

      if (lead.assignedTo) {
        const userName = lead.assignedTo.name;
        stats.byUser[userName] = (stats.byUser[userName] || 0) + 1;
      }

      if (lead.status === 'Converted') {
        stats.converted++;
      }
    });

    stats.conversionRate =
      stats.total > 0
        ? ((stats.converted / stats.total) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        sourceId,
        stats,
        leads,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export leads to Excel
// @route   GET /api/leads/export/excel
// @access  Private
exports.exportToExcel = async (req, res, next) => {
  try {
    const { source, status, assignedTo } = req.query;
    let query = {};

    if (source) query.source = source;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const leads = await Lead.find(query)
      .populate('source', 'name')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Source', key: 'source', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    leads.forEach((lead) => {
      worksheet.addRow({
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        email: lead.email,
        designation: lead.designation,
        source: lead.source?.name || '',
        status: lead.status,
        priority: lead.priority,
        assignedTo: lead.assignedTo?.name || 'Unassigned',
        createdBy: lead.createdBy?.name || '',
        createdAt: lead.createdAt.toLocaleDateString(),
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// @desc    Export leads to CSV
// @route   GET /api/leads/export/csv
// @access  Private
exports.exportToCSV = async (req, res, next) => {
  try {
    const { source, status, assignedTo } = req.query;
    let query = {};

    if (source) query.source = source;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const leads = await Lead.find(query)
      .populate('source', 'name')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .lean();

    const formattedLeads = leads.map((lead) => ({
      Name: lead.name,
      Company: lead.company,
      Phone: lead.phone,
      Email: lead.email,
      Designation: lead.designation,
      Source: lead.source?.name || '',
      Status: lead.status,
      Priority: lead.priority,
      'Assigned To': lead.assignedTo?.name || 'Unassigned',
      'Created By': lead.createdBy?.name || '',
      'Created At': new Date(lead.createdAt).toLocaleDateString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedLeads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads-${Date.now()}.csv`
    );

    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};
