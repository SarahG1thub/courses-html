jQuery(function ( $ ) {

  console.log('pa-modal.js loaded...');
  // $('#main a').attr('target', '_blank');
  if ( $('.modal').length) {
    console.log('modal stuff changed for ' + $('.modal').length + " modals");
  }
  // console.log($.fn.modal);

  /*$(".modal").each(function () {
    var $this = $(this);
    var $button = $('a[href="#' + $(this).attr('id') + '"]');
    $button.attr('data-target', '#' + $(this).attr('id'));
    $button.attr('href','');

    $button.on('click', function(e) {
      e.preventDefault();
      $this.modal();
    });
    //console.log();
    /!*$(this).on('shown.bs.modal', function () {
      console.log('modal open');
      $(document.body).addClass('modal-open')
    })
      .on('hidden.bs.modal', function () {
        $(document.body).removeClass('modal-open')
      });*!/
  });*/

  $("body").on('mouseup', '.modal-body', function () {
    var sel, range;
    var el = $(this)[ 0 ];
    if ( window.getSelection && document.createRange ) { //Browser compatibility
      sel = window.getSelection();

      if ( sel.toString() === '' ) { //no text selection
        window.setTimeout(function () {
          range = document.createRange(); //range object
          range.selectNodeContents(el); //sets Range
          sel.removeAllRanges(); //remove all ranges from selection
          sel.addRange(range);//add Range to a Selection.
          // copyTextToClipboard(sel.toString());
          console.log("sel", sel.anchorNode.innerHTML);
          copyToClip(sel.anchorNode.innerHTML)
        }, 1);
      }
    } else if ( document.selection ) { //older ie
      sel = document.selection.createRange();
      if ( sel.text === '' ) { //no text selection
        range = document.body.createTextRange();//Creates TextRange object
        range.moveToElementText(el);//sets Range
        range.select(); //make selection.
        document.execCommand('copy');
        console.log('text copied');
      }
    }
  });

  $("pre").on('mouseup', copy_sel );

  $('a[href="#copypostcopy"]').on('click', function(e) {
    console.log('clicked');
    e.preventDefault();
    var sel, range;
    var el = $('.post_copy')[ 0 ];
    if ( window.getSelection && document.createRange ) { //Browser compatibility
      sel = window.getSelection();

      if ( sel.toString() === '' ) { //no text selection
        window.setTimeout(function () {
          range = document.createRange(); //range object
          range.selectNodeContents(el); //sets Range
          sel.removeAllRanges(); //remove all ranges from selection
          sel.addRange(range);//add Range to a Selection.
          copyTextToClipboard(sel.toString());
        }, 1);
      }
    } else if ( document.selection ) { //older ie
      sel = document.selection.createRange();
      if ( sel.text === '' ) { //no text selection
        range = document.body.createTextRange();//Creates TextRange object
        range.moveToElementText(el);//sets Range
        range.select(); //make selection.
        document.execCommand('copy');
        console.log('text copied');
      }
    }

    return false;
  });


  function copy_sel() {
    var sel, range;
    var el = $(this)[ 0 ];
    if ( window.getSelection && document.createRange ) { //Browser compatibility
      sel = window.getSelection();

      if ( sel.toString() === '' ) { //no text selection
        window.setTimeout(function () {
          range = document.createRange(); //range object
          range.selectNodeContents(el); //sets Range
          sel.removeAllRanges(); //remove all ranges from selection
          sel.addRange(range);//add Range to a Selection.
          copyTextToClipboard(sel.toString());
        }, 1);
      }
    } else if ( document.selection ) { //older ie
      sel = document.selection.createRange();
      if ( sel.text === '' ) { //no text selection
        range = document.body.createTextRange();//Creates TextRange object
        range.moveToElementText(el);//sets Range
        range.select(); //make selection.
        document.execCommand('copy');
        console.log('text copied');
      }
    }
  }
});

function fallbackCopyTextToClipboard( text ) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch ( err ) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyToClip( str ) {
  function listener( e ) {
    e.clipboardData.setData("text/html", str);
    e.clipboardData.setData("text/plain", str);
    e.preventDefault();
    toastr[ "info" ]("The text has successfully been copied to your clipboard.", "Text Copied")
  }

  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
}

function copyTextToClipboard( text ) {

  if ( !navigator.clipboard ) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
    toastr[ "info" ]("The text has successfully been copied to your clipboard.", "Text Copied")
  }, function ( err ) {
    console.error('Async: Could not copy text: ', err);
  });
}

function cliplistener( e ) {
  e.clipboardData.setData("text/html", str);
  e.clipboardData.setData("text/plain", str);
  e.preventDefault();
}

toastr.options = {
  "closeButton"       : false,
  "debug"             : false,
  "newestOnTop"       : false,
  "progressBar"       : false,
  "positionClass"     : "toast-bottom-right",
  "preventDuplicates" : true,
  "onclick"           : null,
  "showDuration"      : "300",
  "hideDuration"      : "1000",
  "timeOut"           : "5000",
  "extendedTimeOut"   : "1000",
  "showEasing"        : "swing",
  "hideEasing"        : "linear",
  "showMethod"        : "fadeIn",
  "hideMethod"        : "fadeOut"
}