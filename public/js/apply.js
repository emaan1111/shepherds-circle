document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('application-form');
  const responseEl = document.getElementById('form-response');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    responseEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      childrenCount: form.childrenCount.value.trim(),
      childrenAges: form.childrenAges.value.trim(),
      heartShift: form.heartShift.value.trim(),
      joinReason: form.joinReason.value.trim(),
      futureChange: form.futureChange.value.trim(),
      readyToInvest: form.readyToInvest.value,
      availability: form.availability.value.trim(),
      commitmentAgreement: form.commitmentAgreement.value,
      extraNotes: form.extraNotes.value.trim()
    };

    try {
      const res = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error submitting application');
      }

      responseEl.innerHTML = `
        <div class="notice">
          <strong>Well done!</strong> You will have the response in 48 hrs. Watch your inbox for next steps.
        </div>
      `;
      form.reset();
      submitBtn.textContent = 'Submitted';
      setTimeout(() => {
        window.location.href = '/success';
      }, 1200);
    } catch (err) {
      console.error(err);
      responseEl.innerHTML = `
        <div class="notice" style="border-left-color: #d9534f; color: #d9534f;">
          There was a problem submitting your application. Please try again.
        </div>
      `;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });
});
