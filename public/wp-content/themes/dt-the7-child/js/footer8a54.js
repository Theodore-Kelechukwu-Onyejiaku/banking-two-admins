jQuery(document).ready(function() {
    //jQuery(".menu-footer-container ul.sub-menu").parent().addClass("dropdown");
    //jQuery( ".menu-footer-container ul li.dropdown .sub-menu" ).before( "<span class='drop'></span>" );
/*
    jQuery('.dropdown span').unbind('click').click(function() {
        jQuery(".menu-footer-container ul li.dropdown").removeClass("subhover");
        jQuery(this).parent().addClass("subhover");
        jQuery('.subhover ul.sub-menu').toggle();
        return false;
    });
*/

jQuery('form.switch-field-form').find('input:radio:checked').each(function() {
	var curVal = jQuery(this).val();
	if (jQuery(this).val().length > 0) {
		jQuery(this).parent().parent().attr('objvalue', curVal);
	} else {
		jQuery(this).parent().parent().attr('objvalue', '0');
	}
    jQuery('form.switch-field-form').find('input:radio').change(function(){
	    jQuery('form.switch-field-form').find('input:radio:checked').each(function() {
			jQuery(this).parent().parent().attr('objvalue', ' ');
		});
	    var curVal = jQuery(this).val();
		if (jQuery(this).val().length > 0) {
			jQuery(this).parent().parent().attr('objvalue', curVal);
			
			Changeofstyle();
		} else {
			jQuery(this).parent().parent().attr('objvalue', '0');
		}
	});
	function Changeofstyle() {
		var papperarray = 'div.icon-one';
		var depositarray ='div.icon-two';
		var transarray = 'div.icon-three';
		var balancearray = 'div.icon-four';
		var businessarray = ' ';
		
		if(jQuery('li.statement ul').attr('objvalue') == '1') {
			jQuery(papperarray).addClass('iconclasson');
		} 
		else {
			jQuery(papperarray).removeClass('iconclasson');
		}
		
		if(jQuery('li.deposit ul').attr('objvalue') == '1') {
			jQuery(depositarray).addClass('iconclasson');
		} else {
			jQuery(depositarray).removeClass('iconclasson');
		}
		
		if(jQuery('li.transaction ul').attr('objvalue') == '1') {
			jQuery(transarray).addClass('iconclasson');
		} else {
			jQuery(transarray).removeClass('iconclasson');
		}
		
		if(jQuery('li.balance ul').attr('objvalue') == '1') {
			jQuery(balancearray).addClass('iconclasson');
		} else {
			jQuery(balancearray).removeClass('iconclasson');
		}
		
		if(jQuery('li.business ul').attr('objvalue') == '1') {
			jQuery(businessarray).addClass('iconclasson');
		} else {
			jQuery(businessarray).removeClass('iconclasson');
		}
	}
	
});



        jQuery(document).on('click', ".loginform", function(e){
            e.stopPropagation();
        });

        jQuery(document).on('click', ".online-banking", function(e){
            e.stopPropagation();
            e.preventDefault();

            if(jQuery(this).find('.loginform').is(':visible'))
                jQuery(this).find('.loginform').hide();
            else
                jQuery(this).find('.loginform').show();
        });

        jQuery(document).click(function() {
            jQuery('.loginform').hide();
        });

        /*jQuery(".online-banking").on('mouseenter', function(){
            jQuery(this).find('.loginform').show();
        });
        jQuery(".online-banking").on('mouseleave', function(){
            jQuery(this).find('.loginform').hide();
        });*/
        jQuery(document).on('click', ".online-banking-mobile, li#mobile-menu-item-2420", function(e){
            e.preventDefault();
            jQuery('.login-box-mobile').lightbox_me({
                centered: true,
                closeSelector: '.close-popup'
            });
        });
});