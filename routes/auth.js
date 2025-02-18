const express = require('express');
const jwt = require('jsonwebtoken');
const { User,Feature,Role } = require('../models');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Import bcrypt
const authenticate = require('../middleware/authenticate');

const SECRET_KEY = '123456';
const getUserFeatures = async (username) => {
  try {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          through: { attributes: [] }, // Exclude intermediate table attributes
          include: [
            {
              model: Feature,
              through: { attributes: [] }, // Exclude intermediate table attributes
            },
          ],
        },
      ],
    });

    if (!user) {
      return { message: 'User not found', features: [] };
    }

    

    // Extract features
    const features = user.Roles.flatMap((role) => role.Features);

    return { username, features };
  } catch (error) {
    console.error('Error fetching features:', error);
    throw new Error('Failed to fetch features');
  }
};
// User Registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    const user = await User.create({ username, password:hashedPassword });

    // Example usage

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/users', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.findAll();

    // Send the users as a JSON response
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }}
)
// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    const data = await getUserFeatures(user.username);
      
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: '1h',
    });
    res.json({ message: 'Login successful', token,feature:data,userId:user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Route
// router.get('/profile', verifyToken, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id);
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.post("/change-password", async (req, res) => {
  try {
      const { oldPassword, newPassword ,userId} = req.body;

      // Validate input
      if (!oldPassword || !newPassword) {
          return res.status(400).json({ message: "Both old and new passwords are required." });
      }

      // Get user from DB using the ID from JWT token
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }

      // Compare old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: "Old password is incorrect." });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in DB
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;