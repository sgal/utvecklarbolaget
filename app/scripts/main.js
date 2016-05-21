var md = new MobileDetect(window.navigator.userAgent);
md.mobile() && $('html').addClass('mobile');
md.phone() && $('html').addClass('phone');

$(document).ready(function() {

  // Toggle hamburger menu
  $('.hamburger-menu').on('click', function(){
    $('.header-wrap').toggleClass('js-openNav');
  });


  var imgAspectRatio = 2.511, // 1919 x 764
      isNavigating = false,
      disableScroll = false,
      justLoaded = true,
      History = new StateHistory();

  function isOldIE() {
    var ua = navigator.userAgent;
    return ua.indexOf('MSIE 9.0') != -1 ||
           ua.indexOf('MSIE 8.0') != -1 ||
           ua.indexOf('MSIE 7.0') != -1 ||
           ua.indexOf('MSIE 6.0') != -1;
  }

  function resizeLayout() {
    var sideLength,
        topLength,
        mainImgHeight,
        cacheKey = 'w_' + parseInt($(window).width(), 10);

    // memoisation
    if(!resizeLayout.cachedResults) {
      resizeLayout.cachedResults = {};
    }
    if(resizeLayout.cachedResults[cacheKey]) {
      mainImgHeight = resizeLayout.cachedResults[cacheKey].mainImgHeight;
      sideLength = resizeLayout.cachedResults[cacheKey].sideLength;
      topLength = resizeLayout.cachedResults[cacheKey].topLength;
    }
    else {
      var backgroundSize = $('.front').css('background-size'),
          windowWidth = parseInt($(window).width(), 10),
          magnifier = 1;

      sideLength = windowWidth / 2;
      topLength = sideLength * 0.0931;
      mainImgHeight = 0;

      if(backgroundSize && backgroundSize.indexOf('px') != -1) {
        magnifier = parseInt(backgroundSize, 10) / windowWidth;
      }
      else if(backgroundSize && backgroundSize.indexOf('%') != -1) {
        magnifier = parseInt(backgroundSize.split(' ')[0], 10) / 100;
      }

      mainImgHeight = Math.floor((windowWidth / imgAspectRatio) * magnifier);

      // memoisation
      resizeLayout.cachedResults[cacheKey] = {
        'mainImgHeight': mainImgHeight,
        'sideLength': sideLength,
        'topLength': topLength
      };
    }

    $('.front .container').css('height', mainImgHeight);

    $('.chevron').css({
      'border-left-width': sideLength,
      'border-right-width': sideLength,
      'border-top-width': topLength
    });
  }

  function highLightMenuFromHash() {
    var hash = History.getState().substr(1),
        target = $('.menu-item.menu-' + hash);

    if(!target.hasClass('active')) {
      $('.menu-item').removeClass('active');
      target.addClass('active');
    }
  }

  function handleScrollToHighlightMenu(event) {
    if(disableScroll) {
      disableScroll = false;
    }
    else if(!isNavigating) {
      var currentState = History.getState().substr(1);
      console.log(currentState);
      $('.section').each(function() {
        if ($(this).offset().top < window.pageYOffset + 200 &&
            $(this).offset().top + $(this).height() > window.pageYOffset + 200) {
          if(currentState != $(this).attr('id')) {
            console.log('Not on current');
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

  resizeLayout();
  handleScrollToHighlightMenu();
  justLoaded = false;

  $(window).resize(function() {
    resizeLayout();
  });

  if(window.addEventListener) {
    window.addEventListener('orientationchange', resizeLayout, false);
  }

  $('.mobile .window-wrap').click(function(event) {
    event.stopPropagation();
    $(this).parent().find('.text').slideToggle('fast');
    $(this).toggleClass('opened');
  });

  // smooth anchor scrolling
    $('a[href*=#]:not([href=#])').click(function(event) {
      if(location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
        var target = $(this.hash),
            hash = this.hash,
            scrollPosition = 0;
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if(target.length) {
          if(!isOldIE()) {
            event.preventDefault();
            event.stopPropagation();
            isNavigating = true;
            scrollPosition = target.offset().top - 65;
            
            if(md.phone() && md.userAgent() === 'IE') { //windowsphone
              window.scrollTo(0, scrollPosition);
              isNavigating = false;
              disableScroll = true;
              History.pushState(hash);
            }
            else {
              $('html, body').animate({
                scrollTop: scrollPosition
              }, 500,
              function() {
                isNavigating = false;
                disableScroll = true;
                History.pushState(hash);
              });
            }
          }
          else { // old IE
            History.pushState(hash);
          }
        }
      }
    });

  if(!md.mobile()) {
    $(window).on('scroll', $.throttle(handleScrollToHighlightMenu, 100));

    $('.hover-expandable').mouseover(function(event) {
      event.stopPropagation();
      if(!$(this).data('width')) {
        $(this).data('width', $(this).outerWidth());
      }
      var width = parseInt($(this).data('width'), 10);
      $(this).parent().css('right', width - 50);
    });

    $('.hover-expandable').mouseout(function(event) {
      event.stopPropagation();
      $(this).parent().css('right', 0);
    });

    if(History.getState()) {
      highLightMenuFromHash();
    }

    History.onStateChanged(function(state) {
      highLightMenuFromHash();

      if(state == '#home') {
        $('.menu-home').hide();
      }
      else {
        $('.menu-home').show();
      }
    });
  }

  function toggleScrolling() {
    if($('.sticky-menu').hasClass('active')) {
      $(window).on('touchmove', function(event) {
        event.preventDefault();
        return false;
      });

      if (window.navigator.msPointerEnabled) {
        this.element.addEventListener("MSPointerMove", function(event) {
          return false;
        }, false);
      }
    }
    else {
      $(window).off('touchmove');

      if (window.navigator.msPointerEnabled) {
        this.element.removeEventListener("MSPointerMove");
      }
    }
  }

  $('.mobile .opener a').click(function(event) {
    event.preventDefault();
    $('.sticky-menu').toggleClass('active');
    $('.blurred').toggle();
    toggleScrolling();
  });

  $('.blurred, .mobile .menu-item-wrap:not(.opener) a').click(function(event) {
    $('.sticky-menu').removeClass('active');
    $('.blurred').hide();
    toggleScrolling();
  });

  $(window).on('hashchange', function(event) {
    event.preventDefault();
  });

  if(!md.phone()) {
    $('#areas .text').shorten({
      'showChars': 80,
      'moreText': 'More',
      'lessText': 'Less'
    });
  }

});
