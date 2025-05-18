var alert_color_warning_background = 'pink';
window.sendingmail = false;

(function ( $ ) {
  $('.card[data-url]').on('click', function ( e ) {
    window.location = $(this).data('url');
  });

  var supportform = document.querySelector('div.wpcf7');

  if ( $('div.wpcf7').length > 0 ) {

    supportform.addEventListener('wpcf7beforesubmit', function ( event ) {
      console.log('beforesubmit', event);
      console.log('event.detail.status', event.detail.status);

      $('.wpcf7-submit').find('input').prop('disabled', 'disabled');

      // window.sendingmail = false;
      //   $('.wpcf7-submit').fadeIn();
    }, false);

    supportform.addEventListener('wpcf7invalid', function ( event ) {
      $('.wpcf7-submit').find('input').prop('disabled', false);
      console.log('wpcf7submit', event);
    }, false);

    supportform.addEventListener('wpcf7mailsent', function ( event ) {
      $(event.target).find('.has-error').removeClass('has-error');
      //
      console.log('wpcf7mailsent', event);
      notie.alert({ type : 1, text : "Your message was sent successfully. Thanks.", time : 5 });
      $(event.target).find('.wpcf7-submit input').prop('disabled');
    }, false);

    supportform.addEventListener('wpcf7mailfailed', function ( event ) {
      $(event.target).find('.has-error').removeClass('has-error');
      console.log('wpcf7mailfailed', event);
      $(event.target).find('.wpcf7-submit input').prop('disabled', false);

    }, false);

    supportform.addEventListener('wpcf7invalid', function ( event ) {
      console.log('wpcf7invalid', event);
      notie.alert({
        type : 2,
        text : "There was an error with one of the fields, please check them and try again.",
        time : 3
      });
    }, false);
  }

  // var $contactsubmit = $('.wpcf7-submit');
  // if ( $contactsubmit.length > 0 ) {
  //   $contactsubmit.on('click', function () {
  //     // $(this).fadeOut();
  //     // $(this).find('input').prop('disabled','disabled');
  //     if ( window.sendingmail === false ) {
  //       window.sendingmail = true;
  //       $('.wpcf7-form').trigger('submit');
  //     }
  //   })
  // }

})(jQuery);

// on_submit: "contactFormSubmit($form,data);"