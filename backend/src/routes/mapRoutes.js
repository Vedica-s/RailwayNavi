const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

/**
 * @route   GET /api/map/stations
 * @desc    Get all stations for map display
 * @access  Public
 * @query   bounds (optional), zoomLevel (optional)
 */
router.get('/stations', mapController.getAllStations);

/**
 * @route   GET /api/map/stations/:stationId
 * @desc    Get detailed station information with location data
 * @access  Public
 * @params  stationId
 */
router.get('/stations/:stationId', mapController.getStationDetails);

/**
 * @route   GET /api/map/railway-lines
 * @desc    Get railway lines for map overlay
 * @access  Public
 * @query   bounds (optional), lineType (optional)
 */
router.get('/railway-lines', mapController.getRailwayLines);

/**
 * @route   GET /api/map/heatmap
 * @desc    Get heatmap data for station congestion/activity
 * @access  Public
 * @query   timeRange (optional, default: '24h'), metric (optional, default: 'passenger_count')
 */
router.get('/heatmap', mapController.getStationHeatmap);

/**
 * @route   GET /api/map/route-path
 * @desc    Get route path geometry for visualization between two stations
 * @access  Public
 * @query   startStationId, endStationId
 */
router.get('/route-path', mapController.getRoutePath);

/**
 * @route   GET /api/map/trains/positions
 * @desc    Get real-time train positions
 * @access  Public
 * @query   lineId (optional), bounds (optional)
 */
router.get('/trains/positions', mapController.getTrainPositions);

/**
 * @route   GET /api/map/clusters
 * @desc    Get clustered station markers for map display
 * @access  Public
 * @query   bounds (required), zoomLevel (optional)
 */
router.get('/clusters', mapController.getStationClusters);

module.exports = router;
