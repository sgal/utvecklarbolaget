function Timeline (data) {
  var maxRowLength = 0,
      MOBILE_MODE = 'mobile',
      OTHER_MODE = 'other',
      PERIOD_FULL = 'full',
      PERIOD_FREE = 'free',
      MAX_MONTH_TILL_AVAILABLE = 1,
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
          'other': 3
        }
      },
      mode = md.phone() ? MOBILE_MODE : OTHER_MODE,
      _redraw, _drawScale, _buildPeriod, _createCVWrap,
      _appendTimeLine, _parse, _adjustMobileView;

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
        now = moment(),
        howManyMonths = latestAssignment.diff(now, 'months');
    for(var i = 0; i < howManyMonths; i++) {
      container.append('<span class="scale-entry">' + now.format('MMM') + ' ' + now.year() + '</span>');
      now.add('months', 1);
    }
  };

  _buildPeriod = function (periodObj) {
    var freeOrNot = periodObj.type == 'full' ? 'Hired' : 'Free',
        period = $('<div class="time ' + periodObj.type + '"><span class="service-text">' + freeOrNot + '</span></div>'),
        periodLength = periodObj.duration * settings.pxPerMonth[mode] + (periodObj.duration - 1) * 4;

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
        timerangesContainer = $('.timeline .timeranges'),
        rowLength = 0,
        visibility = isVisible ? '' : 'hidden not-actual',
        oddEven = isOdd ? 'odd' : 'even';
        row = $('<div class="row ' + oddEven + ' ' + visibility + '"></div>'),
        spec = $('<div class="spec ' + oddEven + ' ' + visibility + '">' + _createCVWrap(timelineData.name) + '</div>');

    for(var i = 0; i < timelineData.dates.length; i++) {
      var periodObj = _buildPeriod(timelineData.dates[i]);

      rowLength += periodObj.length + 8;
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
    var linkText = $('.timeline .filtered a').html();
    $('.timeline .filtered a').html(linkText === 'Show all' ? 'Show available' : 'Show all');
  };

  _drawFilterControls = function() {
    if(notActualResources) {
      var filteredControls = $('<div class="filtered" />'),
          notAvailableMessage = notActualResources + (notActualResources > 1 ? ' resources are ' : ' resource is ') + 'not available soon';
      filteredControls.append($('<span>').html(notAvailableMessage))
                      .append($('<a href="javascript:void(0)">Show all</a>').click(_toggleResults));
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
          var monthsTillAvailable = Math.abs(timelineObj.dates[i].start.diff(moment(), 'months'));
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
          lastAssignmentEnded = void(0);

      resourceEntry.name = item.title['$t'];

      if(item.content['$t'] && item.content['$t'] != '') {
          dateRanges = item.content['$t'].split(':')[1].split(',');
      }
      else {
        lastAssignmentEnded = moment();
        resourceEntry.start = lastAssignmentEnded;
        resourceEntry.end = lastAssignmentEnded;
      }

      for(var i = 0; i < dateRanges.length; i++) {
        var dates = dateRanges[i].split('-'),
            begin, end, durationInMonths = 0,
            availabilityLine = {},
            now = moment(),
            durationFromNow = 0,
            durationTillNow = 0;

        begin = moment($.trim(dates[0]), timeFormat);
        end = moment($.trim(dates[1]), timeFormat);
        durationFromNow = end.diff(now, 'months');
        durationTillNow = now.diff(begin, 'months');

        if(resourceEntry.dates.length === 0) {
          var dateGap = begin.diff(now, 'months');

          if(dateGap > 0) {
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
      resourceEntry.end = lastAssignmentEnded;
      timelines.push(resourceEntry);
    });

    latestAssignment.add('months', settings.freeGapAtEnd[mode]);

    _drawScale();

    for(var i = 0; i < timelines.length; i++) {
      var emptySpace = Math.abs(latestAssignment.diff(timelines[i].end, 'months')),
          now = moment(),
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
    $(settings.kineticContainer[mode]).kinetic();

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