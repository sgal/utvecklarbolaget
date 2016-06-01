$(document).ready(function () {
  var ERROR_HIDE_DELAY = 3000;

  // Toggle hamburger menu
  $('.hamburger-menu').on('click touchend', function (event) {
    event.preventDefault();
    resetForm();
    $('.header-wrap').toggleClass('js-openNav');
  });


  var isNavigating = false,
    disableScroll = false,
    justLoaded = true,
    History = new StateHistory();

  function highLightMenuFromHash() {
    var hash = History.getState().substr(1),
      target = $('.menu-item.menu-' + hash);

    if (!target.hasClass('active')) {
      $('.menu-item').removeClass('active');
      target.addClass('active');
    }
  }

  function handleScrollToHighlightMenu(event) {
    if (disableScroll) {
      disableScroll = false;
    }
    else if (!isNavigating) {
      var currentState = History.getState().substr(1);
      $('.section').each(function () {
        if ($(this).offset().top < window.pageYOffset + 200 &&
          $(this).offset().top + $(this).height() > window.pageYOffset + 200) {
          if (currentState !== $(this).attr('id')) {
            History.pushState($(this).attr('id'));
            if (currentState === 'home') {
              $('.sticky-menu-desktop').addClass('sticked');
            }
            else if ($(this).attr('id') === 'home') {
              $('.sticky-menu-desktop').removeClass('sticked');
            }
          }
          else if (justLoaded === true && $(this).attr('id') !== 'home') {
            $('.sticky-menu-desktop').addClass('sticked');
          }
        }
      });
    }
  }

  handleScrollToHighlightMenu();
  justLoaded = false;

  // smooth anchor scrolling
  $('a[href*=#]:not([href=#])').click(function (event) {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash),
        hash = this.hash,
        scrollPosition = 0;

      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        event.stopPropagation();
        isNavigating = true;
        scrollPosition = target.offset().top - 65;

        $('html, body').animate({
          scrollTop: scrollPosition
        }, 500, function () {
          isNavigating = false;
          handleScrollToHighlightMenu();
          History.pushState(hash);
        });
      }
    }
  });

  $(window).on('scroll', $.throttle(handleScrollToHighlightMenu, 100));

  if (History.getState()) {
    highLightMenuFromHash();
  }

  History.onStateChanged(function () {
    highLightMenuFromHash();
  });

  $(window).on('hashchange', function (event) {
    event.preventDefault();
  });

  function resetForm() {
    $('.contact-form').removeClass('data-sent');
    $('#name, #email, #message').val('');
    $('#send-contact-details').prop('disabled', false);
  }

  $('#contact-form').validate({
    rules: {
      name: {
        required: true,
        minlength: 2
      },
      email: {
        required: true,
        email: true
      },
      message: 'required'
    },
    messages: {
      name: 'Please enter your name',
      email: 'Please enter a valid email address',
      message: 'Please enter a message you want to send'
    },
    errorElement: 'em',
    errorPlacement: function (error, element) {
      error.addClass('help-block');
      error.insertBefore(element);
    },
    submitHandler: function () {
      $('#send-contact-details').prop('disabled', true);
      $.ajax({
          type: 'POST',
          url: 'http://utvecklarbolaget.se/contact.php',
          data: $('#contact-form').serialize()
      })
      .done(function(response) {
        $('.contact-form').addClass('data-sent');
      })
      .fail(function (data) {
          $('.contact-form').addClass('data-sent-error');
          $('#send-contact-details').prop('disabled', false);

          setTimeout(function () {
            $('.contact-form').removeClass('data-sent-error');
          }, ERROR_HIDE_DELAY);
      });
    }
  });
});
