function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function fetchApplication(id) {
  const res = await fetch(`/api/applications/${id}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    el.value = value || '';
  } else {
    el.textContent = value || '—';
  }
}

async function init() {
  const id = qs('id');
  if (!id) {
    document.getElementById('error-box').style.display = 'block';
    document.getElementById('error-box').textContent = 'No application id provided.';
    return;
  }

  try {
    const app = await fetchApplication(id);
    setValue('submittedAt', `Submitted: ${formatDate(app.submitted_at)}`);
    setValue('fullName', app.full_name);
    setValue('email', app.email);
    setValue('phone', app.phone);
    setValue('childrenCount', app.children_count);
    setValue('childrenAges', app.children_ages);
    setValue('heartShift', app.heart_shift);
    setValue('joinReason', app.join_reason);
    setValue('futureChange', app.future_change);
    setValue('readyToInvest', app.ready_to_invest);
    setValue('availability', app.availability);
    setValue('commitmentAgreement', app.commitment_agreement);
    setValue('extraNotes', app.extra_notes);
  } catch (err) {
    console.error(err);
    const errorBox = document.getElementById('error-box');
    errorBox.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', init);
