function Timeline (data) {
  var maxRowLength = 0,
      MOBILE_MODE = 'mobile',
      OTHER_MODE = 'other',
      PERIOD_FULL = 'full',
      PERIOD_FREE = 'free',
      MAX_MONTH_TILL_AVAILABLE = 1,
      SHOW_AVAILABLE_TEXT = 'Show available consultants',
      SHOW_ALL_TEXT = 'Show all consultants',
      notActualResources = 0,
      latestAssignment = void(0),
      timeFormat = 'DD/MM/YYYY',
      settings = {
        pxPerMonth: {
          'mobile': 100,
          'other': 100
        },
        timerangesOffsetX: {
          'mobile': 0,
          'other': 210
        },
        timerangesOffsetY: {
          'mobile': 60,
          'other': 0
        },
        timelineDirection: {
          'mobile': 'height',
          'other': 'width'
        },
        kineticContainer: {
          'mobile': '.timeranges .timeranges-wrap',
          'other': '.timeranges'
        },
        freeGapAtEnd: {
          'mobile': 0,
          'other': 7
        },
        kineticOptions: {
          'mobile': {},
          'other': {
            'y': false
          }
        },
        titles: {
          'full': 'Busy',
          'free': 'Available'
        }
      },
      mode = md.phone() ? MOBILE_MODE : OTHER_MODE,
      _redraw, _drawScale, _buildPeriod, _createCVWrap,
      _appendTimeLine, _parse, _adjustMobileView, _getNow, 
      _buildAvailabilityLine, _drawFilterControls, _toggleResults,
      _isAvailableSoon, _getStartOfCount;

  _getStartOfCount = function() {
    return moment().subtract('months', 1);
  };

  _getNow = function() {
    return moment();
  };

  _adjustMobileView = function () {
    if(mode !== MOBILE_MODE) return;

    var cacheKey = 'w_' + parseInt($(window).width());
    if(!_adjustMobileView.cached) {
      _adjustMobileView.cached = {};
    }
    if(!_adjustMobileView.cached.init) {
      _adjustMobileView.cached.init = true;
      var specsContainerWidth = $('.spec').width() * $('.spec').length;
      $('.timeranges .row').wrapAll('<div class="timeranges-mobile-wrap" />');
      $('.specs .spec').wrapAll('<div class="timeranges-mobile-wrap" />');
      $('.timeranges .timeranges-mobile-wrap').wrapAll('<div class="timeranges-wrap" />');
      $('.timeranges-mobile-wrap').width(specsContainerWidth + settings.timerangesOffsetY[mode]);
      $('.timeranges .row').width($('.spec').width());
    }

    if(!_adjustMobileView.cached[cacheKey]) {
      _adjustMobileView.cached[cacheKey] = {
        timelineHeight: $(window).height() / 1.7
      }
    }
    $('.timeranges, .timeranges-wrap').height(_adjustMobileView.cached[cacheKey].timelineHeight);
  };

  _redraw = function () {
    $('.timeranges').width($('#resources .section-text-wide').width() - settings.timerangesOffsetX[mode]);

    if(mode === MOBILE_MODE) {
      _adjustMobileView();
    }
  };

  _drawScale = function () {
    var container = $('.timeline .month-scale'),
        start = _getStartOfCount(),
        now = _getNow(),
        howManyMonths = Math.round(latestAssignment.diff(start, 'months', true));
    for(var i = 0; i < howManyMonths; i++) {
      var currentClass = start.isSame(now, 'month') ? 'current' : '';
      container.append('<span class="scale-entry ' + currentClass + '">' + start.format('MMM') + ' ' + start.year() + '</span>');
      start.add('months', 1);
    }
  };

  _buildPeriod = function (periodObj, isFirst) {
    var marginBetweenElements = 4, // without border, just empty space
        sideMargin = marginBetweenElements / 2,
        borderWidth = 1,
        freeOrNot = settings.titles[periodObj.type],
        padding = isFirst ? ((periodObj.duration * sideMargin) + (periodObj.duration - 1) * sideMargin) : 
                            (periodObj.duration * marginBetweenElements) - (marginBetweenElements + borderWidth),
        periodLength = periodObj.duration * settings.pxPerMonth[mode] + padding,
        period = $('<div class="time ' + periodObj.type + '"><span class="service-text">' + freeOrNot + '</span></div>');

    period.css(settings.timelineDirection[mode], periodLength);

    return {
      'obj': period,
      'length': periodLength
    }
  };

  _createCVWrap = function (resourceSpec) {
    return '<a href="mailto:ef@utvecklarbolaget.se?subject=CV request: ' + resourceSpec + '&body=Hello, I\'d like to take a look at ' + resourceSpec + '\'s CV.">' + resourceSpec + '<span class="cv-mark">Get CV</span></a>';
  }

  _appendTimeline = function (timelineData, isOdd, isVisible) {
    var specsContainer = $('.timeline .specs'),
        timerangesContainer = $('.timeline .timeranges .rows-wrap'),
        rowLength = 0,
        visibility = isVisible ? '' : 'hidden not-actual',
        oddEven = isOdd ? 'odd' : 'even';
        row = $('<div class="row ' + oddEven + ' ' + visibility + '"></div>'),
        spec = $('<div class="spec ' + oddEven + ' ' + visibility + '">' + _createCVWrap(timelineData.name) + '</div>');

    for(var i = 0; i < timelineData.dates.length; i++) {
      var periodObj = _buildPeriod(timelineData.dates[i], i === 0);

      rowLength += periodObj.length + 4;
      row.append(periodObj.obj);
    }

    if(rowLength > maxRowLength) {
      maxRowLength = rowLength;
    }

    specsContainer.append(spec);
    timerangesContainer.append(row);
  };

  _toggleResults = function() {
    $('.timeline .not-actual').toggleClass('hidden');
    var linkText = $('.timeline .filtered').html();
    $('.timeline .filtered').html(linkText === SHOW_ALL_TEXT ? SHOW_AVAILABLE_TEXT : SHOW_ALL_TEXT);
  };

  _drawFilterControls = function() {
    if(notActualResources) {
      var filteredControls = $('<a href="javascript:void(0)" class="filtered">' + SHOW_ALL_TEXT + '</a>').click(_toggleResults);
      $('.timeline').prepend(filteredControls);
    }
  };

  _buildAvailabilityLine = function(type, duration, start, end) {
    return {
      'type': type,
      'duration': duration,
      'start': start,
      'end': end
    };
  };

  _isAvailableSoon = function(timelineObj) {
    var isAvailable = false,
        i = 0;
    if(timelineObj.dates.length === 1 && timelineObj.dates[0].type === PERIOD_FREE) {
      isAvailable = true;
    }
    else if(timelineObj.dates.length > 1) {
      while(i < timelineObj.dates.length && !isAvailable) {
        if(timelineObj.dates[i].type === PERIOD_FREE) {
          var monthsTillAvailable = Math.abs(timelineObj.dates[i].start.diff(_getNow(), 'months'));
          isAvailable = monthsTillAvailable <= MAX_MONTH_TILL_AVAILABLE;
          break;
        }
        i++;
      }
    }
    return isAvailable;
  };

  _parse = function (data) {
    if(!data) return;

    var timelines = [];
    $('.timeline').show();
    $.each(data.feed.entry, function(index, item) {
      var resourceEntry = {
            'name': '',
            'dates': []
          },
          dateRanges = [],
          lastAssignmentEnded = void(0),
          now = _getStartOfCount();

      resourceEntry.name = item.title['$t'];

      if(item.content['$t'] && item.content['$t'] !== '') {
          dateRanges = item.content['$t'].split(':')[1].split(',');
          var end = dateRanges[dateRanges.length - 1].split('-');
          end = moment($.trim(end[1]), timeFormat);
      }

      if(!item.content['$t'] || item.content['$t'] === '' || 
         Math.round(end.diff(now, 'days') / 30) <= 0) {
        dateRanges = [];
        lastAssignmentEnded = now;
        resourceEntry.start = moment(lastAssignmentEnded);
        resourceEntry.end = moment(lastAssignmentEnded);
      }

      for(var i = 0; i < dateRanges.length; i++) {
        var dates = dateRanges[i].split('-'),
            begin, end, durationInMonths = 0,
            availabilityLine = {},
            durationFromNow = 0,
            durationTillNow = 0;

        begin = moment($.trim(dates[0]), timeFormat);
        end = moment($.trim(dates[1]), timeFormat);
        durationFromNow = end.diff(now, 'months');
        durationTillNow = now.diff(begin, 'months');

        if(resourceEntry.dates.length === 0) {
          var dateGap = begin.diff(now, 'days');

          if(dateGap > 15) {
            dateGap = Math.round(dateGap / 30);
            resourceEntry.dates.push(
              _buildAvailabilityLine(PERIOD_FREE, dateGap, now, begin)
            );
          }
        }

        if(durationFromNow > 0) {
          if(!latestAssignment) {
            latestAssignment = moment(end);
          }
          else if(end.diff(latestAssignment, 'months') > 0) {
            latestAssignment = moment(end);
          }

          if(lastAssignmentEnded) {
            var availableDuration = begin.diff(lastAssignmentEnded, 'months'),
                freeLine = {};

            if(availableDuration > 0) {
              resourceEntry.dates.push(
                _buildAvailabilityLine(PERIOD_FREE, availableDuration, lastAssignmentEnded, begin)
              );
            }
          }

          lastAssignmentEnded = end;
          durationInMonths = end.diff(begin, 'months');

          // assignment started in past time - add padding
          if(durationTillNow > 0 && durationTillNow < durationInMonths) {
            durationInMonths -= durationTillNow;
          }

          if(durationInMonths > 0) {
            resourceEntry.dates.push(
              _buildAvailabilityLine(PERIOD_FULL, durationInMonths, begin, end)
            );
          }
        }
      }
      resourceEntry.end = moment(lastAssignmentEnded);
      timelines.push(resourceEntry);
    });
    latestAssignment.add('months', settings.freeGapAtEnd[mode]);

    _drawScale();

    for(var i = 0; i < timelines.length; i++) {
      var emptySpace = Math.round(Math.abs(latestAssignment.diff(timelines[i].end, 'days', true) / 30)),
          isVisible = false;

      if(emptySpace > 0) {
        timelines[i].dates.push(
          _buildAvailabilityLine(PERIOD_FREE, emptySpace, timelines[i].end, latestAssignment)
        );
      }

      isVisible = _isAvailableSoon(timelines[i]);
      !isVisible && ++notActualResources;
      _appendTimeline(timelines[i], i % 2 == 0, isVisible);
    }

    _drawFilterControls();

    $('.timeline .month-scale, .timeline .row').css(settings.timelineDirection[mode], maxRowLength);
    
    _adjustMobileView();
    $(settings.kineticContainer[mode]).kinetic(settings.kineticOptions[mode]);

    if(mode === MOBILE_MODE) {
      var _scrollLeft = $.Kinetic.prototype.scrollLeft,
          _scrollTop = $.Kinetic.prototype.scrollTop;

      $.Kinetic.prototype.scrollLeft = function(left) {
        var offsetLeft = _scrollLeft.apply(this, arguments);
        $('.specs').scrollLeft(offsetLeft);
        if(offsetLeft != undefined)
          return offsetLeft;
      };

      $.Kinetic.prototype.scrollTop = function(top) {
        var offsetTop = _scrollTop.apply(this, arguments);
        $('.month-scale').css('margin-top', -offsetTop);
        if(offsetTop != undefined)
          return offsetTop;
      };
    }
    else {
      $('.shadow-wrap').height($('.specs').height());
    }
  }

  // handle data
  _parse(data);

  return {
    redraw: _redraw
  }
}