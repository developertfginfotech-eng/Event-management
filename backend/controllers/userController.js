const User = require('../models/User');

// @desc    Add new user (Admin only - No public registration)
// @route   POST /api/users
// @access  Private (Admin/Super Admin)
exports.addUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, designation, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const userData = {
      name,
      email,
      phone,
      password,
      role,
      designation,
      department,
    };

    if (role === 'Super Admin' || role === 'Admin') {
      userData.permissions = {
        canManageEvents: true,
        canManageUsers: true,
        canViewAllLeads: true,
        canApproveExpenses: true,
        canViewReports: true,
      };
    }

    const user = await User.create(userData);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Super Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('assignedEvents', 'name startDate endDate')
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Super Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedEvents', 'name startDate endDate status')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin/Super Admin)
exports.updateUser = async (req, res, next) => {
  try {
    // Find user first
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    const { name, email, phone, password, role, designation, department, isActive } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password; // Will be hashed by pre-save middleware
    if (role) {
      user.role = role;
      if (role === 'Super Admin' || role === 'Admin') {
        user.permissions = {
          canManageEvents: true,
          canManageUsers: true,
          canViewAllLeads: true,
          canApproveExpenses: true,
          canViewReports: true,
        };
      }
    }
    if (designation !== undefined) user.designation = designation;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    // Save user (triggers pre-save middleware to hash password)
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk import users
// @route   POST /api/users/bulk-import
// @access  Private (Admin/Super Admin)
exports.bulkImport = async (req, res, next) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of users',
      });
    }

    const createdUsers = await User.insertMany(users);

    res.status(201).json({
      success: true,
      count: createdUsers.length,
      data: createdUsers,
    });
  } catch (err) {
    next(err);
  }
};
