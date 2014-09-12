/**
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
 * @version 2.0.7
 * @cat Plugins/Form Validation
 * @author Rogério Taques (rogerio@awin.com.br | http://awin.com.br)
 * @see http://code.google.com/p/jquery-valida/
 * 
 * Contributors:
 * - Kosuke Hiraga (hiraga@brijcs.co.jp)
 */

/**
 * CHANGELOG
 * 
 * 2.0 	First release. Entirely rewritten to become lighweight and to provide support for bootstrap.
 * 		Some improvements in filters (url and phone_br) and callbacks (after and before validations). Special thanks for Kosuke Hiraga. 
 * 		Minor bugs caused by rewritten were fixed.
 * 		The 'destroy' method was included.
 * 		Defined a namespace for all plugin.
 * 
 */

(function($){

	"use strict";
	
	var version = '2.0.7',
	
	// default options
	defaults = {
			
		// basic settings
		form_validate: 'novalidate',	// when 'novalidate' form will not be validated by browser
		form_autocomplete: 'off',		// when 'off' default browser autocomplete will be switched off 
		tag: 'p',						// the html tag that will be used to display errors
		lost_focus: true,				// when true, validation will be applied when field loose focus.
		
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
		
		// filters & callbacks
		use_filter: true,		// defines that filters will be validated
		
		before_validate: null,	// callback which runs before default validation
		after_validate: null	// callback which runs after default validation
		
	},
	
	// available filters
	filters = {
		// name@domain.co[m[.br]]
		'email' : /^[\w!#$%&'*+\/=?^`{|}~-]+(\.[\w!#$%&'*+\/=?^`{|}~-]+)*@(([\w-]+\.)+[A-Za-z]{2,6}|\[\d{1,3}(\.\d{1,3}){3}\])$/,
		// [http[s]://][www.]domain.co[m[.br]]
		'url' : /^(http[s]?:\/\/|ftp:\/\/)?(www\.)?[a-zA-Z0-9-\.]+\.(com|org|net|mil|edu|ca|co.uk|com.au|gov|br|jp|co|in|me|la|ly)$/,
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
		'matches' : function(a, b) { 
			b = ( $('#'+b).val() || b );
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
			var o = $.extend(defaults, options);
			
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
								_show_error(el, o, el.is('[type=checkbox]'));
								
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
								_show_error(el, o, el.is('[type=checkbox]'));
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
								_typing_handler(el, o);
							}
							
						}).on('keydown.valida', function(e)
						{
							_typing_handler(el, o);
							
						});
					}
					
				}); // elements
				
				// when submit, than really validates
				f.on('submit.valida', function(e)
				{
					var err = false;
					
					_clear_all();

					// callback for 'before validation'
					if (o.before_validate && $.isFunction(o.before_validate))
					{
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
						el = $(el);
						
						// sometimes needs to ignore ...
						if ( _ignore_this_element(el) )
						{
							return;
						
						} // ignore

						if ( el.is('[required]') && ( ( !el.is('[type=checkbox]') && el.val() == '' ) || (el.is('[type=checkbox]') && !el.is(':checked')) || (el.is('select') && !el.find('option').length) ) )
						{
							
							err = true;
							_show_error(el, o, el.is('[type=checkbox]'));
							
						} // empty

						// sanitize filters
						else if(o.use_filter && el.attr('filter') && !_is_filter_valid(el, o) )
						{
							
							err = true;
							_show_warning(el, o, el.is('[type=checkbox]'));
							
						} // filters
						
					}); // required elements

					// callback for 'after validation'
					if (o.after_validate && $.isFunction(o.after_validate))
					{
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
			
			// unbind all for fields
			f.find('input, select, textarea').off('valida');
			f.find('input, select, textarea').unbind('.valida');
			
			// remove content limited textareas' help text.
			f.find('.help-block.at-description').remove();
			
			// and finally unbind all for the form ...
			f.off('valida');
			f.unbind('.valida');

			f.valida = null;
			
		} // destroy 
		
	}; // methods
	
	/**
	 * Hand typing to validate the content of fields
	 */
	function _typing_handler(el, o)
	{
		var is_filter_valid = !_is_filter_valid(el, o);
		
		// sanitize filters
		if(o.use_filter && el.attr('filter') && is_filter_valid)
		{
			_show_warning(el, o, el.is('[type=checkbox]'));
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
	function _is_filter_valid(el)
	{
		var list	= el.attr('filter') !== undefined && el.attr('filter').indexOf('|') !== -1 ? el.attr('filter').split('|') : [el.attr('filter')],
			pattern = /^(\w\d)+/, 
			error   = false;
		
		for(var i=0; i < list.length; i++) 
		{
			// get given filter
			pattern = list[i];
			
			if (pattern !== undefined && pattern.indexOf(':') !== -1) 
			{
				// if it's a functional filter 
				// split the function name and given value
				
				pattern = list[i].split(':');
				error 	= ( el.val() !== '' && !( filters[pattern[0]] && filters[pattern[0]](el.val(), (el.parents('form').find('#'+pattern[1]).val() || pattern[1]) )) );
				if (error) break;
				
			} 
			
			else 
			{
				// if it isn't a functional filter
				// retrieve the patthern to be matched
				
				pattern = (filters[el.attr('filter')] || pattern); 
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
	function _show_warning( el, o, is_checkbox )
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
	function _show_error( el, o, is_checkbox )
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
			el.parent('label').after( $('<span />', {'class': 'at-error', 'html': msg}) );
		}
		
	} // show_error
	
	/**
	 * Remove the validation messages from given element.
	 */
	function _clear( el ) 
	{
		el.removeClass('at-required at-invalid');
		
		// clear errors|warnings messages of given element
		if (! el.is('[type=checkbox]'))
		{
			// clear for input-groups as well.
			if (el.closest('.form-group').hasClass('input-group'))
			{
				el.closest('.form-group').siblings('.form-control-feedback, .at-error, .at-warning, .at-info').remove();
			}
			
			el.closest('.form-group').removeClass('has-error has-warning has-success has-feedback');
			el.siblings('.form-control-feedback, .at-error, .at-warning, .at-info').remove();
		}
		else
		{
			el.parent('label').siblings('.form-control-feedback, .at-error, .at-warning, .at-info').remove();
		}
		
	}; // _clear
	
	/**
	 * Remove the validation messages from all elements from the validated form.
	 */
	function _clear_all() 
	{
		// clear all errors|warnings messages
		$('.at-error, .at-warning, .at-info, .form-control-feedback').remove();
		$('.at-required, .at-invalid, .has-error, .has-warning, .has-feedback, .has-success').removeClass('at-required at-invalid has-error has-warning has-feedback has-sucess');
		
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