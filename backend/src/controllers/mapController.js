const mapService = require('../services/mapService');

// Get all stations for map display
const getAllStations = async (req, res) => {
  try {
    const { bounds, zoomLevel } = req.query;
    
    let stations;
    if (bounds) {
      const boundingBox = JSON.parse(bounds);
      stations = await mapService.getStationsInBounds(
        boundingBox,
        parseInt(zoomLevel) || 10
      );
    } else {
      stations = await mapService.getAllStations();
    }

    res.json({ stations });
  } catch (error) {
    console.error('Error in getAllStations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get station details with location
const getStationDetails = async (req, res) => {
  try {
    const { stationId } = req.params;
    
    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    const station = await mapService.getStationWithDetails(
      parseInt(stationId)
    );

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Error in getStationDetails:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get railway lines for map overlay
const getRailwayLines = async (req, res) => {
  try {
    const { bounds, lineType } = req.query;
    
    let lines;
    if (bounds) {
      const boundingBox = JSON.parse(bounds);
      lines = await mapService.getLinesInBounds(boundingBox, lineType);
    } else {
      lines = await mapService.getAllLines(lineType);
    }

    res.json({ lines });
  } catch (error) {
    console.error('Error in getRailwayLines:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get heatmap data for busy stations
const getStationHeatmap = async (req, res) => {
  try {
    const { timeRange, metric } = req.query;
    
    const heatmapData = await mapService.generateStationHeatmap(
      timeRange || '24h',
      metric || 'passenger_count'
    );

    res.json({ heatmap: heatmapData });
  } catch (error) {
    console.error('Error in getStationHeatmap:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get route path geometry for visualization
const getRoutePath = async (req, res) => {
  try {
    const { startStationId, endStationId } = req.query;
    
    if (!startStationId || !endStationId) {
      return res.status(400).json({ 
        error: 'Start and end station IDs are required' 
      });
    }

    const pathGeometry = await mapService.getRouteGeometry(
      parseInt(startStationId),
      parseInt(endStationId)
    );

    res.json(pathGeometry);
  } catch (error) {
    console.error('Error in getRoutePath:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get real-time train positions
const getTrainPositions = async (req, res) => {
  try {
    const { lineId, bounds } = req.query;
    
    let trainPositions;
    if (lineId) {
      trainPositions = await mapService.getTrainsByLine(parseInt(lineId));
    } else if (bounds) {
      const boundingBox = JSON.parse(bounds);
      trainPositions = await mapService.getTrainsInBounds(boundingBox);
    } else {
      trainPositions = await mapService.getAllTrainPositions();
    }

    res.json({ trains: trainPositions });
  } catch (error) {
    console.error('Error in getTrainPositions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get station clusters for map markers
const getStationClusters = async (req, res) => {
  try {
    const { bounds, zoomLevel } = req.query;
    
    if (!bounds) {
      return res.status(400).json({ error: 'Bounds are required' });
    }

    const boundingBox = JSON.parse(bounds);
    const clusters = await mapService.clusterStations(
      boundingBox,
      parseInt(zoomLevel) || 10
    );

    res.json({ clusters });
  } catch (error) {
    console.error('Error in getStationClusters:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStations,
  getStationDetails,
  getRailwayLines,
  getStationHeatmap,
  getRoutePath,
  getTrainPositions,
  getStationClusters
};
