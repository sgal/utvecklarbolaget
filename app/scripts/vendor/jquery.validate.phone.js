/*!
 * jQuery Validation Plugin v1.15.0
 * Phone SE only
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2016 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery", "./jquery.validate"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

/**
 * Swedish phone numbers have 10 digits (or 11 and start with +46).
 */
$.validator.addMethod( "phoneSE", function( value, element ) {
	return this.optional( element ) || /^((\+|00(\s|\s?\-\s?)?)46(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test( value );
}, "Please specify a valid phone number." );

}));