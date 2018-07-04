/*!
 * Valida
 *
 * @copyright © 2011-2018, Rogerio Taques
 * @author Rogerio Taques (rogerio.taques@gmail.com)
 * @version 3.0.0
 * @license http://www.opensource.org/licenses/mit-license.php
 * @see https://github.com/rogeriotaques/valida
 * @cat Plugins/Form Validation
 */

(function fn() {
  const defaultOptions = {
    debug: false,
    novalidate: true,
    autocomplete: 'off',
    tag: 'span',
    highlightMarker: '( Optional )',
    highlightPosition: 'post',
    highlightOptional: true,
    triggerOnBlur: true,
    triggerOnTyping: true,
    i18n: {
      submit: 'Wait ...',
      required: 'Required',
      invalid: 'Seems to be invalid',
      maxlength: '<span class="at-counter">{0}</span> out of {1}.'
    },
    beforeValidation: null,
    afterValidation: null
  };

  const filters = {
    // name@domain.co[m[.br]]
    email: /^[\w!#$%&'*+/=?^`{|}~-]+(\.[\w!#$%&'*+/=?^`{|}~-]+)*@(([\w-]+\.)+[A-Za-z]{2,}|\[\d{1,3}(\.\d{1,3}){3}\])$/,

    // [http[s]://][www.]domain.co[m[.br]]
    url: /^(http[s]?:\/\/|ftp:\/\/)?(www\.)?(([\w-]+\.)+[A-Za-z]{2,}|\[\d{1,3}(\.\d{1,3}){3}\])$/,

    // 01234567
    number: /^([0-9])+$/,

    // [[0,]00]0.00 or [[0.]00]0,00 or 0000.00 or 0000,00 or 0
    decimal: /^([0-9]{0,3}(,|.){0,1}){0,2}[0-9]{1,3}(,[0-9]{2}|.[0-9]{2}){0,1}$/,

    // 00/00/0000
    date_br: /^([0-9]|[0,1,2][0-9]|3[0,1])\/(0[1-9]|1[0,1,2])\/\d{4}$/,

    // 0000-00-00
    date: /^\d{4}-(0[0-9]|1[0,1,2])-([0,1,2][0-9]|3[0,1])$/,

    // 00:00
    time: /^([0-1][0-9]|[2][0-3])(:([0-5][0-9])){1,2}$/,

    // [(]00[)] [9]0000-0000
    phone_br: /^\(?\d{2}\)?[\s-]?([9]){0,1}\d{4}-?\d{4}$/,

    // [[(]0]000[)] 00[00]-0000
    phone_jp: /^(((\(0\d{1}\)[\s-]?|0\d{1}-?)[2-9]\d{3}|(\(0\d{2}\)[\s-]?|0\d{2}-?)[2-9]\d{2,3}|(\(0\d{3}\)[\s-]?|0\d{3}-?)[2-9]\d{1}|(\(0\d{4}\)[\s-]?|0\d{4}-?)[2-9])-?\d{4}|(\(0\d{3}\)[\s-]?|0\d{3}-?)[2-9]\d{2}-?\d{3})$/,

    // A0B1C2
    zipcode_us: /^([A-Z][0-9]){3}$/,

    // 00[.]000-000
    zipcode_br: /^[0-9]{2}.{0,1}[0-9]{3}-[0-9]{3}$/,

    // 000-0000
    zipcode_jp: /^[0-9]{3}-?[0-9]{4}$/,

    // 0.0.0.0 ~ 255.255.255.255
    valid_ip: /^\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b$/,

    // Functional Filters
    min_length: (s, l) => s.length >= parseInt(l, 10),

    max_length: (s, l) => s.length <= parseInt(l, 10),

    matches: (a, b) => {
      const c = $(`#${b}`).val() || b;
      return a === c;
    },

    greater_than: (v, r) => {
      if (!filters.decimal.test(v) || !filters.decimal.test(r)) {
        return false;
      }

      return parseFloat(v) > parseFloat(r);
    },

    less_than: (v, r) => {
      if (!filters.decimal.test(v) || !filters.decimal.test(r)) {
        return false;
      }

      return parseFloat(v) < parseFloat(r);
    },

    cpf: (n) => {
      const patt = /^\d{3}.?\d{3}.?\d{3}-?\d{2}$/;

      // given number doesn't matches the expected pattern
      if (!patt.test(n)) {
        return false;
      }

      let i;
      let d1;

      let raw = n.replace(/[^0-9]/g, '');
      let same = true;

      // a valid id can't contain same number for each position
      for (i = 0; i < raw.length - 1; i += 1) {
        if (raw.charAt(i) !== raw.charAt(i + 1)) {
          same = false;
          break;
        }
      }

      if (same) {
        return false;
      }

      // split necessary values for validation
      const dv = raw.substr(9, 2);
      raw = raw.substr(0, 9);
      d1 = 0;

      // calculate the first verification digit
      for (i = 0; i < 9; i += 1) {
        d1 += raw.charAt(i) * (10 - i);
      }

      // first digit can't be zero
      if (d1 === 0) {
        return false;
      }

      // get mode of dv
      d1 = 11 - (d1 % 11);

      // whenever it's bigger than 9, should becomes 0
      if (d1 > 9) {
        d1 = 0;
      }

      // is given dv valid?
      if (parseInt(dv.charAt(0), 10) !== parseInt(d1, 10)) {
        return false;
      }

      // second dv is double of first
      d1 *= 2;

      // calculates its ratio
      for (i = 0; i < 9; i += 1) {
        d1 += raw.charAt(i) * (11 - i);
      }

      // get second db mode
      d1 = 11 - (d1 % 11);

      // whenever second dv is bigger than 9, should become 0
      if (d1 > 9) {
        d1 = 0;
      }

      // is second dv valid?
      if (parseInt(dv.charAt(1), 10) !== parseInt(d1, 10)) {
        return false;
      }

      // wow, given id is valid.
      return true;
    },

    cnpj: (n) => {
      const patt = /^\d{1,2}.?\d{3}.?\d{3}\/?\d{4}-?\d{2}$/;

      // is given id matching the expected pattern
      if (!patt.test(n)) {
        return false;
      }

      let i;
      let raw;
      let dv;
      let sum;
      let res;
      let pos;
      let size;
      let original;
      let same;

      // get raw number (without separators)
      raw = n.replace(/[^0-9]/g, '');
      same = true;

      // a valid id can't contain same number for each position
      for (i = 0; i < raw.length - 1; i += 1) {
        if (raw.charAt(i) !== raw.charAt(i + 1)) {
          same = false;
          break;
        }
      }

      if (same) {
        return false;
      }

      // gather splitted values
      /* eslint-disable */
      original = raw;
      size = raw.length - 2;
      dv = raw.substr(size, 2);
      raw = raw.substr(0, size);
      sum = 0;
      pos = size - 7;
      /* eslint-enable */

      // calculate first verification digit
      for (i = size; i >= 1; i -= 1) {
        // eslint-disable-next-line no-plusplus
        sum += raw.charAt(size - i) * pos--;

        if (pos < 2) {
          pos = 9;
        }
      }

      // get dv mod
      res = sum % 11 < 2 ? 0 : 11 - (sum % 11);

      // is given first dv valid?
      if (res.toString() !== dv.charAt(0)) {
        return false;
      }

      // gather updated splitted values
      size += 1;
      raw = original.substr(0, size);
      sum = 0;
      pos = size - 7;

      // calculate second digit
      for (i = size; i >= 1; i -= 1) {
        // eslint-disable-next-line no-plusplus
        sum += raw.charAt(size - i) * pos--;

        if (pos < 2) {
          pos = 9;
        }
      }

      // get dv mod
      res = sum % 11 < 2 ? 0 : 11 - (sum % 11);

      // is given second dv valid?
      if (res.toString() !== dv.charAt(1)) {
        return false;
      }

      // all good ...
      return true;
    }
  }; // filters

  const masks = {
    date: 'XXXX-XX-XX',
    postalcode: 'XXX-XXXX',
    cpf: 'XXX.XXX.XXX-XX',
    cnpj: 'XX.XXX.XXX/XXXX-XX'
  };

  const methods = {
    init: function init(options = {}) {
      let f; // The form instance

      const o = $.extend({}, defaultOptions, options);

      const classesToRemove = [
        '.at-required',
        '.at-invalid',
        '.at-valid',
        '.has-warning',
        '.has-feedback'
      ];

      const elementsToRemove = ['.at-error', '.at-warning', '.at-info'];

      const applyMask = (event) => {
        const elem = $(event.currentTarget);

        const mask =
          masks[elem.attr('data-mask') || elem.attr('mask')] ||
          (elem.attr('data-mask') || elem.attr('mask')) ||
          '';

        const s = elem.val().replace(/[^a-zA-Z0-9]/g, '');

        let r = '';

        for (let im = 0, is = 0; im < mask.length && is < s.length; im += 1) {
          // eslint-disable-next-line no-plusplus
          r += mask.charAt(im) === 'X' ? s.charAt(is++) : mask.charAt(im);
        }

        elem.val(r);

        return r;
      };

      /**
       * Remove validation error messages
       * @param {jQueryHTMLFormElement} target
       */
      const clearAllErrors = function clear(target) {
        target.find(elementsToRemove.join(',')).remove();

        target
          .find(classesToRemove.join(','))
          .removeClass(
            classesToRemove.map((cls) => cls.replace(/^./, '')).join(' ')
          );

        if (o.debug) {
          console.log('[Valida] All errors cleared.');
        }
      }; // clearAllErrors

      /**
       * Remove the validation messages from given element.
       * @param {jQueryHTMLElement} el
       */
      const clearError = function clear(el) {
        el.removeClass(
          classesToRemove.map((cls) => cls.replace(/^./, '')).join(' ')
        );

        el.prev(elementsToRemove.join(',')).remove();
        el.next(elementsToRemove.join(',')).remove();

        if (el.attr('type') === 'checkbox') {
          el.next('label')
            .next(elementsToRemove.join(','))
            .remove();
        }
      }; // clearError

      const placeValidMessage = function pvm(elem) {
        // const place = elem.attr('data-placement') || 'after';
        clearError(elem);

        elem.addClass('at-valid');

        if (o.debug) {
          console.log(
            '[Valida] ',
            `#${f.attr('id')}#${elem.attr('id')}`,
            'is valid'
          );
        }
      }; // placeValidMessage

      /**
       * Shows the 'warning', compatible with boostrap
       */
      const placeInvalidMessage = function pim(elem) {
        const msg =
          elem.attr('data-invalid') ||
          (o.i18n.invalid ? o.i18n.invalid : 'Invalid format');

        const place = elem.attr('data-placement') || 'after';

        const tag =
          !o.tag || typeof o.tag === 'string'
            ? $(`<${o.tag ? o.tag : 'span'} />`, {
                class: 'at-error',
                html: msg
              })
            : o.tag;

        clearError(elem);

        elem
          .addClass('at-invalid')
          .closest('.form-group')
          .addClass('has-warning has-feedback');

        if (elem.attr('type') !== 'checkbox') {
          if (place === 'before') {
            elem.before(tag);
          } else {
            elem.after(tag);
          }
        } else {
          elem.parent('label').after(tag);
        }

        if (o.debug) {
          console.log(
            '[Valida] ',
            `#${f.attr('id')}#${elem.attr('id')}`,
            'is invalid'
          );
        }
      }; // placeInvalidMessage

      const placeRequiredMessage = function pem(elem) {
        const msg =
          elem.attr('data-required') ||
          (o.i18n.required ? o.i18n.required : 'Required');

        const place = elem.attr('data-placement') || 'after';

        const tag =
          !o.tag || typeof o.tag === 'string'
            ? $(`<${o.tag ? o.tag : 'span'} />`, {
                class: 'at-error',
                html: msg
              })
            : o.tag;

        clearError(elem);

        elem
          .addClass('at-required')
          .closest('.form-group')
          .addClass('has-error has-feedback');

        if (elem.attr('type') !== 'checkbox') {
          if (place === 'before') {
            elem.before(tag);
          } else {
            elem.after(tag);
          }
        } else {
          elem.next('label').after(tag);
        }

        if (o.debug) {
          console.log(
            '[Valida] ',
            `#${f.attr('id')}#${elem.attr('id')}`,
            'is mandatory'
          );
        }
      }; // placeRequiredMessage

      /**
       * Test element values against given filters
       * @param {jQueryHTMLElement} elem
       * @param {string} filter
       */
      const filterValidation = function fv(elem, filter) {
        const list = filter.indexOf('|') !== -1 ? filter.split('|') : [filter];

        let error = false;

        list.forEach(function listPatt(patt) {
          let pattern = patt;

          if (typeof pattern !== 'undefined' && pattern.indexOf(':') !== -1) {
            pattern = pattern.split(':');

            if (
              elem.val() !== '' &&
              typeof filters[pattern[0]] !== 'undefined'
            ) {
              if (!error) {
                const $fn = filters[pattern[0]];
                const $rf = f.find(`#${pattern[1]}`).length
                  ? f.find(`#${pattern[1]}`).val()
                  : pattern[1];

                error = !$fn(elem.val(), $rf);
              }
            }
          } else {
            pattern = filters[pattern] || /^(\w|\d)+/;

            if (elem.val() !== '') {
              if ($.isFunction(pattern)) {
                error = !pattern(elem.val());
              } else {
                error = elem.val() !== '' && !pattern.test(elem.val());
              }
            }
          }
        });

        return !error;
      }; // filterValidation

      /**
       * Define some elements that might be ignored when validating.
       */
      const shouldIgnoreThis = function ignore(el) {
        const toIgnore = ['submit', 'reset', 'button', 'image'];

        if (!el.is('input') && !el.is('textarea') && !el.is('select')) {
          return true;
        }

        return $.inArray(el.prop('type'), toIgnore) !== -1;
      }; // shouldIgnoreThis

      /**
       * When a reset button is pressed
       */
      const resetCallback = function reset() {
        $(this)
          .off('click.valida')
          .on('click.valida', function click() {
            clearAllErrors(f);

            f.find('input, select, textarea')
              .filter(':first')
              .focus();
          }); // click
      }; // resetCallback

      /**
       * Checks is a required select element is filled
       * @param {jQueryHTMLSelectElement} elem
       * @return boolean
       */
      const isSelectValid = function isv(elem) {
        return elem.find('option').length === 0 || elem.val() === '';
      }; // isSelectValid

      /**
       * Called when the focus is lost on required elements.
       * @param {window.Event} event
       */
      const onBlurValidation = function b(event) {
        const elem = $(event.currentTarget);

        if (
          (elem.is('select') && isSelectValid(elem)) ||
          (elem.is('textarea') && elem.val() === '') ||
          (elem.is('[type="checkbox"]') &&
            (!elem.is(':checked') || elem.val() === '')) ||
          (elem.is('input') && elem.val() === '')
        ) {
          placeRequiredMessage(elem);
        }
      }; // onBlurValidation

      /**
       * Called when element value changes
       * @param {window.Event} event
       */
      const onValueChange = function change(event) {
        const elem = $(event.currentTarget);

        if (elem.attr('type') !== 'checkbox' && elem.val() !== '') {
          if (
            filterValidation(
              elem,
              elem.attr('data-filter') || elem.attr('filter') || ''
            )
          ) {
            clearError(elem);
          }
        }
      }; // onValueChange

      /**
       * Called when user types on validatable elements
       * @param {window.Event} event
       */
      const onTypingValidation = function otv(event) {
        const elem = $(event.currentTarget);
        const filter = elem.attr('data-filter') || elem.attr('filter') || '';
        const isFilterValid = filterValidation(elem, filter);

        if (filter && isFilterValid) {
          placeValidMessage(elem);

          if (o.debug) {
            console.log(
              '[Valida]',
              `#${f.attr('id')}#${elem.attr('id')}`,
              'filter is valid'
            );
          }
        } else if (filter && !isFilterValid && elem.val() !== '') {
          placeInvalidMessage(elem);

          if (o.debug) {
            console.log(
              '[Valida]',
              `#${f.attr('id')}#${elem.attr('id')}`,
              'filter is invalid'
            );
          }
        } else {
          clearError(elem);
        }
      }; // onTypingValidation

      /**
       * Run the validation against given elements.
       * @param {string|jQueryHTMLFormElement} el
       * @param {boolean} showError
       * @param {boolean} forceClear
       * @param {boolean} prevState
       *
       * @return boolean - true when everything goes alright and false when there are errors
       */
      const partialValidation = function pv(
        elem,
        showError = true,
        forceClear = true,
        prevState = false
      ) {
        const el = typeof elem === 'object' ? elem : $(elem);
        let err = prevState === undefined ? false : prevState;

        if (forceClear) {
          clearError(el); // reset previous error messages ...
        }

        // sometimes needs to ignore ...
        if (!el.length || shouldIgnoreThis(el)) {
          return !err;
        } // ignore

        if (el.is('[required]')) {
          if (
            (el.is('select') && isSelectValid(el)) ||
            (el.attr('type') === 'checkbox' && !el.is(':checked')) ||
            el.val() === ''
          ) {
            err = true;

            if (showError) {
              placeRequiredMessage(el);
            }
          } // empty
        } // required

        if (
          !el.is('[required]') &&
          (el.attr('data-filter') || el.attr('filter')) &&
          !filterValidation(el, el.attr('data-filter') || el.attr('filter'))
        ) {
          err = true;

          if (showError) {
            placeInvalidMessage(el);
          }
        }

        return !err;
      }; // partialValidation

      return this.each(function instance() {
        f = $(this);

        if (o.debug) {
          console.log('[Valida] Instance #', this.id);
        }

        f.data('old-autocomplete', f.attr('autocomplete'));
        f.data('old-novalidate', f.attr('novalidate'));

        // Set options
        f.attr('autocomplete', o.autocomplete || 'off');
        f.attr('novalidate', o.novalidate || 'novalidate');

        // Reset buttons
        f.find('[type=reset]').each(resetCallback); // reset buttons

        // Find elements to be validated
        f.find('input, select, textarea').each(function el(i, elFound) {
          const elem = $(elFound);

          const placeMarker = function pm(lbl) {
            const marker = `<span class="at-optional-highlight" > ${
              o.highlightMarker
            }</span>`;

            if (o.highlightPosition === 'pre') {
              return `${marker} <span >${lbl}</span>`;
            }

            return `<span >${lbl}</span> ${marker}`;
          };

          let elemType;

          switch (true) {
            case elem.is('select'):
              elemType = 'select';
              break;

            case elem.is('textarea'):
              elemType = 'textarea';
              break;

            default:
              elemType = elem.attr('type');
              break;
          }

          // When element should be ignored
          if (shouldIgnoreThis(elem)) {
            return;
          }

          if (o.debug) {
            console.log(
              '[Valida] :: Found: ',
              `#${elem.attr('id')}`,
              `( ${elemType} )`,
              `${elem.is('[required]') ? 'required' : 'optional'}`
            );
          }

          // When element has a obvious filter type
          if ($.inArray(elem.attr('type'), ['email', 'url', 'number']) !== -1) {
            elem.attr('data-filter', elem.attr('type'));
          }

          // When element should be marked
          if (o.highlightOptional && !elem.is('[required]')) {
            f.find(`[for="${elem.attr('id')}"]`).html(
              placeMarker(f.find(`[for="${elem.attr('id')}"]`).html())
            );
          } else if (!o.highlightOptional && elem.is('[required]')) {
            f.find(`[for="${elem.attr('id')}"]`).html(
              placeMarker(f.find(`[for="${elem.attr('id')}"]`).html())
            );
          }

          // When need to validate on blur
          if (o.triggerOnBlur && elem.is('[required]')) {
            if (elem.attr('type') === 'checkbox') {
              elem.off('click.valida').on('click.valida', function occ() {
                clearError(elem);

                if (!elem.is(':checked')) {
                  placeRequiredMessage(elem);
                }
              });
            } else {
              elem.off('blur.valida').on('blur.valida', onBlurValidation);
            }
          }

          // When need to validate on typing
          if (o.triggerOnTyping && !elem.is('textarea')) {
            elem
              .off('keyup.valida keydown.valida')
              .on('keyup.valida keydown.valida', onTypingValidation);
          }

          // When a textarea has the maxlength set
          if (elem.is('textarea') && elem.attr('maxlength')) {
            elem.after(
              $('<div />', {
                class: 'at-description',
                html: (
                  elem.attr('data-help') ||
                  (o.i18n.maxlength
                    ? o.i18n.maxlength
                    : '<span class="at-counter">{0}</span> out of {1}')
                )
                  .replace('{1}', elem.attr('maxlength'))
                  .replace('{0}', elem.val().length)
              })
            );

            elem
              .off('keyup.valida keydown.valida')
              .on('keyup.valida keydown.valida', function kc(ev) {
                if (elem.val().length > elem.attr('maxlength')) {
                  ev.preventDefault();
                  return;
                }

                elem
                  .parent()
                  .find('.at-description > .at-counter')
                  .html(elem.val().length);
              });
          }

          // When element should use mask
          if (elem.attr('data-mask') || elem.attr('mask')) {
            // Apply the mask while typing
            elem.on('keyup.valida keydown.valida', applyMask);

            // Make sure the field maxlength matches the mask length
            elem.attr(
              'maxlength',
              (
                masks[elem.attr('data-mask') || elem.attr('mask')] ||
                (elem.attr('data-mask') || elem.attr('mask'))
              ).length
            );
          }

          // When the value changes in a validatable element
          elem.off('change.valida').on('change.valida', onValueChange);
        }); // elements

        // When form is submitted
        f.off('submit.valida').on('submit.valida', function ofs(submitEvent) {
          let error = false;

          clearAllErrors(f);

          if (o.beforeValidation && $.isFunction(o.beforeValidation)) {
            error = !o.beforeValidation.apply(this, submitEvent);
          }

          // Prevent double clicks
          f.find('[type="submit"]').each(function eachSubmit(i, submitElem) {
            const el = $(submitElem);

            el.prop('disabled', true);

            if (el.is('input')) {
              el.attr('data-old-value', el.val()).val(
                el.attr('data-submit') ||
                  (o.i18n && o.i18n.submit ? o.i18n.submit : 'Wait ...')
              );
            } else {
              el.attr('data-old-value', el.text()).text(
                el.attr('data-submit') ||
                  (o.i18n && o.i18n.submit ? o.i18n.submit : 'Wait ...')
              );
            }
          });

          // Run the validation against the required elements
          f.find('input, select, textarea').each(function eachElement(
            i,
            requiredElem
          ) {
            const elemForValidation = $(requiredElem);
            error = !partialValidation(elemForValidation, true, false, error);
          }); // required elements

          if (o.afterValidation && $.isFunction(o.afterValidation)) {
            error = !o.afterValidation.apply(this, submitEvent, error);
          }

          if (error) {
            submitEvent.preventDefault();

            // Re-enable submit buttons
            f.find('[type="submit"]').each(function eachSubmit(i, submitElem) {
              const el = $(submitElem);

              el.prop('disabled', false);

              if (el.is('input')) {
                el.val(el.attr('data-old-value'));
              } else {
                el.text(el.attr('data-old-value'));
              }
            });
          }
        });
      });
    }
  };

  $.fn.valida = function valida(method) {
    if (methods[method]) {
      return methods[method].apply(
        this,
        // eslint-disable-next-line prefer-rest-params
        Array.prototype.slice.call(arguments, 1)
      );
    }

    if (typeof method === 'object' || !method) {
      // eslint-disable-next-line prefer-rest-params
      return methods.init.apply(this, arguments);
    }

    $.error(`Method "${method}" does not exist on $.valida().`);
    return false;
  };
})();
