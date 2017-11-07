$(document).ready(function () {
  var ERROR_HIDE_DELAY = 3000;
  var validator = void (0);

  // Toggle hamburger menu
  $('.hamburger-menu').on('click touchend', function (event) {
    event.preventDefault();
    resetForm();
    $('body').toggleClass('js-openNav');
  });

  $('.menu-item').on('click touchend', function () {
    $('body').removeClass('js-openNav');
    if(!$(this).hasClass('menu-contact')) {
      $('body').removeClass('js-openContact');
    }
  });

  $('.menu-contact').on('click touchend', function (event) {
    event.preventDefault();
    resetForm();
    $('body').toggleClass('js-openContact');
  });

  $('.contact-now').on('click touchend', function (event) {
    event.preventDefault();
    resetForm();
    if ($(window).width() <= 767) {
      $('body').toggleClass('js-openNav');
    } else {
      $('body').toggleClass('js-openContact');
    }
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

  $('.more').on('click touchend', function (event) {
    $(this).toggleClass('hide');
  });

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
        scrollPosition = target.offset().top - 80;

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
    $('.contact-form-wrap').removeClass('data-sent');
    $('.contact-form-wrap').removeClass('data-sent-error');
    $('#name, #email, #message').val('');
    $('#send-contact-details').prop('disabled', false);
    validator && validator.resetForm();
  }

  validator = $('#contact-form').validate({
    focusInvalid: false,
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
      name: 'Fyll i ditt namn', //'Obligatoriskt f&auml;lt',
      email: 'Fyll i en giltig e-post adress', // 'Ange en giltig email address',
      message: 'Skriv ditt meddelande'// 'Obligatoriskt f&auml;lt'
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
          url: window.location.protocol + '//utvecklarbolaget.se/contact.php',
          data: $('#contact-form').serialize()
      })
      .done(function(response) {
        $('.contact-form-wrap').addClass('data-sent');
      })
      .fail(function (data) {
          $('.contact-form-wrap').addClass('data-sent-error');
          $('#send-contact-details').prop('disabled', false);

          setTimeout(function () {
            $('.contact-form-wrap').removeClass('data-sent-error');
          }, ERROR_HIDE_DELAY);
      });
    }
  });

  var typed = new Typed("#typed-strings", {
    strings : [
      "",
      "Hej, kul att se dig! <br/> Vi är ett företag som gör <br/> saker lite annorlunda",
      "Vi låter utveckling, frihet <br/> och entreprenörskap <br/> genomsyra allt vi gör",
      "Vi hjälper till och med våra <br/> medarbetare att själva <br/> bli entreprenörer",
      "Genom att ge bort ett <br/> aktiebolag inom tre år <br/> efter anställning",
      "Vi bygger framtiden <br/> - i kod, i människa, i bolag!"
    ],
    typeSpeed: 40,
    backSpeed: 10,
    backDelay: 2500,
    startDelay: 0,
    smartBackspace: false,
    loop: false
  });
});
