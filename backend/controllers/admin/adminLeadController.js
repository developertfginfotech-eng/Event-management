const Lead = require('../../models/Lead');
const User = require('../../models/User');
const Event = require('../../models/Event');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

// @desc    Get all leads (Admin/Manager view - no filtering)
// @route   GET /api/admin/leads
// @access  Private (canViewAllLeads)
exports.getAllLeads = async (req, res, next) => {
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

    // Admin sees ALL leads (no user filtering)
    const leads = await Lead.find(query)
      .populate('source', 'name startDate endDate location')
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

// @desc    Get single lead by ID
// @route   GET /api/admin/leads/:id
// @access  Private (canViewAllLeads)
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('source', 'name startDate endDate location')
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name')
      .populate('communications.createdBy', 'name');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Admin can view any lead
    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign lead to user
// @route   POST /api/admin/leads/:id/assign
// @access  Private (canViewAllLeads)
exports.assignLead = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId',
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Lead assigned to ${user.name}`,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk import leads from CSV
// @route   POST /api/admin/leads/bulk-import
// @access  Private (canViewAllLeads)
exports.bulkImportLeads = async (req, res, next) => {
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

    // Verify event exists
    const event = await Event.findById(sourceId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const leadsToCreate = leads.map((lead) => ({
      ...lead,
      createdBy: req.user.id,
      source: sourceId,
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
    }));

    const createdLeads = await Lead.insertMany(leadsToCreate, {
      ordered: false, // Continue on error
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdLeads.length} leads`,
      count: createdLeads.length,
      data: createdLeads,
    });
  } catch (err) {
    // Handle duplicate key errors or validation errors
    if (err.writeErrors) {
      const successCount = err.insertedDocs ? err.insertedDocs.length : 0;
      return res.status(207).json({
        success: true,
        message: `Imported ${successCount} leads with ${err.writeErrors.length} errors`,
        count: successCount,
        errors: err.writeErrors.map((e) => e.errmsg),
      });
    }
    next(err);
  }
};

// @desc    Delete lead
// @route   DELETE /api/admin/leads/:id
// @access  Private (Admin/Super Admin)
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

// @desc    Get event-wise lead report
// @route   GET /api/admin/leads/reports/source/:sourceId
// @access  Private (canViewAllLeads)
exports.getEventReport = async (req, res, next) => {
  try {
    const { sourceId } = req.params;

    // Verify event exists
    const event = await Event.findById(sourceId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const leads = await Lead.find({ source: sourceId })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    const stats = {
      total: leads.length,
      byStatus: {},
      byPriority: {},
      byUser: {},
      converted: 0,
      conversionRate: 0,
    };

    leads.forEach((lead) => {
      // Status breakdown
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;

      // Priority breakdown
      stats.byPriority[lead.priority] = (stats.byPriority[lead.priority] || 0) + 1;

      // User breakdown
      if (lead.assignedTo) {
        const userName = lead.assignedTo.name;
        stats.byUser[userName] = (stats.byUser[userName] || 0) + 1;
      } else {
        stats.byUser['Unassigned'] = (stats.byUser['Unassigned'] || 0) + 1;
      }

      // Conversion tracking
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
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
        },
        stats,
        leads,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export leads to Excel
// @route   GET /api/admin/leads/export/excel
// @access  Private (canViewAllLeads)
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
      .populate('createdBy', 'name')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Source Event', key: 'source', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A90E2' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    leads.forEach((lead) => {
      worksheet.addRow({
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        email: lead.email,
        designation: lead.designation || '-',
        source: lead.source?.name || '-',
        status: lead.status,
        priority: lead.priority,
        assignedTo: lead.assignedTo?.name || 'Unassigned',
        createdBy: lead.createdBy?.name || '-',
        createdAt: new Date(lead.createdAt).toLocaleDateString(),
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads-export-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// @desc    Export leads to CSV
// @route   GET /api/admin/leads/export/csv
// @access  Private (canViewAllLeads)
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
      Designation: lead.designation || '-',
      'Source Event': lead.source?.name || '-',
      Status: lead.status,
      Priority: lead.priority,
      'Assigned To': lead.assignedTo?.name || 'Unassigned',
      'Created By': lead.createdBy?.name || '-',
      'Created At': new Date(lead.createdAt).toLocaleDateString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedLeads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads-export-${Date.now()}.csv`
    );

    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};
