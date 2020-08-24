/**
 * @description 	Product selector JS
 */
jQuery(document).ready(function($){
	
	var selector_tab = $('div.questionnaire');
	// selector_tab.find('li a').click(function(event) {

	// 	event.preventDefault();
		
	// 	if( $(this).hasClass('active') )
	// 		return;
		
	// 	var data_tab 	= $(this).attr('data-tab'),
	// 		tab_title 	= $(this).parents('ul.tab-title'),
	// 		tab_content = tab_title.siblings('ul.tab-content');
		
	// 	// tab title
	// 	tab_title.find('a.active').removeClass('active');
	// 	$(this).addClass('active');
		
	// 	// tab content
	// 	tab_content.find('li.active').removeClass('active');
	// 	tab_content.find('li[data-tab="' + data_tab + '"]').addClass('active');
	// });


	// Selector item
	$('.questionnaire-item label').each(function() {

		$(this).on('click', function(event) {
			event.stopPropagation();
			
			if( $(event.target).is("label") ) {
				// Remove children active class
				$(this).parents('.questionnaire-item').find('label').removeClass('active');
				$(this).addClass("active");

				// Active next content item
	   			$(this).parents('.questionnaire-item').removeClass('active').next('.questionnaire-item').addClass('active');

	   			// Activate next indicator
	   			$('.questionnaire-indicator .indicator-item a.active').removeClass('active').parents('.indicator-item').next('.indicator-item').find('a').addClass('active');
				
				$('.questionnaire-indicator .indicator-item a.active').parents('.indicator-item').find('.dot i').addClass('show');
			}
		});

	});


	// Re-generated data
	$('.questionnaire-item:nth-last-child(2) label').click(function(event) {
			
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

	});


	$('.questionnaire-item__btn').on('click', function(event){
		event.preventDefault();

		// Active next content item
		$('.questionnaire-content .questionnaire-item.active').removeClass('active').prev('.questionnaire-item').addClass('active');
		
		// Activate next indicator
		$('.questionnaire-indicator .indicator-item a.active').removeClass('active').parents('.indicator-item').prev('.indicator-item').find('a').addClass('active');
		
		$('.questionnaire-indicator .indicator-item a.active').parents('.indicator-item').next('.indicator-item').find('.dot i').removeClass('show');
		//$('.questionnaire-indicator .indicator-item a.active').find('.dot i').removeClass('show')
	});

	
	// Run indicator item width
	indicator_item_width();
	

	/**
	 * Product Selector dialog
	 */
	// Close dialog box
	$("a#close_product_selector").on("click", function(){
		$(".product-selector-modal").each(function(){
			$(this).removeClass('fadeInDown').addClass('fadeOutUp');
		});
	});

	// Open dialog box
	$("a#open_product_selector").on("click", function(){
		$(".product-selector-modal").each(function(){
			// Make sure to remove previously added fadeOutUp code first
			$(this).removeClass('fadeOutUp').addClass('fadeInDown').css({'display': 'block'});

			indicator_item_width();
		});
	});

	function indicator_item_width() {
		if($('.selectors .questionnaire-indicator').children(".indicator-item").length - 1 > 1){
			var indicator_item  	= $('.selectors .questionnaire-indicator').children(".indicator-item").length - 1;
		}else if($('.product-selector-modal .questionnaire-indicator').children(".indicator-item").length - 1 > 1){ 
			var indicator_item  	= $('.product-selector-modal .questionnaire-indicator').children(".indicator-item").length - 1;
		}
		var indicator_padding 	= parseFloat( ( 100 / indicator_item ) - 1 );

		$('.questionnaire-indicator .indicator-item').css({'width':indicator_padding + '%'});
	}

});