/**
 * @description 	Product selector AJAX
 */
jQuery(document).ready(function($){

	// Check if last questionaire indicator is click
	$('.indicator-item.last a').click(function(){
		var selected_products = [];

		$('.questionnaire input:radio:checked').each(function() {
			selected_products.push( this.value );
		});

		var products = $('.selector-result .products'),
			contents = {
				action: 	'selector',
				fields:		selected_products.join(","),
				slug: 		$('.questionnaire input[name=slug]').val(),
			}

		products.html( '...' );

		$.post( ps_ajax.url, contents, function( data ) {
			products.html( data );
		});

		return false;
	});

});