/**
 * AVIRON DIGITAL STUDIO - Contact Form Controller
 * Form validation, mailto generation, feedback status, and package pre-selection
 */

export function initForm() {
  const form = document.querySelector('.contact-form');
  const feedbackEl = document.querySelector('.form-feedback');
  const packageSelect = document.querySelector('#form-package');

  // 1. Connect Pricing Card CTA Buttons to Form Pre-selection
  const pricingCtaButtons = document.querySelectorAll('.btn-pricing');
  pricingCtaButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const packageType = btn.getAttribute('data-package');
      if (packageType && packageSelect) {
        packageSelect.value = packageType;
      }
    });
  });

  if (!form) return;

  // 2. Form Submission & Validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const serviceInput = form.querySelector('[name="service"]');
    const packageInput = form.querySelector('[name="package"]');
    const messageInput = form.querySelector('[name="message"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const service = serviceInput ? serviceInput.value : '';
    const pkg = packageInput ? packageInput.value : '';
    const message = messageInput ? messageInput.value.trim() : '';

    // Validate fields
    if (!name || name.length < 2) {
      showFeedback('Please provide your name.', 'is-error');
      if (nameInput) nameInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showFeedback('Please enter a valid email address.', 'is-error');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!message || message.length < 8) {
      showFeedback('Please describe your project or idea.', 'is-error');
      if (messageInput) messageInput.focus();
      return;
    }

    // Build Mailto link with structured metadata
    const studioEmail = 'hello@aviron.studio';
    const emailSubject = encodeURIComponent(`[Studio Enquiry] ${name} — ${service || 'General Inquiry'}`);
    
    const bodyContent = [
      `Hello AVIRON Studio Team,\n`,
      `I would like to start a project conversation with you:\n`,
      `• Name: ${name}`,
      `• Email: ${email}`,
      `• Phone/WhatsApp: ${phone || 'Not provided'}`,
      `• Service: ${service || 'Not specified'}`,
      `• Target Package: ${pkg || 'Not specified'}`,
      `\nProject Overview:\n${message}\n`,
      `-- Sent via aviron.studio web enquiry`
    ].join('\n');

    const mailtoUrl = `mailto:${studioEmail}?subject=${emailSubject}&body=${encodeURIComponent(bodyContent)}`;

    showFeedback('✓ Thank you! Opening your email client to dispatch your enquiry to hello@aviron.studio...', 'is-success');

    // Trigger user mail client
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 600);

    // Optional form reset after delay
    setTimeout(() => {
      form.reset();
    }, 4000);
  });

  function showFeedback(text, typeClass) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.className = `form-feedback is-visible ${typeClass}`;

    // Auto clear error message after 6s
    if (typeClass === 'is-error') {
      setTimeout(() => {
        feedbackEl.classList.remove('is-visible');
      }, 6000);
    }
  }
}
