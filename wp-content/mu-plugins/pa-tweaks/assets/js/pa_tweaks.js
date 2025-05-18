//Search Script
jQuery(function ( $ ) {

  console.log("PA Tweaks Loaded");

  var $dllinks = $('a[href^="https://dashboard.thepaperlessagent.com/download/"]');

  if ( $dllinks.length > 0 ) {
    // we have download links
    $dllinks.each(function () {
      var $this = $(this);
      var link = $this.attr('href');
      if ( typeof _paq !== "undefined" ) {
        $this.attr('onClick', "_paq.push['trackLink', '" + link + "', 'download'];");
      }
    });
  } else {
    console.log('No download links found...');
  }

  /**
   * Access stuff for dashboard cards
   */
  $('.card[data-url]').on('click', function ( e ) {
    window.location = $(this).data('url');
  });

  if ( typeof $.fn.matchHeight === "function" ) {
    $('.media-body').matchHeight();
    $('.match-height').matchHeight();
    $('.course-item').matchHeight();
    $('.caption').matchHeight();
    $('.card').not('.nomatchheight').matchHeight();

    var $medbodytwo = $('.media-body-two');
    if ( $medbodytwo.length > 0 ) {
      $medbodytwo.parent().parent().matchHeight();
    }

  } else {
    console.warning('matchHeight jQuery plugin not found');
  }

  // cat dropdown\
  var $catselect = $('#catselect');
  if ( $catselect.length > 0 ) {
    // $catselect.find(":selected").removeAttr('selected');
    var $select = $catselect.selectpicker({
      style : 'btn-info btn-muted',
      // size : 4
    });
    $select.selectpicker('val', '');

    $select.on('changed.bs.select', function ( e, index, newValue, oldValue ) {
      // do something...
      // console.log(e, index, newValue, oldValue);
      var value = $select.find('option').eq(index).val();
      console.log('looking for ', value);
      var target = $('[id="' + value + '"]');
      target = target.length ? target : $('[name="' + value + '"]');
      if ( target.length ) {
        $('html, body').animate({
          scrollTop : target.offset().top - 40
        }, 1000);
        if ( history.pushState ) {
          history.pushState(null, null, '#' + value);
        } else {
          location.hash = '#' + value;
        }

        return false;
      }
    });

  }
  // fix the categories
  var $dropdownmenubutton = $('#dropdownMenuButton');
  if ( $dropdownmenubutton.length ) {
    $dropdownmenubutton.dropdown({
      // offset: "500px"
    });
  }

  function toggleSearch() {
    var $search = $('.searchBox');
    if ( $search.is(":visible") ) {
      $search.removeClass('searchOpen').addClass('searchClose');
    } else {
      $search.removeClass('searchClose').addClass('searchOpen');

    }
  }

  var $mainsearch = $("#main-search");
  $(".searchBtn").on("click", function () {

    $mainsearch.slideToggle();
    $mainsearch.toggleClass('opened');

    $('html,body').animate({ scrollTop : 0 }, 'fast');
    document.getElementById("s").focus();
    return false;
  });

  // $('.searchBtn').click(function () {
  //   toggleSearch();
  // });

  $(document).mouseup(function ( e ) {
    var search = $('.searchBox');
    if ( search.is(":visible") ) {

      if ( e.target.id !== search.attr('id') && !search.has(e.target).length ) {
        search.removeClass('searchOpen').addClass('searchClose');
      }
    }
  });
});

//scroll to script
jQuery(function ( $ ) {
  $('a[href*="#"]:not([href="#"])').click(function () {
    if ( location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname ) {
      if ( this.hash.indexOf("elementor") !== -1 ) {
        return true;
      }
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if ( target.length ) {
        $('html, body').animate({
          scrollTop : target.offset().top - 40
        }, 1000);
        return false;
      }
    }
  });
});

var check_link_interval;
var disable_mouse = false;

/**
 * Process Street Stuff
 */
jQuery(function ( $ ) {
  var $processlinks = $('.runlink a');
  if ( $processlinks.length ) {
    check_run_link();
    console.log('found links, updating...');
    $processlinks.each(function () {
      var $this = $(this);
      var matches = $this.prop('href').match(/https\:\/\/app.process.st\/workflows\/([a-zA-Z]+)\-([0-9]+).*\/run\-link/);
      if ( matches ) {
        var month = matches[ 1 ];
        var year = matches[ 2 ];
        //https://app.process.st/workflows/July-2021-Action-Items-asdfwefdsfoilih/run-link?checklist_name=Nick+Wortley+July+2021&form.Account_Email=nicholaswortley@gmail.com
        // console.log('found run link');
        var newlink = $this.prop('href') + '?checklist_name=' + encodeURIComponent(first_name).replace(/%20/g, '+') + '+' + encodeURIComponent(last_name).replace(/%20/g, "+") + "+" + month + "+" + year +
          "&form.Account_Email=" + email_address;
        $this.prop('href', newlink);
        console.log('Run link changed');
        $this.on('click', function ( e ) {
          // e.preventDefault(); // uncomment to test
          console.log('item clicked, starting check interval every 10 seconds');
          disable_mouse = true;
          check_link_interval = setInterval(check_run_link, 10000);
          check_run_link();
          // return false; // also uncomment this to test
        })
      } else {
        console.log('Process Street link is already updated, no action needed.')
      }

    })
  } else {
    console.log('no run links found');
  }

});

function check_run_link() {
  jQuery.ajax({
    url     : ajaxurl,
    data    : {
      action : "check_run_link"
    },
    success : function ( data ) {
      var $ = window.jQuery;
      var matches = data.match(/https\:\/\/app.process.st\/workflows\/([a-zA-Z]+)\-([0-9]+).*\/run\-link/);
      if ( matches ) {
        console.log('User run link url has not changed', data);
        var $processlinks = $('.runlink a');
        if ( $processlinks.length ) {
          $processlinks.each(function () {
            var $this = $(this);
            if ( disable_mouse ) {
              $this.css('pointer-events', 'none');
              $this.css('cursor', 'default');
            }
          })
        }
      } else {
        // we have a new run link!
        console.log('User run link has changed, updating the links to:' + data);
        var $processlinks = $('.runlink a');
        if ( $processlinks.length ) {
          $processlinks.each(function () {
            var $this = $(this);
            // update the links
            $this.prop('href', data);
            $this.css('pointer-events', 'auto');
            $this.css('cursor', 'pointer');

          })
        }
        clearInterval(check_link_interval);

      }
    },
    error   : function ( err ) {
      console.error(err);
    }
  })
}

/*
  2022-03-31
  Start JavasScript for the new dashboard
 */

// Changes href in header anchors to fragments if on the same page.
function fix_anchors() {
  // Get all links inside navigation in the header
  const header_nav_links = document.querySelectorAll('[data-elementor-type=header] nav a')
  // Get the current URL without the fragment
  const current_location = window.location.origin + window.location.pathname
  // Set trailing_slash to / if the current location has one, else blank it
  const trailing_slash = current_location.slice(-1) === '/' ? '/' : ''

  header_nav_links.forEach(element => {
    // Split navigation link at the fragment
    const href = element.href.split('#')

    // Get the fragment portion of the navigation link
    const fragment = href[ 1 ]

    // If there is no fragment, do nothing
    if ( typeof fragment === typeof undefined ) {
      return
    }

    // Get the location part of the navigation link
    let location = href[ 0 ]

    // If the end of the navigation link isn't a slash add trailing_slash
    if ( location.slice(-1) !== '/' ) {
      location = location + trailing_slash
    }

    // If we're on the same page as the link, change the element's href to a fragment link
    if ( location === current_location ) {
      element.href = '#' + fragment
    }
  })
}

// Puts icons on header navigation links
function set_icons() {
  // Object that holds the svgs. The keys must be the lowercase of the content of the nav tab
  let svg_object = {}

  // image material icon
  svg_object.content = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>'

  // construction material icon
  svg_object.tools = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 26 26" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><rect height="8.48" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -6.8717 17.6255)" width="3" x="16.34" y="12.87"/><path d="M17.5,10c1.93,0,3.5-1.57,3.5-3.5c0-0.58-0.16-1.12-0.41-1.6l-2.7,2.7L16.4,6.11l2.7-2.7C18.62,3.16,18.08,3,17.5,3 C15.57,3,14,4.57,14,6.5c0,0.41,0.08,0.8,0.21,1.16l-1.85,1.85l-1.78-1.78l0.71-0.71L9.88,5.61L12,3.49 c-1.17-1.17-3.07-1.17-4.24,0L4.22,7.03l1.41,1.41H2.81L2.1,9.15l3.54,3.54l0.71-0.71V9.15l1.41,1.41l0.71-0.71l1.78,1.78 l-7.41,7.41l2.12,2.12L16.34,9.79C16.7,9.92,17.09,10,17.5,10z"/></g></g></svg>'

  // school material icon
  svg_object.training = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>'

  // question answer material icon
  svg_object.community = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15 4v7H5.17l-.59.59-.58.58V4h11m1-2H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm5 4h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z"/></svg>'

  // shopping bag material icon
  svg_object.products = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 26 26" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><g><rect fill="none" height="24" width="24"/><path d="M18,6h-2c0-2.21-1.79-4-4-4S8,3.79,8,6H6C4.9,6,4,6.9,4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8C20,6.9,19.1,6,18,6z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M18,20H6V8h2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8h4v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8 h2V20z"/></g></svg>'

  svg_object.courses = svg_object.products;

  // help material icon
  svg_object.help = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>'

  svg_object.home = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="m12 5.69 5 4.5V18h-2v-6H9v6H7v-7.81zM12 3 2 12h3v8h6v-6h2v6h6v-8h3z"></path></svg>'

  svg_object.events = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V9h14zM5 7V5h14v2zm2 4h10v2H7zm0 4h7v2H7z"></path></svg>'

  svg_object.marketing = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M20 6H10v2h10v12H4V8h2v4h2V4h6V0H6v6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2"></path></svg>'

  // person material icon
  svg_object[ 'my account' ] = '<svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 0 26 26" width="26px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'

  // Get all links inside navigation in the header
  const header_nav_links = document.querySelectorAll('[data-elementor-type=header] nav a')

  header_nav_links.forEach(element => {
    // Get the contents of the element in lowercase
    // We don't use innerText here in case the function runs multiple times, like in the editor
    const nav_text = element.innerHTML.toLowerCase()
    // Retrieve the icon from the library
    const icon = svg_object[ nav_text ] ?? ''

    // Prepend the icon to the element contents
    element.innerHTML = icon + element.innerHTML
  })
}

/*
  This function makes it so that elements with the card_link class will be able to be clicked everywhere to give a nice
  effect similar to the Hub without wrapping the whole thing in <a> due to Elementor's inability to allow that
 */
function clickable_cards() {
  // Get all elements we want to modify into clickable cards
  const card_links = document.querySelectorAll('.card_link')

  card_links.forEach(element => {
    element.querySelectorAll('a').forEach(ele => {
      ele.addEventListener('click', ( e ) => {
        e.preventDefault()
        return false
      })
    })

    // When clicking anywhere in the elemnt, go to link
    element.addEventListener('click', async ( e ) => {
      // Get the href of the first link we find
      const link = element.querySelector('a')
      const href = link.href
      let target = '_self'
      /*
`         This section will automatically make links open in a new window unless they have a class to bypass that
          feature

          Bypass originally added for /cancellation-main-menu/ so all entries will open in the same page

          cancellation_survey_card_link added for /cancellation-survey/ in order to do a POST request first

          I believe the reason this feature exists in the first place is to compensate for human error and
          automatically generated links potential results
       */
      if ( element.classList.contains('cancellation_survey_card_link') ) {
        const text = element?.innerText ?? ''
        const split = text?.split('\n') ?? ['']
        const reason = split[ 0 ]

        const result = await fetch('/scripts/cancel/reason.php', {
          method  : 'POST',
          headers : {
            'Content-Type' : 'application/json',
          },
          body    : JSON.stringify({
            reason
          }),
        })
      } else if ( element.classList.contains('disable_card_link_auto_target') ) {
        target = link.target
        if ( target === '' ) {
          target = '_self'
        }
      } else {
        // If we're linking outsaide dashboard, target a new tab, otherwise just move there
        target = href.search(window.location.host) < 0 ? '_blank' : '_self'
      }

      // Using window.open because using link.click() will get blocked by Chrome's popup blocker
      window.open(href, target)
    })

  })
}

// Makes margins between header nav entries
function create_header_margins() {
  let list_containers = document.querySelectorAll('[data-elementor-type=header] .elementor-nav-menu--main ul')

  // There may be multiple navs, scan through them all
  list_containers.forEach(list_container => {
    let elements = list_container.querySelectorAll('.menu-item')

    for ( let i = 0; i < elements.length; i++ ) {
      // If it's not the first element add the margin before the element
      if ( i !== 0 ) {
        let margin = document.createElement('li')
        margin.classList.add('header-margin-item')

        // Insert a new margin list element before the current element
        list_container.insertBefore(margin, elements[ i ])
      }
    }
  })
}

// Header drop shadow class function
function change_header_drop_shadow_class() {
  const container = document.querySelector('#header-container')
  if ( container !== null ) {
    if ( window.scrollY === 0 ) {
      container.classList.remove('header-scrolled')
    } else {
      container.classList.add('header-scrolled')
    }
  }
}

// Drop shadow on scroll
function add_header_drop_shadow() {
  change_header_drop_shadow_class()

  document.addEventListener('scroll', ( e ) => {
    change_header_drop_shadow_class()
  })
}

document.addEventListener('readystatechange', ( event ) => {
  if ( event.target.readyState === 'complete' ) {
    add_header_drop_shadow()
    fix_anchors()
    set_icons()
    create_header_margins()
    const container = document.querySelector('#header-container')
    if(container !== null) {
      container.style.visibility = 'unset'
    }
    clickable_cards()
  }
})

/*
  End JavaScript for the new dashboard
 */