async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderStats(stats) {
  const {
    totalLandingVisits,
    totalApplicationPageVisits,
    totalConversions,
    totalApplications,
    clickThroughRate,
    conversionRate,
    overallConversionRate,
    recentVisits
  } = stats;

  document.getElementById('landing-visits').textContent = totalLandingVisits ?? '0';
  document.getElementById('apply-visits').textContent = totalApplicationPageVisits ?? '0';
  document.getElementById('conversions').textContent = totalConversions ?? '0';
  document.getElementById('applications').textContent = totalApplications ?? '0';
  document.getElementById('click-through-rate').textContent = `${clickThroughRate ?? 0}%`;
  document.getElementById('apply-conversion-rate').textContent = `${conversionRate ?? 0}%`;
  document.getElementById('overall-conversion-rate').textContent = `${overallConversionRate ?? 0}%`;

  const visitsTableBody = document.querySelector('#visits-table tbody');
  visitsTableBody.innerHTML = '';

  if (!recentVisits || recentVisits.length === 0) {
    document.getElementById('visits-empty').style.display = 'block';
  } else {
    document.getElementById('visits-empty').style.display = 'none';
    recentVisits.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(row.date)}</td>
        <td class="badge">${row.page.replace('_', ' ')}</td>
        <td>${row.count}</td>
      `;
      visitsTableBody.appendChild(tr);
    });
  }
}

function renderApplications(applications) {
  const tbody = document.querySelector('#applications-table tbody');
  tbody.innerHTML = '';

  if (!applications || applications.length === 0) {
    document.getElementById('applications-empty').style.display = 'block';
    return;
  }

  document.getElementById('applications-empty').style.display = 'none';

  applications.forEach((app) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(app.submitted_at)}</td>
      <td>${app.full_name}</td>
      <td>${app.email}</td>
      <td>${(app.children_count ? `${app.children_count} — ` : '') + (app.children_ages || '—')}</td>
      <td>${app.ready_to_invest || '—'}</td>
      <td>${app.availability || '—'}</td>
      <td><a href="/application-view.html?id=${app.id}" class="badge" style="text-decoration:none;">View</a></td>
    `;
    tbody.appendChild(tr);
  });
}

async function init() {
  try {
    const [stats, applications] = await Promise.all([
      fetchJSON('/api/stats'),
      fetchJSON('/api/applications')
    ]);
    renderStats(stats);
    renderApplications(applications);
  } catch (err) {
    console.error('Error loading stats:', err);
    const summary = document.getElementById('summary-grid');
    summary.insertAdjacentHTML('afterend', `
      <div class="notice" style="margin-top: 1rem; border-left-color: #d9534f; color: #d9534f;">
        Unable to load stats right now. Ensure the server and database are running.
      </div>
    `);
  }
}

document.addEventListener('DOMContentLoaded', init);
