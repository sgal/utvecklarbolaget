(function(w, d) {
  'use strict';

  var values = {
    js: 4,
    consult: 0,
    frameworks: 0,
    professional: false,
    node: false
  };

  function Range(selector, onChange) {
    var range = document.getElementById(selector);
    var input = document.getElementById(selector + '-value');

    function changeListener(from, to) {
      return function() {
        w.requestAnimationFrame(function() {
          to.value = from.value;
        });
      };
    }

    range.addEventListener('change', function() {
      onChange(range.value);
    }, false);

    range.addEventListener('mousedown', function() {
      changeListener(range, input)();
      range.addEventListener('mousemove', changeListener(range, input));
    }, false);

    range.addEventListener('mouseup', function() {
      range.removeEventListener('mousemove', changeListener(range, input));
    }, false);

    input.addEventListener('input', function() {
      changeListener(input, range)();
      onChange(input.value);
    }, false);

    this.range = range;
  }

  function calculateBruttoSalary(jsYears, consultYears, frameworksNumber, isProfessional, hasNode) {
    if (jsYears < 5 && !isProfessional) { return 0; }

    var hourlyRate = 750;
    var jsYearsToRate = [0, 25, 75, 125, 175, 200];

    // js years
    var jsValue = jsYears > 4 ? jsYears - 5 : 0;
    hourlyRate += jsYearsToRate[jsValue];

    // consultYears
    hourlyRate += consultYears * 5;

    // frameworks
    if (frameworksNumber > 0) {
      hourlyRate += (frameworksNumber + 1) * 10;
    }

    // professional
    if (isProfessional && jsYears > 4) {
      hourlyRate += 20;
    }

    if (hasNode) {
      hourlyRate += 20;
    }

    var workingDays = 20;
    var hoursPerDay = 8;
    var consultantShare = 0.6;
    var holidayShare = 0.12;
    var salaryShare = 0.23908081;

    var consultantCut = hourlyRate * workingDays * hoursPerDay * consultantShare;
    var cutWithoutHoliday = consultantCut * (1 - holidayShare);
    var bruttoSalary = cutWithoutHoliday * (1 - salaryShare);

    return bruttoSalary;
  }

  function updateCounter() {
    var bruttoSalary = calculateBruttoSalary(values.js, values.consult, values.frameworks, values.professional, values.node);

    var salaryArr = Math.round(bruttoSalary).toString().split('');

    var numbers = d.querySelectorAll('.numbers');
    for (var i = numbers.length - 1; i >= 0; i--) {
      numbers[i].querySelector('.n').className = 'n n-' + salaryArr.pop() || 0;
    }
  }

  function update(key) {
    return function(value) {
      values[key] = parseInt(value, 10);
      updateCounter();
    };
  }

  var js = new Range('js-years', update('js'));
  var consult = new Range('consult-years', update('consult'));
  var frameworks = new Range('frameworks-number', update('frameworks'));
})(window, document);
