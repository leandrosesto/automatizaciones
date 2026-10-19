document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');

  // ==========================================================================
  // 1. MENÚ MÓVIL
  // ==========================================================================
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    const setOpen = (open) => {
      navMenu.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', () => setOpen(!navMenu.classList.contains('open')));
    navMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  // ==========================================================================
  // 2. APARICIÓN SUAVE AL HACER SCROLL
  // ==========================================================================
  const revealTargets = document.querySelectorAll(
    '.situation, .steps li, .case, .gift, .about, .promises > div, .faq, .contact-grid, .stats-grid'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in'));
  }

  // ==========================================================================
  // 3. ANIMACIONES: CONTADORES E IMÁGENES
  // ==========================================================================
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = prefix + Math.round(target * ease(progress)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    counters.forEach((el) => {
      el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
    });
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  document.querySelectorAll('.case-media, .hero-figure, .about-photo').forEach((el) => el.classList.add('media'));

  // ==========================================================================
  // 4. PREGUNTAS FRECUENTES
  // ==========================================================================
  const faqQuestions = document.querySelectorAll('.faq-q');

  faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const wasOpen = question.getAttribute('aria-expanded') === 'true';

      faqQuestions.forEach((other) => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.style.maxHeight = null;
      });

      if (!wasOpen) {
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================================================
  // 5. FORMULARIO DE CONTACTO (GOOGLE APPS SCRIPT)
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const btnSubmit = document.getElementById('btn-submit-form');

  // URL DE GOOGLE APPS SCRIPT
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6KVLgl1883LoYrlMZevmGXoLdN4JHEQzyDO5Eq7NV731Vk7yM1dOqorNq7kPSnOCgig/exec";

  if (contactForm && formSuccess) {
    const fields = {
      name: document.getElementById('form-name'),
      email: document.getElementById('form-email'),
      message: document.getElementById('form-message')
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      Object.values(fields).forEach((input) => {
        const ok = input.value.trim() !== '' && (input !== fields.email || emailRegex.test(input.value.trim()));
        input.parentElement.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      const originalBtnText = btnSubmit.textContent;
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando...';

      const formParams = new URLSearchParams({
        Nombre: fields.name.value.trim(),
        Email: fields.email.value.trim(),
        Area_Puesto: '',
        Mensaje: fields.message.value.trim()
      });

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formParams.toString()
      })
        .then(() => {
          contactForm.hidden = true;
          formSuccess.hidden = false;
        })
        .catch((error) => {
          console.error('Error enviando datos:', error);
          btnSubmit.textContent = 'No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp';
          setTimeout(() => {
            btnSubmit.textContent = originalBtnText;
            btnSubmit.disabled = false;
          }, 4000);
        });
    });
  }
});
