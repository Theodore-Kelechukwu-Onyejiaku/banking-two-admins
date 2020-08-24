// A $( document ).ready() block. outer_icons_custom_class
jQuery( document ).ready(function() {
    
    var ctb_direct = jQuery(".outer_icons_custom_class" ).find( "div.icon-one" );
    var debit_power = jQuery(".outer_icons_custom_class" ).find( "div.icon-two" );
    var flat_fee = jQuery(".outer_icons_custom_class" ).find( "div.icon-three" );
    var golden_premier = jQuery(".outer_icons_custom_class" ).find( "div.icon-four" );
    var small_business = jQuery(".outer_icons_custom_class" ).find( "div.icon-five" );
    var ctb_free = jQuery(".outer_icons_custom_class" ).find( "div.icon-six" );
    var regular_chk = jQuery(".outer_icons_custom_class" ).find( "div.icon-seven" );
    var ctb_advantage = jQuery(".outer_icons_custom_class" ).find( "div.icon-eight" );
    var personal_interest = jQuery(".outer_icons_custom_class" ).find( "div.icon-nine" );
    var money_market = jQuery(".outer_icons_custom_class" ).find( "div.icon-ten" );
    var silver_money = jQuery(".outer_icons_custom_class" ).find( "div.icon-eleven" );
    var collegiate = jQuery(".outer_icons_custom_class" ).find( "div.icon-twelve" );

    jQuery("input[name='input_1']").change(function(){  // Paper or Electronic Selection
        var selectedValue = jQuery(this).val();
     
        if(selectedValue=="pes_p"){
            alert(selectedValue);
            ctb_direct.parent().parent().parent().addClass("inactive-icon");  // disable ctb direct
            debit_power.parent().parent().parent().addClass("inactive-icon");  // disable debit_power
            collegiate.parent().parent().parent().addClass("inactive-icon");  // disable collegiate
        
            //alert(iconOne);
        }else if(selectedValue=="pes_e"){
            alert(selectedValue);
            ctb_direct.parent().parent().parent().removeClass("inactive-icon");  // disable ctb direct
            debit_power.parent().parent().parent().removeClass("inactive-icon");  // disable debit_power
            collegiate.parent().parent().parent().removeClass("inactive-icon");  // disable collegiate

        }

    });

});