
const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Sanitize user object
    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
     
    };
    res.status(200).json({ 
        success: true, 
        message: "User retrieved successfully",
        data: sanitizedUser
     });
  } catch (err) {
     res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


// Edit/update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name } = req.body;

    // Update name
    if (name) user.name = name;

    // Save changes
    const updatedUser = await user.save();

    const sanitizedUser = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.status(200).json(
        { 
        success: true, 
        message: "User edited successfully",
        data: sanitizedUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
};