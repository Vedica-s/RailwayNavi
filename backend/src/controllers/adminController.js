const adminService = require('../services/adminService');

// Get system statistics and metrics
const getSystemStats = async (req, res) => {
  try {
    const stats = await adminService.getSystemStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error in getSystemStats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Manage stations (CRUD operations)
const createStation = async (req, res) => {
  try {
    const stationData = req.body;
    
    if (!stationData.name || !stationData.latitude || !stationData.longitude) {
      return res.status(400).json({ 
        error: 'Name, latitude, and longitude are required' 
      });
    }

    const newStation = await adminService.createStation(stationData);
    res.status(201).json({ 
      message: 'Station created successfully', 
      station: newStation 
    });
  } catch (error) {
    console.error('Error in createStation:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const updates = req.body;
    
    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    const updatedStation = await adminService.updateStation(
      parseInt(stationId),
      updates
    );

    res.json({ 
      message: 'Station updated successfully', 
      station: updatedStation 
    });
  } catch (error) {
    console.error('Error in updateStation:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    
    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    await adminService.deleteStation(parseInt(stationId));
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error in deleteStation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Manage facilities
const createFacility = async (req, res) => {
  try {
    const facilityData = req.body;
    
    if (!facilityData.stationId || !facilityData.type) {
      return res.status(400).json({ 
        error: 'Station ID and facility type are required' 
      });
    }

    const newFacility = await adminService.createFacility(facilityData);
    res.status(201).json({ 
      message: 'Facility created successfully', 
      facility: newFacility 
    });
  } catch (error) {
    console.error('Error in createFacility:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const updates = req.body;
    
    if (!facilityId) {
      return res.status(400).json({ error: 'Facility ID is required' });
    }

    const updatedFacility = await adminService.updateFacility(
      parseInt(facilityId),
      updates
    );

    res.json({ 
      message: 'Facility updated successfully', 
      facility: updatedFacility 
    });
  } catch (error) {
    console.error('Error in updateFacility:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    if (!facilityId) {
      return res.status(400).json({ error: 'Facility ID is required' });
    }

    await adminService.deleteFacility(parseInt(facilityId));
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFacility:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, action, limit } = req.query;
    
    const logs = await adminService.getActivityLogs({
      startDate,
      endDate,
      action,
      limit: parseInt(limit) || 100
    });

    res.json({ logs });
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Manage user accounts
const getAllUsers = async (req, res) => {
  try {
    const { limit, offset, role } = req.query;
    
    const users = await adminService.getAllUsers({
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      role
    });

    res.json({ users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ 
        error: 'User ID and role are required' 
      });
    }

    const updatedUser = await adminService.updateUserRole(
      parseInt(userId),
      role
    );

    res.json({ 
      message: 'User role updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ error: error.message });
  }
};

// Bulk data operations
const bulkImportStations = async (req, res) => {
  try {
    const { stations } = req.body;
    
    if (!stations || !Array.isArray(stations)) {
      return res.status(400).json({ 
        error: 'Stations array is required' 
      });
    }

    const result = await adminService.bulkImportStations(stations);
    res.json({
      message: 'Bulk import completed',
      imported: result.imported,
      failed: result.failed,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error in bulkImportStations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Database maintenance
const runDatabaseMaintenance = async (req, res) => {
  try {
    const { operation } = req.body;
    
    if (!operation) {
      return res.status(400).json({ 
        error: 'Operation type is required' 
      });
    }

    const result = await adminService.performDatabaseMaintenance(operation);
    res.json({ 
      message: 'Maintenance operation completed', 
      result 
    });
  } catch (error) {
    console.error('Error in runDatabaseMaintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSystemStats,
  createStation,
  updateStation,
  deleteStation,
  createFacility,
  updateFacility,
  deleteFacility,
  getActivityLogs,
  getAllUsers,
  updateUserRole,
  bulkImportStations,
  runDatabaseMaintenance
};
