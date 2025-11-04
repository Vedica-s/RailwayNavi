const db = require('../../db');

class Facility {
  // Create a new facility
  static async create(facilityData) {
    const { 
      stationId, type, name, description, location, 
      isAccessible, operatingHours, contactInfo 
    } = facilityData;
    
    const query = `
      INSERT INTO facilities (
        station_id, type, name, description, location,
        is_accessible, operating_hours, contact_info, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      stationId, type, name, description || null, location || null,
      isAccessible || false, operatingHours || '24/7', contactInfo || null
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating facility: ${error.message}`);
    }
  }

  // Find facility by ID
  static async findById(facilityId) {
    const query = `
      SELECT f.*, s.name as station_name, s.code as station_code
      FROM facilities f
      JOIN stations s ON f.station_id = s.id
      WHERE f.id = $1
    `;
    
    try {
      const result = await db.query(query, [facilityId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding facility by ID: ${error.message}`);
    }
  }

  // Get all facilities at a station
  static async getByStation(stationId, facilityType = null) {
    let query = `
      SELECT * FROM facilities
      WHERE station_id = $1
    `;
    const values = [stationId];
    
    if (facilityType) {
      query += ` AND type = $2`;
      values.push(facilityType);
    }
    
    query += ` ORDER BY type, name`;
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting facilities by station: ${error.message}`);
    }
  }

  // Search facilities by type
  static async getByType(facilityType, limit = 100, offset = 0) {
    const query = `
      SELECT f.*, s.name as station_name, s.code as station_code, s.city, s.state
      FROM facilities f
      JOIN stations s ON f.station_id = s.id
      WHERE f.type = $1
      ORDER BY s.name, f.name
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await db.query(query, [facilityType, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting facilities by type: ${error.message}`);
    }
  }

  // Search accessible facilities
  static async getAccessible(filters = {}) {
    let query = `
      SELECT f.*, s.name as station_name, s.code as station_code, s.city, s.state
      FROM facilities f
      JOIN stations s ON f.station_id = s.id
      WHERE f.is_accessible = true
    `;
    const values = [];
    let paramCount = 1;

    if (filters.type) {
      query += ` AND f.type = $${paramCount}`;
      values.push(filters.type);
      paramCount++;
    }

    if (filters.stationId) {
      query += ` AND f.station_id = $${paramCount}`;
      values.push(filters.stationId);
      paramCount++;
    }

    if (filters.city) {
      query += ` AND LOWER(s.city) = LOWER($${paramCount})`;
      values.push(filters.city);
      paramCount++;
    }

    query += ` ORDER BY s.name, f.name`;

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting accessible facilities: ${error.message}`);
    }
  }

  // Search facilities
  static async search(searchQuery, limit = 20, offset = 0) {
    const query = `
      SELECT f.*, s.name as station_name, s.code as station_code, s.city
      FROM facilities f
      JOIN stations s ON f.station_id = s.id
      WHERE LOWER(f.name) LIKE LOWER($1) OR LOWER(f.description) LIKE LOWER($1)
      ORDER BY 
        CASE 
          WHEN LOWER(f.name) LIKE LOWER($1 || '%') THEN 1
          ELSE 2
        END,
        s.name, f.name
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await db.query(query, [`%${searchQuery}%`, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching facilities: ${error.message}`);
    }
  }

  // Update facility
  static async update(facilityId, updates) {
    const allowedFields = [
      'type', 'name', 'description', 'location',
      'is_accessible', 'operating_hours', 'contact_info'
    ];
    
    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(facilityId);
    const query = `
      UPDATE facilities
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating facility: ${error.message}`);
    }
  }

  // Delete facility
  static async delete(facilityId) {
    const query = `DELETE FROM facilities WHERE id = $1 RETURNING id, name, type`;
    
    try {
      const result = await db.query(query, [facilityId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting facility: ${error.message}`);
    }
  }

  // Get facility types with counts
  static async getTypesCounts() {
    const query = `
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE is_accessible = true) as accessible_count
      FROM facilities
      GROUP BY type
      ORDER BY type
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting facility types counts: ${error.message}`);
    }
  }

  // Get facilities by multiple stations
  static async getByStations(stationIds) {
    const query = `
      SELECT f.*, s.name as station_name, s.code as station_code
      FROM facilities f
      JOIN stations s ON f.station_id = s.id
      WHERE f.station_id = ANY($1)
      ORDER BY f.station_id, f.type, f.name
    `;
    
    try {
      const result = await db.query(query, [stationIds]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting facilities by stations: ${error.message}`);
    }
  }

  // Get facility statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT station_id) as stations_with_facilities,
        COUNT(*) FILTER (WHERE is_accessible = true) as accessible_facilities,
        COUNT(DISTINCT type) as facility_types
      FROM facilities
    `;
    
    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting facility stats: ${error.message}`);
    }
  }

  // Get facilities grouped by station
  static async getGroupedByStation(filters = {}) {
    let query = `
      SELECT 
        s.id as station_id,
        s.name as station_name,
        s.code as station_code,
        s.city,
        json_agg(
          json_build_object(
            'id', f.id,
            'type', f.type,
            'name', f.name,
            'is_accessible', f.is_accessible,
            'operating_hours', f.operating_hours
          ) ORDER BY f.type, f.name
        ) as facilities
      FROM stations s
      LEFT JOIN facilities f ON s.id = f.station_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.city) {
      query += ` AND LOWER(s.city) = LOWER($${paramCount})`;
      values.push(filters.city);
      paramCount++;
    }

    if (filters.hasAccessibleFacilities) {
      query += ` AND EXISTS (
        SELECT 1 FROM facilities f2 
        WHERE f2.station_id = s.id AND f2.is_accessible = true
      )`;
    }

    query += `
      GROUP BY s.id, s.name, s.code, s.city
      HAVING COUNT(f.id) > 0
      ORDER BY s.name
    `;

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting facilities grouped by station: ${error.message}`);
    }
  }
}

module.exports = Facility;
