const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Track page visits
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    db.trackVisit('landing_page').catch(err => console.error('Error tracking visit:', err));
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/apply', (req, res) => {
  db.trackVisit('application_page').catch(err => console.error('Error tracking visit:', err));
  res.sendFile(path.join(__dirname, 'public', 'apply.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.post('/api/submit-application', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      childrenCount,
      childrenAges,
      heartShift,
      joinReason,
      futureChange,
      readyToInvest,
      availability,
      commitmentAgreement,
      extraNotes
    } = req.body;

    await db.saveApplication({
      fullName,
      email,
      phone,
      childrenCount,
      childrenAges,
      heartShift,
      joinReason,
      futureChange,
      readyToInvest,
      availability,
      commitmentAgreement,
      extraNotes
    });

    await db.trackConversion();

    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Error submitting application. Please try again.' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const applications = await db.getAllApplications();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Error fetching applications' });
  }
});

app.get('/api/applications/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid application id' });
  }
  try {
    const application = await db.getApplicationById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Error fetching application' });
  }
});

// Initialize database and start server
db.initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
