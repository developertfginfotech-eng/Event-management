const Attendance = require('../../models/Attendance');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// @desc    Export attendance to Excel
// @route   GET /api/admin/attendance/export/excel
// @access  Private (canViewReports)
exports.exportAttendanceToExcel = async (req, res, next) => {
  try {
    const { event, user, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('event', 'name')
      .populate('user', 'name email')
      .lean()
      .sort('-date');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Define columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User', key: 'user', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Event', key: 'event', width: 25 },
      { header: 'Check-In Time', key: 'checkInTime', width: 20 },
      { header: 'Check-Out Time', key: 'checkOutTime', width: 20 },
      { header: 'Work Hours', key: 'workHours', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Location', key: 'location', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };

    // Add data rows
    attendance.forEach((record) => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        user: record.user?.name || '-',
        email: record.user?.email || '-',
        event: record.event?.name || '-',
        checkInTime: record.checkIn?.time
          ? new Date(record.checkIn.time).toLocaleTimeString()
          : '-',
        checkOutTime: record.checkOut?.time
          ? new Date(record.checkOut.time).toLocaleTimeString()
          : '-',
        workHours: record.workHours || 0,
        status: record.status,
        location: record.checkIn?.location?.address || '-',
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// @desc    Export attendance to CSV
// @route   GET /api/admin/attendance/export/csv
// @access  Private (canViewReports)
exports.exportAttendanceToCSV = async (req, res, next) => {
  try {
    const { event, user, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('event', 'name')
      .populate('user', 'name email')
      .lean()
      .sort('-date');

    // Create CSV content
    const headers = [
      'Date',
      'User',
      'Email',
      'Event',
      'Check-In Time',
      'Check-Out Time',
      'Work Hours',
      'Status',
      'Location'
    ];

    const rows = attendance.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.user?.name || '-',
      record.user?.email || '-',
      record.event?.name || '-',
      record.checkIn?.time
        ? new Date(record.checkIn.time).toLocaleTimeString()
        : '-',
      record.checkOut?.time
        ? new Date(record.checkOut.time).toLocaleTimeString()
        : '-',
      record.workHours || 0,
      record.status,
      record.checkIn?.location?.address
        ? `"${record.checkIn.location.address.replace(/"/g, '""')}"`
        : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${Date.now()}.csv`
    );

    res.send(csvContent);
  } catch (err) {
    next(err);
  }
};

// @desc    Export attendance to PDF
// @route   GET /api/admin/attendance/export/pdf
// @access  Private (canViewReports)
exports.exportAttendanceToPDF = async (req, res, next) => {
  try {
    const { event, user, status, startDate, endDate } = req.query;
    let query = {};

    if (event) query.event = event;
    if (user) query.user = user;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('event', 'name')
      .populate('user', 'name email')
      .lean()
      .sort('-date');

    // Calculate statistics
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const totalWorkHours = attendance.reduce((sum, a) => sum + (a.workHours || 0), 0);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
    doc.moveDown();

    // Add metadata and summary
    doc.fontSize(10).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' })
      .text(`Total Records: ${totalRecords}`, { align: 'right' });

    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text('Summary:');
    doc.fontSize(10).font('Helvetica')
      .text(`Present: ${presentCount}`)
      .text(`Absent: ${absentCount}`)
      .text(`Total Work Hours: ${totalWorkHours.toFixed(2)} hrs`);
    doc.moveDown(2);

    // Add attendance records
    attendance.forEach((record, index) => {
      // Check if we need a new page
      if (doc.y > 680) {
        doc.addPage();
      }

      // Record header
      doc.fontSize(11).font('Helvetica-Bold')
        .fillColor('#4F46E5')
        .text(`${index + 1}. ${record.user?.name || 'Unknown User'}`);

      doc.fontSize(9).font('Helvetica').fillColor('#000000');

      // Record details in two columns
      const leftColumn = 50;
      const rightColumn = 300;
      let currentY = doc.y;

      // Left column
      doc.y = currentY;
      doc.x = leftColumn;
      doc.text(`Date: ${new Date(record.date).toLocaleDateString()}`, leftColumn);
      doc.text(`Event: ${record.event?.name || '-'}`, leftColumn);
      doc.text(`Email: ${record.user?.email || '-'}`, leftColumn);
      doc.text(`Status: ${record.status}`, leftColumn);

      // Right column
      doc.y = currentY;
      if (record.checkIn?.time) {
        doc.text(`Check-In: ${new Date(record.checkIn.time).toLocaleTimeString()}`, rightColumn);
      }
      if (record.checkOut?.time) {
        doc.text(`Check-Out: ${new Date(record.checkOut.time).toLocaleTimeString()}`, rightColumn);
      }
      doc.text(`Work Hours: ${record.workHours || 0} hrs`, rightColumn);
      if (record.checkIn?.location?.address) {
        doc.text(`Location: ${record.checkIn.location.address.substring(0, 30)}`, rightColumn);
      }

      // Add separator line
      doc.moveDown(0.3);
      doc.strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.8);
    });

    // Add footer on last page
    doc.fontSize(8).fillColor('#6B7280')
      .text(
        'Generated by Event Management System',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    // Finalize PDF
    doc.end();
  } catch (err) {
    next(err);
  }
};
