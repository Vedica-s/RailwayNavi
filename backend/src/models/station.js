const db = require('../../db');

class Station {
  // Create a new station
  static async create(stationData) {
    const { 
      name, code, latitude, longitude, address, city, state, country,
      stationType, platformCount, hasParking, hasWifi, hasFoodCourt,
      hasWheelchairAccess, operatingHours 
    } = stationData;
    
    const query = `
      INSERT INTO stations (
        name, code, latitude, longitude, address, city, state, country,
        station_type, platform_count, has_parking, has_wifi, has_food_court,
        has_wheelchair_access, operating_hours, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      name, code, latitude, longitude, address, city, state, country,
      stationType || 'regular', platformCount || 2, 
      hasParking || false, hasWifi || false, hasFoodCourt || false,
      hasWheelchairAccess || false, operatingHours || '24/7'
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating station: ${error.message}`);
    }
  }

  // Find station by ID
  static async findById(stationId) {
    const query = `
      SELECT s.*, 
        (SELECT json_agg(f.*) FROM facilities f WHERE f.station_id = s.id) as facilities,
        (SELECT COUNT(*) FROM connections WHERE from_station_id = s.id OR to_station_id = s.id) as connection_count
      FROM stations s
      WHERE s.id = $1
    `;
    
    try {
      const result = await db.query(query, [stationId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding station by ID: ${error.message}`);
    }
  }

  // Find station by code
  static async findByCode(code) {
    const query = `
      SELECT * FROM stations WHERE code = $1
    `;
    
    try {
      const result = await db.query(query, [code]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding station by code: ${error.message}`);
    }
  }

  // Search stations by name
  static async search(searchQuery, limit = 20, offset = 0) {
    const query = `
      SELECT id, name, code, city, state, latitude, longitude,
             station_type, has_wheelchair_access
      FROM stations
      WHERE LOWER(name) LIKE LOWER($1) OR LOWER(code) LIKE LOWER($1) OR LOWER(city) LIKE LOWER($1)
      ORDER BY 
        CASE 
          WHEN LOWER(name) = LOWER($1) THEN 1
          WHEN LOWER(code) = LOWER($1) THEN 2
          WHEN LOWER(name) LIKE LOWER($1 || '%') THEN 3
          ELSE 4
        END,
        name
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await db.query(query, [`%${searchQuery}%`, limit, offset]);
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM stations
        WHERE LOWER(name) LIKE LOWER($1) OR LOWER(code) LIKE LOWER($1) OR LOWER(city) LIKE LOWER($1)
      `;
      const countResult = await db.query(countQuery, [`%${searchQuery}%`]);
      
      return {
        stations: result.rows,
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      throw new Error(`Error searching stations: ${error.message}`);
    }
  }

  // Get all stations with optional filters
  static async getAll(filters = {}, limit = 100, offset = 0) {
    let query = `SELECT * FROM stations WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filters.city) {
      query += ` AND LOWER(city) = LOWER($${paramCount})`;
      values.push(filters.city);
      paramCount++;
    }

    if (filters.state) {
      query += ` AND LOWER(state) = LOWER($${paramCount})`;
      values.push(filters.state);
      paramCount++;
    }

    if (filters.stationType) {
      query += ` AND station_type = $${paramCount}`;
      values.push(filters.stationType);
      paramCount++;
    }

    if (filters.hasWheelchairAccess !== undefined) {
      query += ` AND has_wheelchair_access = $${paramCount}`;
      values.push(filters.hasWheelchairAccess);
      paramCount++;
    }

    query += ` ORDER BY name LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting all stations: ${error.message}`);
    }
  }

  // Get stations within bounds (for map view)
  static async getInBounds(bounds, zoomLevel = 10) {
    const { north, south, east, west } = bounds;
    
    // Adjust detail level based on zoom
    const selectFields = zoomLevel > 12 
      ? `id, name, code, latitude, longitude, station_type, has_wheelchair_access`
      : `id, name, latitude, longitude`;
    
    const query = `
      SELECT ${selectFields}
      FROM stations
      WHERE latitude BETWEEN $1 AND $2
        AND longitude BETWEEN $3 AND $4
      ORDER BY name
    `;
    
    try {
      const result = await db.query(query, [south, north, west, east]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting stations in bounds: ${error.message}`);
    }
  }

  // Get nearby stations using Haversine formula
  static async getNearby(latitude, longitude, radiusKm = 5.0) {
    const query = `
      SELECT id, name, code, latitude, longitude, city, station_type,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) AS distance
      FROM stations
      WHERE (
        6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )
      ) <= $3
      ORDER BY distance
      LIMIT 20
    `;
    
    try {
      const result = await db.query(query, [latitude, longitude, radiusKm]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting nearby stations: ${error.message}`);
    }
  }

  // Update station information
  static async update(stationId, updates) {
    const allowedFields = [
      'name', 'code', 'latitude', 'longitude', 'address', 'city', 'state', 'country',
      'station_type', 'platform_count', 'has_parking', 'has_wifi', 'has_food_court',
      'has_wheelchair_access', 'operating_hours'
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

    values.push(stationId);
    const query = `
      UPDATE stations
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating station: ${error.message}`);
    }
  }

  // Delete station
  static async delete(stationId) {
    const query = `DELETE FROM stations WHERE id = $1 RETURNING id, name`;
    
    try {
      const result = await db.query(query, [stationId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting station: ${error.message}`);
    }
  }

  // Get connected stations
  static async getConnections(stationId) {
    const query = `
      SELECT 
        s.*,
        c.distance,
        c.travel_time,
        c.line_name
      FROM connections c
      JOIN stations s ON (c.to_station_id = s.id AND c.from_station_id = $1)
         OR (c.from_station_id = s.id AND c.to_station_id = $1)
      WHERE c.from_station_id = $1 OR c.to_station_id = $1
      ORDER BY c.distance
    `;
    
    try {
      const result = await db.query(query, [stationId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting station connections: ${error.message}`);
    }
  }

  // Get station statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_stations,
        COUNT(*) FILTER (WHERE has_wheelchair_access = true) as accessible_stations,
        COUNT(*) FILTER (WHERE has_parking = true) as stations_with_parking,
        COUNT(*) FILTER (WHERE has_wifi = true) as stations_with_wifi,
        COUNT(DISTINCT city) as total_cities,
        COUNT(DISTINCT state) as total_states
      FROM stations
    `;
    
    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting station stats: ${error.message}`);
    }
  }

  // Bulk insert stations
  static async bulkCreate(stationsArray) {
    const client = await db.getClient();
    const results = { imported: 0, failed: 0, errors: [] };
    
    try {
      await client.query('BEGIN');
      
      for (const stationData of stationsArray) {
        try {
          const { 
            name, code, latitude, longitude, address, city, state, country,
            stationType, platformCount 
          } = stationData;
          
          const query = `
            INSERT INTO stations (
              name, code, latitude, longitude, address, city, state, country,
              station_type, platform_count, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          `;
          
          await client.query(query, [
            name, code, latitude, longitude, address, city, state, country,
            stationType || 'regular', platformCount || 2
          ]);
          
          results.imported++;
        } catch (error) {
          results.failed++;
          results.errors.push({ station: stationData.name, error: error.message });
        }
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Bulk insert failed: ${error.message}`);
    } finally {
      client.release();
    }
    
    return results;
  }
}

module.exports = Station;
