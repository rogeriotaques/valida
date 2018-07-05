/**!
	* Valida - jQuery plugin to validate forms in a as simple as possible way.
	* Copyright (c) 2011-2013, Rogério Taques.
	*
	* Licensed under MIT license:
	* http://www.opensource.org/licenses/mit-license.php
	*
	* Permission is hereby granted, free of charge, to any person obtaining a copy of this
	* software and associated documentation files (the "Software"), to deal in the Software
	* without restriction, including without limitation the rights to use, copy, modify, merge,
	* publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
	* to whom the Software is furnished to do so, subject to the following conditions:
	*
	* The above copyright notice and this permission notice shall be included in all copies or
	* substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	* BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*
	* @requires jQuery v1.9 or above
	* @version 2.1.7
	* @cat Plugins/Form Validation
	* @author Rogério Taques (rogerio.taques@gmail.com)
	* @see https://github.com/rogeriotaques/valida
	*
	* Contributors:
	* - Kosuke Hiraga (hiraga@brijcs.co.jp)
	*/

/**
	* CHANGELOG
	*
	* 2.1  Added the cappability of highlight required fields.
	*      Scrolling animation till the first field with error or invalid.
	*      Minor bugs fixes.
	*      Fixed a bug of initialiser syntaxes within numeration in strict mode. (A special thanks to Fernando Goya).
	*      Fixed a bug on regular expression to make allowed address with longer top level domains, such as: something.careers, something.website, etc.
	*			 Added a filter for CPF validation (a brazilian nationwide people registration ID)
	*			 Added a filter for CNPJ validation (a brazilian nationwide enterprise registration ID)
	*
	* 2.0 First release. Entirely rewritten to become lighweight and to provide support for bootstrap.
	* 		Some improvements in filters (url and phone_br) and callbacks (after and before validations). Special thanks for Kosuke Hiraga.
	* 		Minor bugs caused by rewritten were fixed.
	* 		The 'destroy' method was included.
	* 		Defined a namespace for all plugin.
	*     The 'partial' method was included.
	*/

(function ( $ ) {

	"use strict";

	var version = '2.1.7',

	// default options
	defaults = {

		// basic settings
		form_validate: 'novalidate',	// when 'novalidate' form will not be validated by browser
		form_autocomplete: 'off',		// when 'off' default browser autocomplete will be switched off
		tag: 'p',						// the html tag that will be used to display errors
		lost_focus: true,				// when true, validation will be applied when field loose focus.

		// highlight settings
		highlight: {                    // object/ null. when null do not highlight.
			marker: '*',                // the flag marker
			position: 'post'            // pre or post. where the marker will be placed.
		},

		// default messages
		messages: {
			// when a submit button is clicked
			submit: 'Wait ...',
			// when there is a required field unfilled
			required: 'Required field',
			// when there is a invalid value for a filtered field
			invalid: 'Field with invalid data',
			// when there is textareas with maxlength set
			textarea_help: 'Typed <span class="at-counter">{0}</span> of {1}'
		},

		// filters
		use_filter: true,		// defines that filters will be validated

		// callbacks
		before_validate: null,	// callback which runs before default validation
		after_validate: null	// callback which runs after default validation

	},

	// available filters
	filters = {
		// name@domain.co[m[.br]]
		'email' : /^[\w!#$%&'*+\/=?^`{|}~-]+(\.[\w!#$%&'*+\/=?^`{|}~-]+)*@(([\w-]+\.)+[A-Za-z]{2,}|\[\d{1,3}(\.\d{1,3}){3}\])$/,
		// [http[s]://][www.]domain.co[m[.br]]
		'url' : /^(http[s]?:\/\/|ftp:\/\/)?(www\.)?(([\w-]+\.)+[A-Za-z]{2,}|\[\d{1,3}(\.\d{1,3}){3}\])$/,
		// 01234567
		'number' : /^([0-9])+$/,
		// [[0,]00]0.00 or [[0.]00]0,00 or 0000.00 or 0000,00 or 0
		'decimal' : /^([0-9]{0,3}(\,|\.){0,1}){0,2}[0-9]{1,3}(\,[0-9]{2}|\.[0-9]{2}){0,1}$/,
		// 00/00/0000
		'date_br' : /^([0-9]|[0,1,2][0-9]|3[0,1])\/(0[1-9]|1[0,1,2])\/\d{4}$/,
		// 0000-00-00
		'date' : /^\d{4}-(0[0-9]|1[0,1,2])-([0,1,2][0-9]|3[0,1])$/,
		// 00:00
		'time' : /^([0-1][0-9]|[2][0-3])(:([0-5][0-9])){1,2}$/,
		// [(]00[)] [9]0000-0000
		'phone_br' : /^\(?\d{2}\)?[\s-]?([9]){0,1}\d{4}-?\d{4}$/,
		// [[(]0]000[)] 00[00]-0000
		'phone_jp' : /^(((\(0\d{1}\)[\s-]?|0\d{1}-?)[2-9]\d{3}|(\(0\d{2}\)[\s-]?|0\d{2}-?)[2-9]\d{2,3}|(\(0\d{3}\)[\s-]?|0\d{3}-?)[2-9]\d{1}|(\(0\d{4}\)[\s-]?|0\d{4}-?)[2-9])-?\d{4}|(\(0\d{3}\)[\s-]?|0\d{3}-?)[2-9]\d{2}-?\d{3})$/,
		// A0B1C2
		'zipcode_us' : /^([A-Z][0-9]){3}$/,
		// 00[.]000-000
		'zipcode_br' : /^[0-9]{2}\.{0,1}[0-9]{3}\-[0-9]{3}$/,
		// 000-0000
		'zipcode_jp' : /^[0-9]{3}\-?[0-9]{4}$/,
		// 0.0.0.0 ~ 255.255.255.255
		'valid_ip' : /^\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b$/,

		// Functional Filters
		'min_length' : function(s, l) { return (s.length >= l); },
		'max_length' : function(s, l) { return (s.length <= l); },

		'cpf' : function ( n ) {
			var patt = /\d{3}.\d{3}.\d{3}-\d{2}/;

			// given number doesn't matches the expected pattern 
			if (!patt.test(n)) {
				return false;
			}

			var i, raw, dv, d1, same;

			raw  = n.replace(/(\.|\-)/g, '');
			same = true;

			// a valid id can't contain same number for each position
			for (i = 0; i < raw.length - 1; i++) {
				if (raw.charAt(i) != raw.charAt(i + 1)) {
					same = false;
					break;
				}
			}

			if (same) {
				return false;
			}

			// split necessary values for validation 
			dv  = raw.substr(9,2);
			raw = raw.substr(0,9);
			d1  = 0;

			// calculate the first verification digit
			for (i = 0; i < 9; i++) {
				d1 += raw.charAt(i)*(10-i);
			}

			// first digit can't be zero
			if (d1 == 0) {
				return false;
			}

			// get mode of dv
			d1 = 11 - (d1 % 11);

			// whenever it's bigger than 9, should becomes 0
			if (d1 > 9) {
				d1 = 0;
			}

			// is given dv valid?
			if (dv.charAt(0) != d1) {
				return false;
			}
	
			// second dv is double of first 
			d1 *= 2;

			// calculates its ratio 
			for (i = 0; i < 9; i++) {
				d1 += raw.charAt(i)*(11-i);
			}

			// get second db mode 
			d1 = 11 - (d1 % 11);

			// whenever second dv is bigger than 9, should become 0
			if (d1 > 9) {
				d1 = 0;
			}
			
			// is second dv valid?
			if (dv.charAt(1) != d1) {
				return false;
			}
			
			// wow, given id is valid.
			return true;
		},

		'cnpj' : function ( n ) {
			var patt = /\d{1,2}.\d{3}.\d{3}\/\d{4}-\d{2}/;

			// is given id matching the expected pattern
			if (!patt.test(n)) {
				return false;
			}

			var i, raw, dv, sum, res, pos, size, original, same;

			// get raw number (without separators)
			raw = n.replace(/(\.|\/|\-)/g, '');
			same = true;

			// a valid id can't contain same number for each position
			for (i = 0; i < raw.length - 1; i++) {
				if (raw.charAt(i) != raw.charAt(i + 1)) {
					same = false;
					break;
				}
			}

			if (same) {
				return false;
			}

			// gather splitted values 
			original = raw;
			size = raw.length - 2;
			dv   = raw.substr(size, 2);
			raw  = raw.substr(0, size);
			sum  = 0;
			pos  = size - 7; 

			// calculate first verification digit 
			for (i = size; i >= 1; i--) {
				sum += raw.charAt(size - i) * pos--;
				
				if (pos < 2) {
					pos = 9;
				}
			}

			// get dv mod 
			res = sum % 11 < 2 ? 0 : 11 - sum % 11;

			// is given first dv valid?
			if (res != dv.charAt(0)) {
				return false;
			}

			// gather updated splitted values 
			size = size + 1;
			raw  = original.substr(0, size);
			sum  = 0;
			pos  = size - 7;

			// calculate second digit 
			for (i = size; i >= 1; i--) {
				sum += raw.charAt(size - i) * pos--;

				if (pos < 2) {
					pos = 9;
				}
			}			

			// get dv mod 
			res = sum % 11 < 2 ? 0 : 11 - sum % 11;

			// is given second dv valid?
			if (res != dv.charAt(1)) {
				return false;
			}

			// all good ...
			return true;
		},

		'matches' : function(a, b) {

			try {
				b = ( $('#'+b).val() || b );
			} catch(e) {}

			return (a == b);
		},

		'greater_than' : function(v, r) {
			if ( !v.match(filters['number']) || !r.match(filters['number']) ) return false;
			return (parseInt(v, 10) > parseInt(r, 10));
		},
		'less_than' : function(v, r) {
			if ( !v.match(filters['number']) || !r.match(filters['number']) ) return false;
			return (parseInt(v, 10) < parseInt(r, 10));
		}

	}, // filters

	// define extended 'options' globally
	o = {},

	methods = {

		/**
		* Retrieve plugin's version
		*/
		version: function()
		{
			return this.each(function()
			{
				$(this).html(version);
			});
		},

		/**
		* Here is the magic ...
		*/
		init: function(options)
		{
			o = $.extend({}, defaults, options);

			return this.each( function()
			{
				var f = $(this),		// form
				err = false;		// error

				// register original settings, in case of destroy ...
				f.data('old-autocomplete', f.attr('autocomplete'));
				f.data('old-novalidate', f.attr('novalidate'));

				// set options
				f.attr('autocomplete', (o.autocomplete || o.form_autocomplete ? (o.autocomplete || o.form_autocomplete) : 'off'));
				f.attr('novalidate', (o.novalidate || o.form_novalidate ? (o.novalidate || o.form_novalidate) : 'novalidate'));

				// find reset buttons and adjust its behavior
				f.find('button[type=reset], input[type=reset]').each(function(i, el)
				{
					$(el).on('click.valida', function(e)
					{
						_clear_all();
						$('input, select, textarea').filter(':first').focus();

					}); // click

				}); // reset buttons

				// find elements that can be validated ...
				f.find('input, select, textarea').each(function(i, el)
				{
					el = $(el);

					// sometimes needs to ignore ...
					if ( _ignore_this_element(el) )
					{

						return;

					} // ignore

					// place the highlight marker
					if ( el.is('[required]') && o.highlight !== null && o.highlight !== false )
					{

						$('[for=' + el.attr('id') + ']').html(
							( o.highlight.position == 'pre' ?
							'<span class="at-required-highlight" >' + o.highlight.marker + '</span>&nbsp;' + $('[for=' + el.attr('id') + ']').html() :
							$('[for=' + el.attr('id') + ']').html() + '&nbsp;<span class="at-required-highlight" >' + o.highlight.marker + '</span>'
						)
					);

				} // el.is('[required]') && o.highlight !== null && o.highlight !== false

				// set a handler for 'lost focus'
				if (o.lost_focus)
				{

					el.on('blur.valida', function(e)
					{
						// required fields
						if ( (el.is('select') && el.is('[required]') && (el.find('option').filter(':selected').val() === '' || !el.find('option').length)) ||
						(el.is('textarea') && el.is('[required]') && el.val() === '') ||
						(el.is('input') && el.prop('type') === 'checkbox' && el.is('[required]') && !el.is(':checked')) ||
						(el.is('input') && el.prop('type') !== 'checkbox' && el.is('[required]') && el.val() === '') )
						{
							_show_error(el, el.is('[type=checkbox]'));

						} // empty, unselected or unchecked fields

					}); // blur

				} // if (o.lost_focus)

				// if textarea with maxlenth set ...
				if ( el.is('textarea') && el.attr('maxlength') )
				{

					el.after( $('<div />', {
						'class': 'help-block at-description',
						'html' : ( el.data('help') || (o.messages.textarea_help ? o.messages.textarea_help : 'Typed <span class="at-counter">{0}</span> of {1}') ).replace('{1}', el.attr('maxlength')).replace('{0}', el.val().length)
					}) );

					el.on('keyup.valida', function(e)
					{
						_char_count(e, el, el.attr('maxlength'));
					}).on('keydown.valida', function(e)
					{
						_char_count(e, el, el.attr('maxlength'));
					});

				} // textarea with maxlength

				// handler for select on change ...
				el.on('change.valida', function(e)
				{

					if ( el.val() !== '' && el.is('select') )
					{
						_clear(el);
					}

				});

				// set a handler for checkbox on change ...
				if ( el.is('input') && el.prop('type') === 'checkbox' && el.is('[required]') )
				{

					el.on('click.valida', function(e)
					{
						_clear(el);

						if (!el.is(':checked'))
						{
							_show_error(el, el.is('[type=checkbox]'));
						}

					});

				} // dropdown && required

				else
				{
					// set handler for typing
					el.on('keyup.valida', function(e)
					{
						if (el.val() !== '')
						{
							_typing_handler(el);
						}

					}).on('keydown.valida', function(e)
					{
						_typing_handler(el);

					});
				}

			}); // elements

			// when submit, than really validates
			f.on('submit.valida', function( e )
			{
				var err = false;

				_clear_all();

				// callback for 'before validation'
				if (o.before_validate && $.isFunction(o.before_validate))
				{
					// before_validate is expected to return
					// true when everything goes alright and false when there are errors.
					err = !o.before_validate(e);
				}

				// avoid double clicks, because unicorns exists ...
				f.find('button[type=submit], input[type=submit]').each(function(i, el)
				{
					el = $(el);
					el.prop('disabled', true).data('old-value', (el.is('input') ? el.val() : el.html()));

					if (el.is('input'))
					{
						el.val(o.messages.submit || 'Wait ...');
					}
					else
					{
						el.html(o.messages.submit || 'Wait ...');
					}
				});

				// get required elements
				f.find('input, select, textarea').each(function(i, el)
				{
					el  = $(el);
					err = !_partial_validation( el, true, false, err );
				}); // required elements

				// callback for 'after validation'
				if (o.after_validate && $.isFunction(o.after_validate))
				{
					// after_validate is expected to return
					// true when everything goes alright and false when there are errors.
					err = !o.after_validate(e, err);
				}

				if (err)
				{
					// take control and avoid goes on ...
					e.preventDefault();

					// reenable submit buttons ...
					f.find('button[type=submit], input[type=submit]').each(function(i, el)
					{
						el = $(el);
						el.prop('disabled', false);

						if (el.is('input'))
						{
							el.val(el.data('old-value'));
						}
						else
						{
							el.html(el.data('old-value'));
						}
					});

					// calc the middle position on window
					var wmid = Math.ceil($(window).height() / 2);

					if ( $('.at-required:visible, .at-invalid:visible').length > 0 )
					{

						// let's meet the first field with error ...
						$('html,body').animate({
							'scrollTop': $('.at-required:visible, .at-invalid:visible').filter(':first').offset().top - wmid
						}, 'fast', function(ev) {
							$('.at-required:visible, .at-invalid:visible').filter(':first').focus();
						});

					}

					return false;

				} // err

			}); // submit

		}); // each form

	}, // init

	/**
	* Destroy the object
	*/
	destroy: function()
	{
		var f = $(this);

		// restore original form attributes
		f.attr('autocomplete', f.data('old-autocomplete'));
		f.attr('novalidate', f.data('old-novalidate'));

		// unbind all for reset buttons
		f.find('button, input[type=reset]').off('valida');
		f.find('button, input[type=reset]').unbind('.valida');

		// unbind all form fields
		f.find('input, select, textarea').off('valida');
		f.find('input, select, textarea').unbind('.valida');

		// remove content limited textareas' help text.
		f.find('.help-block.at-description').remove();

		// and finally unbind all for the form ...
		f.off('valida');
		f.unbind('.valida');

		f.valida = null;

	}, // destroy

	/**
	* A public method of partial validation
	*/
	partial: function( el, show_error, force_clear )
	{

		var err = _partial_validation( el, show_error, force_clear );

		if (err)
		{
			// calc the middle position on window
			var wmid = Math.ceil($(window).height() / 2);

			if ( $('.at-required:visible, .at-invalid:visible').length > 1 )
			{

				// let's meet the first field with error ...
				$('html,body').animate({
					'scrollTop': $('.at-required:visible, .at-invalid:visible').filter(':first').offset().top - wmid
				}, 'fast', function(ev) {
					$('.at-required:visible, .at-invalid:visible').filter(':first').focus();
				});

			}
		}

		return err;

	} // partial

}; // methods

/**
* Run the validation only for given element(s).
* It's useful in cases that the form is splited in steps and makes necessary to validate each step in separated.
*
* @param string		el          -   A string containing any identifier from element, such as: id, name or any css or html markup.
* @param boolean	show_error  -   Whenever an error message should be placed or not. Default is true.
* @param boolean	force_clear -   Whenever previous error message should be cleared or not. Default is true.
* @param boolean	prev_state	- 	Previous error state. Default is false.
*
* @return boolean - true when everything goes alright and false when there are errors
*/
function _partial_validation ( el, show_error, force_clear, prev_state )
{
	var err = (prev_state === undefined ? false : prev_state);

	show_error  = (show_error === undefined ? true : show_error);
	force_clear = (force_clear === undefined ? true : force_clear);

	el = (typeof el == 'object' ? el : $(el));

	if (force_clear)
	{
		_clear( el );   // reset previous error messages ...
	}

	// sometimes needs to ignore ...
	if ( !el.length || _ignore_this_element(el) )
	{
		// return a negative from the previous error state
		// cause true means everything alright and false means error.
		return !err;
	} // ignore

	if ( el.is('[required]') && ( ( !el.is('[type=checkbox]') && el.val() == '' ) || (el.is('[type=checkbox]') && !el.is(':checked')) || (el.is('select') && !el.find('option:selected').length) ) )
	{
		err = true;

		if (show_error)
		{
			_show_error(el, el.is('[type=checkbox]'));
		}
	} // empty

	// sanitize filters
	else if(o.use_filter && el.attr('filter') && !_is_filter_valid(el) )
	{
		err = true;

		if (show_error)
		{
			_show_warning(el, el.is('[type=checkbox]'));
		}
	} // filters

	return !err;

} // _partial_validation

/**
* Hand typing to validate the content of fields
*/
function _typing_handler( el )
{
	var is_filter_valid = !_is_filter_valid(el, o);

	// sanitize filters
	if(o.use_filter && el.attr('filter') && is_filter_valid)
	{
		_show_warning(el, el.is('[type=checkbox]'));
	}

	else if (el.val() !== '' && el.attr('filter') && !is_filter_valid)
	{
		_show_success(el, el.is('[type=checkbox]'));
	}

	else
	{
		_clear(el);
	}

} // _typing_handler

/**
* Count all content chars from a given element.
*/
function _char_count(e, el, max)
{

	if (el.val().length > max)
	{
		e.preventDefault();
		return;
	}

	el.siblings('.at-description').find('span.at-counter').html(el.val().length);

};

/**
* Teste if the given element's filter is valid.
*/
function _is_filter_valid( el )
{
	var
	list	= el.attr('filter') !== undefined && el.attr('filter').indexOf('|') !== -1 ? el.attr('filter').split('|') : [el.attr('filter')],
	pattern = /^(\w\d)+/,
	error   = false,
	i;

	for(i in list)
	{
		// get given filter
		pattern = list[i];

		if (typeof pattern != 'undefined' && pattern.indexOf(':') !== -1)
		{
			// if it's a functional filter
			// split the function name and given value

			pattern = list[i].split(':');
			error 	= ( el.val() !== '' && !( typeof filters[pattern[0]] != 'undefined' && filters[pattern[0]](el.val(), (el.parents('form').find('#'+pattern[1]).val() || pattern[1]) )) );
			if (error) break;

		}

		else
		{
			// if it isn't a functional filter
			// retrieve the patthern to be matched

			pattern = filters[pattern];
			error 	= (el.val() !== '' && !el.val().match(pattern));
			if (error) break;

		}

	} // for

	return !error;

} // _is_filter_valid

/**
* Shows the 'success', compatible with bootstrap.
*/
function _show_success( el, is_checkbox )
{
	_clear(el);

	el.addClass('at-success');
	el.closest('.form-group').addClass('has-success').addClass('has-feedback');

	if (!is_checkbox && el.is(':visible'))
	{
		el.after($('<span />', {'class': 'glyphicon glyphicon-ok form-control-feedback'}));
	}

} // _show_success

/**
* Shows the 'warning', compatible with boostrap
*/
function _show_warning( el, is_checkbox )
{
	var msg = (el.data('invalid') || (o.messages.invalid ? o.messages.invalid : 'This field has invalid data')),
	place = (el.data('place-after') || el);

	_clear(el);

	el.addClass('at-invalid');
	el.closest('.form-group').addClass('has-warning').addClass('has-feedback');

	if (! is_checkbox)
	{
		$(place).after( $('<'+(o.tag ? o.tag : 'p')+'/>', {'class': 'at-warning', 'html': msg}) );

		if (el.is(':visible'))
		{
			$(place).after( $('<span />', {'class': 'glyphicon glyphicon-warning-sign form-control-feedback'}));
		}
	}
	else
	{
		el.parent('label').after( $('<span />', {'class': 'at-warning', 'html': msg}) );
	}

} // show_warning

/**
* Shows 'error', compatible with bootstrap
*/
function _show_error( el, is_checkbox )
{
	var msg = (el.data('required') || (o.messages.required ? o.messages.required : 'This field is required')),
	place = (el.data('place-after') || el),
	place_for_msg = (el.data('place-after') || (el.closest('.form-group').hasClass('input-group') ? el.closest('.form-group') : el));

	_clear(el);

	el.addClass('at-required');
	el.closest('.form-group').addClass('has-error').addClass('has-feedback');

	if (! is_checkbox)
	{
		$(place_for_msg).after( $('<'+(o.tag ? o.tag : 'p')+'/>', {'class': 'at-error', 'html': msg}) );

		if (el.is(':visible'))
		{
			$(place).after( $('<span />', {'class': 'glyphicon glyphicon-remove form-control-feedback'}));
		}
	}
	else
	{
		el.parent().find('.at-error,.at-warning,.at-info,.at-success').remove();
		el.next('label').after( $('<span />', {'class': 'at-error', 'html': '&nbsp;' + msg}) );
	}

} // show_error

/**
* Remove the validation messages from given element.
*/
function _clear( el )
{
	el.removeClass('at-required at-invalid at-success');

	// clear success|errors|warnings messages of given element
	if (! el.is('[type=checkbox]'))
	{
		// clear for input-groups as well.
		if (el.closest('.form-group').hasClass('input-group'))
		{
			el.closest('.form-group').siblings('.form-control-feedback, .at-error, .at-warning, .at-info').remove();
		}

		el.closest('.form-group').removeClass('has-error has-warning has-success has-feedback');
		el.siblings('.form-control-feedback, .at-error, .at-warning, .at-info, .at-success').remove();
	}
	else
	{
		el.siblings('.form-control-feedback, .at-error, .at-warning, .at-info, .at-success').remove();
	}

}; // _clear

/**
* Remove the validation messages from all elements from the validated form.
*/
function _clear_all()
{
	// clear all success|errors|warnings messages
	$('.at-error, .at-warning, .at-info, .form-control-feedback').remove();
	$('.at-required, .at-invalid, .at-success, .has-error, .has-warning, .has-feedback, .has-success').removeClass('at-required at-invalid at-success has-error has-warning has-feedback has-success');

}; // _clear

/**
* Define some elements that might be ignored when validating.
*/
function _ignore_this_element(el)
{
	var types_of_elements_to_ignore = ['submit','reset','button','image'];
	return !el.is('input') || (el.is('input') && $.inArray(el.prop('type'), types_of_elements_to_ignore)) === -1 ? false : true;

} // _ignore_element

/**
* Attach the plugin into jQuery.
*/
$.fn.valida = function(method) {
	if (methods[method]) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if ( typeof method === 'object' || ! method ) {
		return methods.init.apply( this, arguments );
	} else {
		$.error( 'Method ' +  method + ' does not exist on jQuery.valida()' );
	}
};

})(jQuery);
