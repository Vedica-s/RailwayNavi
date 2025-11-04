const searchService = require('../services/searchService');

// Search stations by name or code
const searchStations = async (req, res) => {
  try {
    const { query, limit, offset } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchService.searchStations(
      query,
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );

    res.json({
      results: results.stations,
      total: results.total,
      query: query
    });
  } catch (error) {
    console.error('Error in searchStations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search trains by number or name
const searchTrains = async (req, res) => {
  try {
    const { query, limit, offset } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchService.searchTrains(
      query,
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );

    res.json({
      results: results.trains,
      total: results.total,
      query: query
    });
  } catch (error) {
    console.error('Error in searchTrains:', error);
    res.status(500).json({ error: error.message });
  }
};

// Advanced search with filters
const advancedSearch = async (req, res) => {
  try {
    const { query, filters, sortBy, limit, offset } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchService.advancedSearch(
      query,
      filters || {},
      sortBy || 'relevance',
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );

    res.json({
      results: results.items,
      total: results.total,
      query: query,
      filters: filters
    });
  } catch (error) {
    console.error('Error in advancedSearch:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search by location/coordinates
const searchByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius, type } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const results = await searchService.searchByLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius) || 5.0,
      type || 'station'
    );

    res.json({ results });
  } catch (error) {
    console.error('Error in searchByLocation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get autocomplete suggestions
const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { query, type, limit } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await searchService.getAutocompleteSuggestions(
      query,
      type || 'all',
      parseInt(limit) || 10
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Error in getAutocompleteSuggestions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search facilities at stations
const searchFacilities = async (req, res) => {
  try {
    const { facilityType, stationId, hasWheelchairAccess } = req.query;
    
    const results = await searchService.searchFacilities({
      facilityType: facilityType,
      stationId: stationId ? parseInt(stationId) : null,
      hasWheelchairAccess: hasWheelchairAccess === 'true'
    });

    res.json({ facilities: results });
  } catch (error) {
    console.error('Error in searchFacilities:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search routes between cities
const searchRoutes = async (req, res) => {
  try {
    const { from, to, date, trainType } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'From and to locations are required' 
      });
    }

    const routes = await searchService.searchRoutesBetweenCities(
      from,
      to,
      date,
      trainType
    );

    res.json({ routes });
  } catch (error) {
    console.error('Error in searchRoutes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get popular/trending searches
const getTrendingSearches = async (req, res) => {
  try {
    const { limit, timeRange } = req.query;
    
    const trending = await searchService.getTrendingSearches(
      parseInt(limit) || 10,
      timeRange || '24h'
    );

    res.json({ trending });
  } catch (error) {
    console.error('Error in getTrendingSearches:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  searchStations,
  searchTrains,
  advancedSearch,
  searchByLocation,
  getAutocompleteSuggestions,
  searchFacilities,
  searchRoutes,
  getTrendingSearches
};
