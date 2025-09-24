document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = Array.from(document.querySelectorAll('[data-tab]'));
  const sections = Array.from(document.querySelectorAll('[data-tab-content]'));

  function showTab(name) {
    sections.forEach(s => {
      const isActive = s.id === name;
      s.classList.toggle('hidden', !isActive);
      if (isActive) {
        history.replaceState(null, '', `#${name}`);
      }
      
    });
    tabButtons.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  }

  tabButtons.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));

  document.querySelectorAll('[data-open-tab]').forEach(el => {
    el.addEventListener('click', () => showTab(el.dataset.openTab));
  });

  const initial = location.hash?.replace('#', '') || 'evento';
  showTab(initial === 'donacion' ? 'donacion' : 'evento');

  // Simple modal helpers
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  function openModal(title, bodyHtml) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }

  // Certificado fiscal button opens modal with details
  const certBtn = document.getElementById('btn-certificado');
  if (certBtn) {
    certBtn.addEventListener('click', () => {
      openModal('Certificado fiscal', `
        <p>Para poder elaborar el certificado fiscal y obtener los beneficios fiscales en la declaración de la renta de 2025, una vez hecha la aportación enviad un email a <a href="mailto:donatius@caritasdiocesanaterrassa.cat">donatius@caritasdiocesanaterrassa.cat</a> indicando:</p>
        <ul>
          <li>Nombre y apellidos</li>
          <li>DNI</li>
          <li>Dirección</li>
          <li>Código postal</li>
          <li>Que la aportación ha sido para el cumpleaños de Merche Peralta</li>
          <li>Fecha en que se ha hecho la aportación económica</li>
          <li>Cantidad € aportada</li>
          <li>Por qué medio ha hecho la aportación: web, transferencia o Bizum</li>
        </ul>
      `);
    });
  }

  // Allergy form via EmailJS only
  const allergyForm = document.getElementById('allergy-form');
  if (allergyForm) {
    const statusEl = document.getElementById('allergy-status');

    const publicKey = allergyForm.getAttribute('data-emailjs-public-key');
    const serviceId = allergyForm.getAttribute('data-emailjs-service-id');
    const templateId = allergyForm.getAttribute('data-emailjs-template-id');

    const canUseEmailJs = Boolean(window.emailjs && publicKey && serviceId && templateId &&
      !publicKey.includes('YOUR_') && !templateId.includes('YOUR_'));

    if (canUseEmailJs) {
      try { emailjs.init({ publicKey }); } catch {}
    }

    allergyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('allergy-name').value.trim();
      const details = document.getElementById('allergy-details').value.trim();

      if (!canUseEmailJs) {
        openModal('Configurar Email', 'Faltan las claves de EmailJS. Añádelas para poder enviar.');
        return;
      }

      statusEl.textContent = 'Enviando...';
      try {
        await emailjs.send(serviceId, templateId, {
          from_name: name || 'Invitad@',
          name: name || 'Invitad@',
          message: details,
          time: new Date().toLocaleString('es-ES'),
        });
        statusEl.textContent = '';
        allergyForm.reset();
        openModal('¡Mensaje enviado!', 'Gracias por la información.');
      } catch (err) {
        statusEl.textContent = '';
        openModal('Error', 'No se pudo enviar el mensaje. Inténtalo más tarde.');
      }
    });
  }
});
