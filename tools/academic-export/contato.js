/* Formulário acadêmico: validação nativa, sem envio nem armazenamento. */
(function () {
  'use strict';
  const form = document.querySelector('[data-contact]');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.reset();
    let status = form.querySelector('[role="status"]');
    if (!status) { status = document.createElement('p'); status.setAttribute('role', 'status'); status.className = 'form-status'; form.append(status); }
    status.textContent = 'Obrigado! Como este é um ambiente demonstrativo, sua mensagem não foi enviada nem armazenada.';
  });
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = 'joao.p.nunes.200707@uni9.edu.br';
    try {
      await navigator.clipboard.writeText(email); window.KT_UI.notify('E-mail copiado');
    } catch { window.KT_UI.notify('Não foi possível copiar. E-mail: ' + email); }
  }));
})();