document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('[data-recaptcha-form="ask-question"]')
  if (!form) return

  var siteKey = form.getAttribute('data-recaptcha-site-key')
  var tokenInput = document.getElementById('recaptcha-token-input')

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    grecaptcha.enterprise.ready(function () {
      grecaptcha.enterprise.execute(siteKey, { action: 'question' }).then(function (token) {
        tokenInput.value = token
        form.submit()
      })
    })
  })
})
