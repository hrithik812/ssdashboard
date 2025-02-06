const express = require('express');
const jwt = require('jsonwebtoken');
const {DashboardInfo,UserDashboard}=require('../models')
const router = express.Router();
const { Op } = require("sequelize");

router.post('/dashboardLink', async (req, res) => {
    const { name, link } = req.body;
    
    try {

    const dashboardResponse = await DashboardInfo.create({name,link})

    // Example usage

    res.status(201).json({ message: 'Dashboard Link created successfully',dashboardResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/dashboardLink/:id',async (req, res) => {
    try {
      const { id } = req.params; // Get ID from the request URL
      const { name, link } = req.body; // Data to update
  
      // Find the record and update it
      const dashboardResponse = await DashboardInfo.update(
        { name, link }, // Fields to update
        { where: { id } } // Condition to find the specific record
      );
  
      if (dashboardResponse[0] === 0) {
        // No rows were updated
        return res.status(404).json({ message: "Dashboard Info not found!" });
      }
  
      res.status(200).json({ message: "Dashboard Info updated successfully!" });
    } catch (error) {
      console.error("Error updating dashboard info:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
});
router.get("/dashboardLink", async (req, res) => {
    try {
      // Fetch all records
      const dashboardData = await DashboardInfo.findAll({
        where: {
          name: { // Replace 'name' with the actual column name
            [Op.notIn]: ["DashBoard Info", "DashBoard Assign"]
          }
        },
        order: [["priority", "ASC"]] // Order by priority in ascending order
      });


      // Return the fetched data
      res.status(200).json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard info:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
});
router.get('/userdashboard/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    // Fetch data from the UserDashboard table along with the related DashboardInfo
    const userDashboardData = await UserDashboard.findAll({
      where: {
        userId: userid, // Use the correct column name for your UserDashboard schema
      },
      include: [
        {
          model: DashboardInfo,
          attributes: ['name','link','priority'], // Only fetch the 'name' field from DashboardInfo
        },
      ],
      order: [[DashboardInfo, "priority", "ASC"]], // Correct order reference

    });
    
    if (!userDashboardData || userDashboardData.length === 0) {
      return res.status(404).json({ message: 'User dashboard data not found' });
    }

    // Map the data to include the 'name' directly
    const result = userDashboardData.map((item) => ({
      id: item.id,
      userId: item.userId,
      dashboardId: item.dashboardId,
      dashboardName: item.DashboardInfo.name, 
      dashboardLink:item.DashboardInfo.link,
      priority:item.priority
      // Directly access 'name' from the associated DashboardInfo
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/updatePermissions/:userId', async (req, res) => {
  const { userId } = req.params;
  const { add, remove } = req.body;

  console.log("Adding Dashboard IDs:", add, "Removing Dashboard IDs:", remove);

  try {
    // ✅ Add new permissions (ensure dashboardId is included)
    if (add && add.length > 0) {
      const newPermissions = add.map((dashboardId) => ({
        userId: userId, 
        dashboardId: dashboardId, // Ensure this field is not undefined
      }));

      await UserDashboard.bulkCreate(newPermissions, {
        ignoreDuplicates: true, // Prevent duplicate entries
      });
    }

    // ✅ Loop through each dashboardId to remove one by one
    if (remove && remove.length > 0) {
      for (const dashboardId of remove) {
        await UserDashboard.destroy({
          where: {
            userId: userId,
            dashboardId: dashboardId, 
          },
        });
      }
    }

    return res.status(200).json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;