const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/shepherds_circle',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        page VARCHAR(100) NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        children_count INTEGER,
        children_ages TEXT,
        heart_shift TEXT,
        join_reason TEXT,
        future_change TEXT,
        ready_to_invest VARCHAR(50),
        availability TEXT,
        commitment_agreement TEXT,
        extra_notes TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backfill new columns for existing tables if missing
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS children_count INTEGER`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS heart_shift TEXT`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS join_reason TEXT`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS future_change TEXT`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS ready_to_invest VARCHAR(50)`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS availability TEXT`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS commitment_agreement TEXT`);
    await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS extra_notes TEXT`);

    // Create conversions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversions (
        id SERIAL PRIMARY KEY,
        converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Track page visit
async function trackVisit(page) {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO visits (page) VALUES ($1)', [page]);
  } finally {
    client.release();
  }
}

// Save application
async function saveApplication(data) {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO applications 
      (full_name, email, phone, children_count, children_ages, heart_shift, join_reason, future_change, ready_to_invest, availability, commitment_agreement, extra_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      data.fullName,
      data.email,
      data.phone,
      data.childrenCount ? parseInt(data.childrenCount, 10) : null,
      data.childrenAges,
      data.heartShift,
      data.joinReason,
      data.futureChange,
      data.readyToInvest,
      data.availability,
      data.commitmentAgreement,
      data.extraNotes
    ]);
  } finally {
    client.release();
  }
}

// Track conversion
async function trackConversion() {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO conversions DEFAULT VALUES');
  } finally {
    client.release();
  }
}

// Get statistics
async function getStats() {
  const client = await pool.connect();
  try {
    // Get total visits to landing page
    const landingVisits = await client.query(
      "SELECT COUNT(*) as count FROM visits WHERE page = 'landing_page'"
    );

    // Get total visits to application page
    const applicationPageVisits = await client.query(
      "SELECT COUNT(*) as count FROM visits WHERE page = 'application_page'"
    );

    // Get total conversions
    const conversions = await client.query('SELECT COUNT(*) as count FROM conversions');

    // Get total applications
    const applications = await client.query('SELECT COUNT(*) as count FROM applications');

    const totalLandingVisits = parseInt(landingVisits.rows[0].count);
    const totalApplicationPageVisits = parseInt(applicationPageVisits.rows[0].count);
    const totalConversions = parseInt(conversions.rows[0].count);
    const totalApplications = parseInt(applications.rows[0].count);

    // Calculate conversion rate (landing page to application page)
    const clickThroughRate = totalLandingVisits > 0 
      ? ((totalApplicationPageVisits / totalLandingVisits) * 100).toFixed(2)
      : 0;

    // Calculate conversion rate (application page to submission)
    const conversionRate = totalApplicationPageVisits > 0
      ? ((totalConversions / totalApplicationPageVisits) * 100).toFixed(2)
      : 0;

    // Calculate overall conversion rate (landing page to submission)
    const overallConversionRate = totalLandingVisits > 0
      ? ((totalConversions / totalLandingVisits) * 100).toFixed(2)
      : 0;

    // Get recent visits by date
    const recentVisits = await client.query(`
      SELECT 
        DATE(visited_at) as date,
        page,
        COUNT(*) as count
      FROM visits
      WHERE visited_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(visited_at), page
      ORDER BY date DESC
    `);

    return {
      totalLandingVisits,
      totalApplicationPageVisits,
      totalConversions,
      totalApplications,
      clickThroughRate,
      conversionRate,
      overallConversionRate,
      recentVisits: recentVisits.rows
    };
  } finally {
    client.release();
  }
}

// Get all applications
async function getAllApplications() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM applications
      ORDER BY submitted_at DESC
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get single application by id
async function getApplicationById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM applications WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

module.exports = {
  initializeDatabase,
  trackVisit,
  saveApplication,
  trackConversion,
  getStats,
  getAllApplications,
  getApplicationById
};
