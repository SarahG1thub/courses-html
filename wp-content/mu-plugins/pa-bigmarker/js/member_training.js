class PA_Bigmarker {
  static sleep( timeout ) {
    return new Promise(resolve => setTimeout(resolve, timeout))
  }

  static disable_buttons( buttons ) {
    for ( let i = 0; i < buttons.length; i++ ) {
      PA_Bigmarker.disable_button(buttons[ i ])
    }
  }

  static disable_button( button ) {
    const card = button.closest('.pa_bigmarker_card_link')
    if ( card !== null ) {
      card.setAttribute('aria-disabled', true)
    }
    button.setAttribute('aria-disabled', true)
  }

  static enable_buttons( buttons ) {
    for ( let i = 0; i < buttons.length; i++ ) {
      PA_Bigmarker.enable_button(buttons[ i ])
    }
  }

  static enable_button( button ) {
    const card = button.closest('.pa_bigmarker_card_link')
    if ( card !== null ) {
      card.setAttribute('aria-disabled', false)
    }
    button.setAttribute('aria-disabled', false)
  }

  // Checks if the element can be seen on screen, but not necessarily in frame
  static is_visible( element ) {
    if ( element === null ) {
      return false
    }
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
    return !(element.offsetParent === null ||
      element.offsetWidth === 0 ||
      element.offsetHeight === 0 ||
      element.getClientRects().length === 0 ||
      window.getComputedStyle(element).visibility === 'hidden')
  }

  static force_register() {
    const params = new URLSearchParams(window.location.search)
    if ( params.get('register') !== null ) {
      const register_button = document.querySelector('.pa_bigmarker_register_next_member_training')

      if ( PA_Bigmarker.is_visible(register_button) ) {
        register_button.click()
      }
    }
  }

  static swap_registration() {
    let registered = document.querySelectorAll('.pa_bigmarker_display_conditions_registration_next_registered')
    let unregistered = document.querySelectorAll('.pa_bigmarker_display_conditions_registration_next_unregistered')

    registered.forEach(( element ) => {
      element.classList.remove('pa_bigmarker_display_conditions_registration_next_registered')
      element.classList.add('pa_bigmarker_display_conditions_registration_next_unregistered')
    })
    unregistered.forEach(( element ) => {
      element.classList.add('pa_bigmarker_display_conditions_registration_next_registered')
      element.classList.remove('pa_bigmarker_display_conditions_registration_next_unregistered')
    })
  }

  static hide_errors() {
    const errors = document.querySelectorAll('.pa_bigmarker_error')
    errors.forEach(( element ) => {
      element.style.visibility = 'hidden';
    })
  }

  static show_errors() {
    const errors = document.querySelectorAll('.pa_bigmarker_error')
    errors.forEach(( element ) => {
      element.style.display = 'block';
      element.style.visibility = 'visible';
    })
  }

  static setup_buttons( selector, link ) {
    const buttons = document.querySelectorAll(selector)
    for ( let i = 0; i < buttons.length; i++ ) {
      buttons[ i ].addEventListener('click', async ( e ) => {
        let start_time = new Date()
        e.preventDefault()
        PA_Bigmarker.disable_buttons(buttons)
        PA_Bigmarker.hide_errors()
        try {
          let response = await fetch(link)
          let message = await response.json()
          if ( message.code === 200 ) {
            if ( link.includes('enter') ) {
              // We're entering a webinar
              window.open(message.message, '_blank')
            } else if ( message.message === true ) {
              let end_time = new Date()
              let date_diff = end_time - start_time
              let timer = 1000 - date_diff
              await PA_Bigmarker.sleep(timer)
              PA_Bigmarker.swap_registration()

              /*
                Hardcoded for one webinar to open this
               */
              const header = document.querySelector('.elementor-element-5cf35365') ?? document.querySelector('.elementor-element-d73d7ce')
              const date = document.querySelector('.elementor-element-3931a651') ?? document.querySelector('.elementor-element-53d85afd')

              if ( header !== null && date !== null ) {

                const params = new URLSearchParams(window.location.search)
                // Open survey in a new tab, unless this is an autoregister link then move the user there instead
                let target = '_blank'
                if ( params.get('register') !== null ) {
                  target = '_self'
                }

                const inner_text = header.innerText
                const date_text = date.innerText

                const options = [
                  {
                    text : 'Member Training: The Fall “Listing Incubator” Strategy',
                    date : 'OCTOBER 19',
                    link : 'https://forms.gle/uc38JZUACKRFU6Xt9',
                  },
                  {
                    text : 'Member Training: NEW Commission Calculator to Hit Your 2023 Business Goals',
                    date : 'DECEMBER 7',
                    link : 'https://forms.gle/wMe7XHrspEbtMEMn8',
                  },
                ]

                options.forEach(( option ) => {
                  if ( inner_text.search(option.text) >= 0 && date_text.search(option.date) >= 0 ) {
                    window.open(option.link, target)
                  }
                })
              }
              /*
              End hardcoded form
               */
            }
          } else {
            PA_Bigmarker.show_errors(message.code + ': ' + message.message)
          }
        } catch ( error ) {
          PA_Bigmarker.show_errors(error)
        }
        PA_Bigmarker.enable_buttons(buttons)
        return false
      })
    }
  }

  static setup_card_links() {
    let selector = '.pa_bigmarker_card_link'
    // Get all elements we want to modify into clickable cards
    const card_links = document.querySelectorAll(selector)
    for ( let i = 0; i < card_links.length; i++ ) {
      let card = card_links[ i ]

      card.addEventListener('click', async ( e ) => {
        e.target.closest('.pa_bigmarker_card_link').querySelector('.pa_bigmarker_button a').click()
      })
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  PA_Bigmarker.setup_buttons('.pa_bigmarker_enter_current_member_training', '/scripts/bigmarker/member_training/current/enter.php' + window.location.search)

  PA_Bigmarker.setup_buttons('.pa_bigmarker_register_next_member_training', '/scripts/bigmarker/member_training/next/register.php' + window.location.search)

  PA_Bigmarker.setup_card_links()

  PA_Bigmarker.force_register()
})
