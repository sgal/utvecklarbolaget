var md = new MobileDetect(window.navigator.userAgent);
if(md.mobile()) {
  $('html').addClass('mobile');
}

$(document).ready(function() {
  var key = '0Al8JF0gJfFbudHF4WDJVZWhFeUcxUzJSY19yek8tTmc',
      maxRowLength = 0,
      pxPerMonth = 100,
      latestAssignment = void(0),
      timeFormat = 'DD/MM/YYYY';

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
        cacheKey = 'w_' + parseInt($(window).width());

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
          windowWidth = parseInt($(window).width()),
          magnifier = 1;

      sideLength = windowWidth / 2;
      topLength = sideLength * 0.0931;
      mainImgHeight = 0;

      // memoisation
      resizeLayout.cachedResults[cacheKey] = {
        'sideLength': sideLength,
        'topLength': topLength
      };
    }

    $('.chevron').css({
      'border-left-width': sideLength,
      'border-right-width': sideLength,
      'border-top-width': topLength
    });

    $('.section.black').css({
      'margin-top': -topLength,
      'padding-top': topLength
    });
  };

  function redrawTimeline() {
    $('.timeranges').width($('#resources .section-text-wide').width() - 210);
  }

  $(window).resize(function() {
    resizeLayout();
    redrawTimeline();
  });

  if(window.addEventListener) {
    window.addEventListener('orientationchange', function() {
      resizeLayout();
      redrawTimeline();
    }, false);
  }

  redrawTimeline();
  resizeLayout();
});