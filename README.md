# Shepherds Elite Circle

A beautiful landing page and application funnel for the Shepherds Elite Circle coaching program with PostgreSQL database integration.

## Features

- 🎨 Beautiful, responsive landing page with elegant design
- 📝 Application form with comprehensive questions
- 📊 Traffic tracking (landing page visits, application page visits)
- 🎯 Conversion tracking (application submissions)
- 📈 Real-time statistics dashboard
- 💾 PostgreSQL database for data persistence
- ✅ Success page with confirmation message

## Tech Stack

- **Backend:** Node.js with Express
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS, JavaScript
- **Hosting:** Railway

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL installed locally

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a local PostgreSQL database:
   ```bash
   createdb shepherds_circle
   ```

4. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Visit `http://localhost:3000` in your browser

## Database Schema

### Tables

- **visits**: Tracks page visits (landing_page, application_page)
- **applications**: Stores application form submissions
- **conversions**: Tracks successful form submissions

## Deploying to Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database to your project
3. Connect your GitHub repository
4. Railway will automatically:
   - Set the `DATABASE_URL` environment variable
   - Set the `PORT` environment variable
   - Deploy your application

No additional configuration needed!

## API Endpoints

- `GET /` - Landing page
- `GET /apply` - Application form
- `POST /api/submit-application` - Submit application
- `GET /api/stats` - Get statistics
- `GET /api/applications` - Get all applications
- `GET /success` - Success page
- `GET /stats` - Statistics dashboard

## Statistics Tracked

- Total landing page visits
- Total application page visits
- Total applications submitted
- Total conversions
- Click-through rate (Landing → Apply)
- Conversion rate (Apply → Submit)
- Overall conversion rate (Landing → Submit)

## License

© 2024. All rights reserved.
