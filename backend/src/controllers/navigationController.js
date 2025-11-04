const navigationService = require('../services/navigationService');

// Find shortest path between two stations
const getShortestPath = async (req, res) => {
  try {
    const { startStationId, endStationId, algorithm } = req.query;
    
    if (!startStationId || !endStationId) {
      return res.status(400).json({ 
        error: 'Start and end station IDs are required' 
      });
    }

    const result = await navigationService.findShortestPath(
      parseInt(startStationId),
      parseInt(endStationId),
      algorithm || 'dijkstra'
    );

    res.json(result);
  } catch (error) {
    console.error('Error in getShortestPath:', error);
    res.status(500).json({ error: error.message });
  }
};

// Find alternative routes
const getAlternativeRoutes = async (req, res) => {
  try {
    const { startStationId, endStationId, maxRoutes } = req.query;
    
    if (!startStationId || !endStationId) {
      return res.status(400).json({ 
        error: 'Start and end station IDs are required' 
      });
    }

    const routes = await navigationService.findAlternativeRoutes(
      parseInt(startStationId),
      parseInt(endStationId),
      parseInt(maxRoutes) || 3
    );

    res.json({ routes });
  } catch (error) {
    console.error('Error in getAlternativeRoutes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get nearby stations within radius
const getNearbyStations = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const stations = await navigationService.findNearbyStations(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius) || 5.0
    );

    res.json({ stations });
  } catch (error) {
    console.error('Error in getNearbyStations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Calculate travel time between stations
const getTravelTime = async (req, res) => {
  try {
    const { startStationId, endStationId, departureTime } = req.query;
    
    if (!startStationId || !endStationId) {
      return res.status(400).json({ 
        error: 'Start and end station IDs are required' 
      });
    }

    const travelInfo = await navigationService.calculateTravelTime(
      parseInt(startStationId),
      parseInt(endStationId),
      departureTime
    );

    res.json(travelInfo);
  } catch (error) {
    console.error('Error in getTravelTime:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get stations along a route
const getStationsOnRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    
    if (!routeId) {
      return res.status(400).json({ error: 'Route ID is required' });
    }

    const stations = await navigationService.getStationsAlongRoute(
      parseInt(routeId)
    );

    res.json({ stations });
  } catch (error) {
    console.error('Error in getStationsOnRoute:', error);
    res.status(500).json({ error: error.message });
  }
};

// Find accessible routes for disabled passengers
const getAccessibleRoutes = async (req, res) => {
  try {
    const { startStationId, endStationId, accessibilityType } = req.query;
    
    if (!startStationId || !endStationId) {
      return res.status(400).json({ 
        error: 'Start and end station IDs are required' 
      });
    }

    const routes = await navigationService.findAccessibleRoutes(
      parseInt(startStationId),
      parseInt(endStationId),
      accessibilityType || 'wheelchair'
    );

    res.json({ routes });
  } catch (error) {
    console.error('Error in getAccessibleRoutes:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getShortestPath,
  getAlternativeRoutes,
  getNearbyStations,
  getTravelTime,
  getStationsOnRoute,
  getAccessibleRoutes
};
