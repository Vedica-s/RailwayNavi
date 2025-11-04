const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');

/**
 * @route   GET /api/navigation/shortest-path
 * @desc    Find shortest path between two stations
 * @access  Public
 * @query   startStationId, endStationId, algorithm (optional: 'dijkstra', 'astar')
 */
router.get('/shortest-path', navigationController.getShortestPath);

/**
 * @route   GET /api/navigation/alternative-routes
 * @desc    Get alternative routes between stations
 * @access  Public
 * @query   startStationId, endStationId, maxRoutes (optional, default: 3)
 */
router.get('/alternative-routes', navigationController.getAlternativeRoutes);

/**
 * @route   GET /api/navigation/nearby-stations
 * @desc    Find nearby stations within radius
 * @access  Public
 * @query   latitude, longitude, radius (optional, default: 5.0 km)
 */
router.get('/nearby-stations', navigationController.getNearbyStations);

/**
 * @route   GET /api/navigation/travel-time
 * @desc    Calculate travel time between stations
 * @access  Public
 * @query   startStationId, endStationId, departureTime (optional)
 */
router.get('/travel-time', navigationController.getTravelTime);

/**
 * @route   GET /api/navigation/route/:routeId/stations
 * @desc    Get all stations along a specific route
 * @access  Public
 * @params  routeId
 */
router.get('/route/:routeId/stations', navigationController.getStationsOnRoute);

/**
 * @route   GET /api/navigation/accessible-routes
 * @desc    Find accessible routes for passengers with disabilities
 * @access  Public
 * @query   startStationId, endStationId, accessibilityType (optional: 'wheelchair', 'elevator', 'ramp')
 */
router.get('/accessible-routes', navigationController.getAccessibleRoutes);

module.exports = router;
