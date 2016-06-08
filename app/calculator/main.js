(function (w, d) {
  'use strict';

  var checkboxValue = 20;
  var formValidator = void (0);

  var values = {
    js: 4,
    consult: 0,
    frameworks: 0,
    professional: false,
    nodejs: false
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

    function onMouseStart() {
      changeListener(range, input)();
      range.addEventListener('mousemove', changeListener(range, input));
    }

    function onTouchStart() {
      changeListener(range, input)();
      range.addEventListener('touchmove', changeListener(range, input));
    }

    function onMouseEnd() {
      range.removeEventListener('mousemove', changeListener(range, input));
    }

    function onTouchEnd() {
      range.removeEventListener('touchmove', changeListener(range, input));
    }

    range.addEventListener('change', function() {
      onChange(range.value);
    }, false);

    range.addEventListener('mousedown', onMouseStart, false);
    range.addEventListener('touchstart', onTouchStart, false);

    range.addEventListener('mouseup', onMouseEnd, false);
    range.addEventListener('touchend', onTouchEnd, false);


    input.addEventListener('input', function() {
      changeListener(input, range)();
      onChange(input.value);
    }, false);
  }

  function Checkbox(selector, onChange) {
    var checkbox = document.getElementById(selector);
    var label = document.getElementById(selector + '-value');

    var updateValue = function() {
      var value = checkbox.checked ? checkboxValue : 0;
      onChange(value);
    };

    label.addEventListener('click', updateValue, false);
    checkbox.addEventListener('click', updateValue, false);
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
      hourlyRate += checkboxValue;
    }

    if (hasNode) {
      hourlyRate += checkboxValue;
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
    var bruttoSalary = calculateBruttoSalary(values.js, values.consult, values.frameworks, values.professional, values.nodejs);

    toggleForm(bruttoSalary);

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

  function resetForm() {
    formValidator && formValidator.resetForm();
    $('#email, #phone').val('');
    $('#send-calculator-details').prop('disabled', false);
  }

  function toggleForm(isEnabled) {
    var formWrap = $('.calculator');
    var form = $('.calculator-send-form');

    if (formWrap.hasClass('show-form')) {
      if (!isEnabled) {
        formWrap.removeClass('show-form');
      }
    }
    else {
      if (isEnabled) {
        resetForm();
        formWrap.addClass('show-form');
      }
    }
  }

  var js = new Range('js-years', update('js'));
  var consult = new Range('consult-years', update('consult'));
  var frameworks = new Range('frameworks-number', update('frameworks'));
  var professional = new Checkbox('professional', update('professional'));
  var nodejs = new Checkbox('nodejs', update('nodejs'));

  formValidator = $('#calculator-send-form').validate({
    focusInvalid: false,
    debug: true,
    rules: {
      email: {
        required: true,
        email: true
      },
      phone: {
        required: true,
        phoneSE: true
      }
    },
    messages: {
      email: 'Fyll i en giltig e-post adress', // 'Ange en giltig email address',
      phone: 'Fyll i ett giltigt telefonnummer'// 'Obligatoriskt f&auml;lt'
    },
    errorElement: 'em',
    errorPlacement: function (error, element) {
      error.addClass('help-block');
      error.insertBefore(element);
    },
    submitHandler: function () {
      $('#send-calculator-details').prop('disabled', true);
      $.ajax({
          type: 'POST',
          url: window.location.protocol + '//utvecklarbolaget.se/calculator.php',
          data: $('#calculator-send-form').serialize()
      })
      .done(function(response) {
        $('.calculator-send-form').addClass('data-sent');
      })
      .fail(function (data) {
          $('.calculator-send-form').addClass('data-sent-error');
          $('#send-calculator-details').prop('disabled', false);

          setTimeout(function () {
            $('.calculator-send-form').removeClass('data-sent-error');
          }, ERROR_HIDE_DELAY);
      });
    }
  })
})(window, document);
