/*
  The Elementor form, especially in combination with memb_list_subscriptions, doesn't work properly. It attempts to post
  to admin-ajax with parameters that aren't in the form, for example, so we have to heavily customize it.
 */

function pa_cancellation_setup() {
  const error_element = document.querySelector('#pa_feedback_error .elementor-text-editor')
  const final_cancellation_button = document.querySelector('#pa_cancellation_final_button')
  const form = document.querySelector('#pa_cancellation_input_form')

  if ( final_cancellation_button !== null && form !== null ) {
    // Cloning is used to remove all the event listeners
    const clone = form.cloneNode(true)

    /*
      If we don't stop immediate propagation then memb_list_subscriptions takes over and tries to submit and fails
      preventDefault is there to stop the form from submitting to itself and just refreshing the page
      stopPropagation is here for safety
     */
    clone.addEventListener('submit', ( e ) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    })

    form.parentNode.replaceChild(clone, form)

    /*
      We want to prevent the link from going to the next page so we can run a fetch request first
     */
    final_cancellation_button.addEventListener('click', async ( e ) => {
      e.preventDefault()
      clone.requestSubmit()
      const feedback = clone.querySelector('#form-field-feedback')
      const checkboxes = clone.querySelectorAll('input[type=checkbox]')
      if ( checkboxes.length === 2 && feedback !== null ) {
        // If both required checkboxes are checked
        if ( checkboxes[ 0 ].checked && checkboxes[ 1 ].checked ) {
          error_element.innerHTML = '&nbsp;'

          const result = await fetch('/scripts/cancel/feedback.php', {
            method  : 'POST',
            headers : {
              'Content-Type' : 'application/json',
            },
            body    : JSON.stringify({
              feedback : feedback.value
            }),
          })

          // This is handled in the PHP on the next page, no need to do it twice
          // await fetch('/scripts/cancel/cancel.php')

          window.open(final_cancellation_button, '_self')
        } else {
          error_element.innerHTML = 'You must accept all terms'
        }
      }
    })
  }
}

function set_back_button() {
  const buttons = document.querySelectorAll('.pa_dynamic_back_button a')
  if(buttons.length > 0) {

    let new_href = document.referrer
    // Just in case the back button leads back to this page for some reason
    if ( new_href.search(window.location.pathname) >= 0 ) {
      new_href = '/cancellation-survey/'
    }

    buttons.forEach((button) => {
      button.href = new_href
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  pa_cancellation_setup()
  set_back_button()
})
