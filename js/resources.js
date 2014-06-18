var md = new MobileDetect(window.navigator.userAgent);
md.mobile() && $('html').addClass('mobile');
md.phone() && $('html').addClass('phone');

$(document).ready(function() {
  var key = '0Al8JF0gJfFbudHF4WDJVZWhFeUcxUzJSY19yek8tTmc',
      timeline = void(0);

  function isOldIE() {
    var ua = navigator.userAgent;
    return ua.indexOf('MSIE 9.0') != -1 || 
           ua.indexOf('MSIE 8.0') != -1 || 
           ua.indexOf('MSIE 7.0') != -1 || 
           ua.indexOf('MSIE 6.0') != -1;
  }
  // get the data
  var protocol = isOldIE() ? 'http' : 'https';

  $(window).resize(function() {
    resizeLayout();
    timeline && timeline.redraw();
  });

  if(window.addEventListener) {
    window.addEventListener('orientationchange', function() {
      resizeLayout();
      timeline && timeline.redraw();
    }, false);
  }

  resizeLayout();

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

  // main logic starts
  $.ajax({ 
    url: protocol + '://spreadsheets.google.com/feeds/list/' + key + '/od6/public/basic?hl=en_US&alt=json', 
    type: 'get',
    success: function(data) {
      timeline = new Timeline(data);
      timeline.redraw();
    },
    error: function(error) {
      console.log(error);
    }
  });
});