const db = require('../../db');

class User {
  // Create a new user
  static async create(userData) {
    const { username, email, passwordHash, role, firstName, lastName } = userData;
    
    const query = `
      INSERT INTO users (username, email, password_hash, role, first_name, last_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, username, email, role, first_name, last_name, created_at
    `;
    
    const values = [username, email, passwordHash, role || 'user', firstName, lastName];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(userId) {
    const query = `
      SELECT id, username, email, role, first_name, last_name, 
             preferences, created_at, updated_at, last_login
      FROM users
      WHERE id = $1 AND is_active = true
    `;
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, role, first_name, last_name,
             is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by username
  static async findByUsername(username) {
    const query = `
      SELECT id, username, email, password_hash, role, first_name, last_name,
             is_active, created_at, updated_at
      FROM users
      WHERE username = $1
    `;
    
    try {
      const result = await db.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  // Update user profile
  static async update(userId, updates) {
    const allowedFields = ['username', 'email', 'first_name', 'last_name', 'preferences'];
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

    values.push(userId);
    const query = `
      UPDATE users
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, username, email, role, first_name, last_name, preferences, updated_at
    `;

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Update user password
  static async updatePassword(userId, newPasswordHash) {
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, username, email
    `;
    
    try {
      const result = await db.query(query, [newPasswordHash, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Update user role
  static async updateRole(userId, newRole) {
    const query = `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, username, email, role
    `;
    
    try {
      const result = await db.query(query, [newRole, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user role: ${error.message}`);
    }
  }

  // Update last login time
  static async updateLastLogin(userId) {
    const query = `
      UPDATE users
      SET last_login = NOW()
      WHERE id = $1
    `;
    
    try {
      await db.query(query, [userId]);
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  // Deactivate user (soft delete)
  static async deactivate(userId) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email
    `;
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deactivating user: ${error.message}`);
    }
  }

  // Get all users with pagination
  static async getAll(limit = 50, offset = 0, filters = {}) {
    let query = `
      SELECT id, username, email, role, first_name, last_name, 
             is_active, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.isActive);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting all users: ${error.message}`);
    }
  }

  // Get user statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
        COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '30 days') as recent_active_users
      FROM users
    `;
    
    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }
}

module.exports = User;
