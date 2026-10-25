'use strict';

(() => {
  const { $, $$ } = window.site;
  const form = $('.js-contact');
  const msg = $('.js-form-msg');
  const fields = { name: '#f-name', email: '#f-email', message: '#f-message' };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;
    Object.entries(fields).forEach(([k, sel]) => {
      const bad = !String(data[k] || '').trim() || (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[k]));
      $(sel).closest('.field').classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    msg.classList.remove('is-done');
    if (!ok) {
      msg.textContent = '未入力の項目、または正しくない項目があります。';
      return;
    }
    const btn = $('.send-btn', form);
    btn.disabled = true;
    msg.textContent = '送信しています…';
    fetch('contact/mail.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(r => r.json().then(j => ({ sent: r.ok, j })))
      .then(({ sent, j }) => {
        if (!sent) throw new Error(j.error || '');
        form.reset();
        msg.classList.add('is-done');
        msg.textContent = 'お問い合わせを受け付けました。内容を確認のうえ、担当よりご連絡いたします。';
      })
      .catch(err => {
        msg.textContent = err.message || '送信に失敗しました。時間をおいて再度お試しください。';
      })
      .finally(() => { btn.disabled = false; });
  });

  $$('.field input, .field textarea', form).forEach(el => el.addEventListener('input', () => el.closest('.field').classList.remove('is-error')));
})();
