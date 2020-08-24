function exit_notifier_leave_now(event) {
	event.preventDefault();
	var clickedObject = jQuery(event.target.id);
	var urlsnippet = '';
	urlsnippet = event.currentTarget.href;
	if (event.currentTarget.href.length > 40) {
		urlsnippet = event.currentTarget.href.substr(0, 40) + "...";
	}
	//console.log("urlsnipppet: " + urlsnippet);
	var finishedbody = ExitBoxSettings.body.replace('{target}',event.currentTarget.href);
	var finishedtitle = ExitBoxSettings.title.replace('{target}',event.currentTarget.href);
	var finishedconfirmtext = ExitBoxSettings.GoButtonText;
	if (ExitBoxSettings.Include_URL === 'on') {
		finishedconfirmtext = ExitBoxSettings.GoButtonText + ' ' + urlsnippet;
	}
	var finishedcanceltext = ExitBoxSettings.CancelButtonText;

	if (jQuery(event.currentTarget).hasClass(ExitBoxSettings.alt_classname)) {
		finishedbody = ExitBoxSettings.alt_body.replace('{target}',event.currentTarget.href);
		finishedtitle = ExitBoxSettings.alt_title.replace('{target}',event.currentTarget.href);
		finishedconfirmtext = ExitBoxSettings.alt_GoButtonText;
		finishedcanceltext = ExitBoxSettings.alt_CancelButtonText;
			if (ExitBoxSettings.alt_Include_URL === 'on') {
				finishedconfirmtext = ExitBoxSettings.alt_GoButtonText + ' ' + urlsnippet;
			}
		}
	if (ExitBoxSettings.activate_custom_content === 'on') {
		if (typeof jQuery(event.currentTarget).attr('exit-notifier-title') !== 'undefined') {
			finishedtitle = jQuery(event.currentTarget).attr('exit-notifier-title').replace('{target}',event.currentTarget.href);
		}
		if (typeof jQuery(event.currentTarget).attr('exit-notifier-body') !== 'undefined') {
			finishedbody = jQuery(event.currentTarget).attr('exit-notifier-body').replace('{target}',event.currentTarget.href);
		}
	}
	if (ExitBoxSettings.enable_timeout === 'on') {
		if (ExitBoxSettings.enable_progressbar === 'on') {
			finishedbody =  finishedbody + '<progress value="0" max="' + ExitBoxSettings.timeout_seconds + '" id="ExitNotifierProgressBar" style="width: 100%"></progress>';
		}
		else {
			finishedbody =  finishedbody + '<progress value="0" max="' + ExitBoxSettings.timeout_seconds + '" id="ExitNotifierProgressBar" style="width: 0px;height: 0px;"></progress>';
		}
		if (ExitBoxSettings.timeout_statement === 'on') {
			var initialstatement = '';
			if (ExitBoxSettings.continue_or_cancel === 'continue') {
				initialstatement = ExitBoxSettings.timeout_text_continue.replace('{seconds}', ExitBoxSettings.timeout_seconds);
			}
			else {
				initialstatement = ExitBoxSettings.timeout_text_cancel.replace('{seconds}', ExitBoxSettings.timeout_seconds);
			}
			finishedbody =  finishedbody + '<br><p style="text-align: center;" id="continueorcancelcountdown">' + initialstatement + '</p>';
		}
		else {
			finishedbody =  finishedbody + '<progress value="0" max="' + ExitBoxSettings.timeout_seconds + '" id="ExitNotifierProgressBar" style="width: 0px;height: 0px;"></progress>';
		}
	}
	var countdownTimer = ''
	var blurbackground = false;
	if (ExitBoxSettings.blurbackground === 'on') {
		blurbackground = true;
	}
	jQuery.jAlert({
		'type': 'confirm', 
		'title': finishedtitle,
		'content': finishedbody,
		'confirmBtnText': finishedconfirmtext,
		'denyBtnText': finishedcanceltext,
		'theme': ExitBoxSettings.theme,
		'backgroundColor': ExitBoxSettings.backgroundcolor,
		'blurBackground': blurbackground,
		'size': ExitBoxSettings.size,
		'showAnimation': ExitBoxSettings.showAnimation,
		'hideAnimation': ExitBoxSettings.hideAnimation,
		'onConfirm': function() {
			let clickTarget = '';
			if (typeof(event.currentTarget != 'undefined') && event.currentTarget.target === '_blank') {
				clickTarget = 'new';
			}
			if (ExitBoxSettings.new_window === 'on' || clickTarget === 'new') {
				window.open(event.currentTarget.href, 'New Window');
			}
			else {
				location.href = event.currentTarget.href;
			}
		}, 
		'onDeny': function(){
			jQuery(clickedObject).focus();
		},
		'onClose': function(){
			clearInterval(countdownTimer);
		}
	});
	if (ExitBoxSettings.enable_timeout === 'on') {
		var timeleft = ExitBoxSettings.timeout_seconds;
		//console.log("Setting " + ExitBoxSettings.timeout_seconds + " seconds timeout on the " + ExitBoxSettings.continue_or_cancel + " button.");
		if (ExitBoxSettings.continue_or_cancel === 'continue') {
			countdownTimer = setInterval(function(){
				document.getElementById("ExitNotifierProgressBar").value = ExitBoxSettings.timeout_seconds - --timeleft;
				if (ExitBoxSettings.timeout_statement === 'on') {
					jQuery("#continueorcancelcountdown").html(ExitBoxSettings.timeout_text_continue.replace('{seconds}',timeleft));
				}
				//console.log(timeleft);
				if(timeleft <= 0) {
					clearInterval(countdownTimer);
					jQuery(".confirmBtn").click();
				}
			},1000);
		}
		else if (ExitBoxSettings.continue_or_cancel === 'cancel') {
			countdownTimer = setInterval(function(){
				document.getElementById("ExitNotifierProgressBar").value = ExitBoxSettings.timeout_seconds - --timeleft;
				if (ExitBoxSettings.timeout_statement === 'on') {
					jQuery("#continueorcancelcountdown").html(ExitBoxSettings.timeout_text_cancel.replace('{seconds}',timeleft));
				}
				//console.log(timeleft);
				if(timeleft <= 0) {
					clearInterval(countdownTimer);
					jQuery(".denyBtn").click();
				}
			},1000);
		}
	}
    return false;
};

function exit_notifier_submit_now(event) {
	//console.log(event);
	var formclicked = event.currentTarget;
	var urlsnippet = '';
	var containingform = jQuery(event.currentTarget).parentsUntil('form');
	//console.log(containingform);
	urlsnippet = event.srcElement.form.action;
	//console.log(urlsnippet);
	if (event.srcElement.form.action.length > 40) {
		urlsnippet = event.srcElement.form.action.substr(0, 40) + "...";
	}
	//console.log("urlsnipppet: " + urlsnippet);
	var finishedbody = ExitBoxSettings.body.replace('{target}',event.srcElement.form.action);
	var finishedtitle = ExitBoxSettings.title.replace('{target}',event.srcElement.form.action);
	var finishedconfirmtext = ExitBoxSettings.GoButtonText;
	if (ExitBoxSettings.Include_URL === 'on') {
		finishedconfirmtext = ExitBoxSettings.GoButtonText + ' ' + urlsnippet;
	}
	var finishedcanceltext = ExitBoxSettings.CancelButtonText;
	if (jQuery(event.currentTarget).hasClass(ExitBoxSettings.alt_classname)) {
		finishedbody = ExitBoxSettings.alt_body.replace('{target}',event.srcElement.form.action);
		finishedtitle = ExitBoxSettings.alt_title.replace('{target}',event.srcElement.form.action);
		finishedconfirmtext = ExitBoxSettings.alt_GoButtonText;
		finishedcanceltext = ExitBoxSettings.alt_CancelButtonText;
	}
	if (ExitBoxSettings.activate_custom_content === 'on') {
		if (typeof jQuery(event.currentTarget).attr('exit-notifier-title') !== 'undefined') {
			finishedtitle = jQuery(event.currentTarget).attr('exit-notifier-title').replace('{target}',event.srcElement.form.action);
		}
		if (typeof jQuery(event.currentTarget).attr('exit-notifier-body') !== 'undefined') {
			finishedbody = jQuery(event.currentTarget).attr('exit-notifier-body').replace('{target}',event.srcElement.form.action);
		}
	}
	if (ExitBoxSettings.enable_timeout === 'on') {
		if (ExitBoxSettings.enable_progressbar === 'on') {
			finishedbody =  finishedbody + '<progress value="0" max="' + ExitBoxSettings.timeout_seconds + '" id="ExitNotifierProgressBar" style="width: 100%"></progress>';
		}
		else {
			finishedbody =  finishedbody + '<progress value="0" max="' + ExitBoxSettings.timeout_seconds + '" id="ExitNotifierProgressBar" style="width: 0px;height: 0px;"></progress>';
		}
		if (ExitBoxSettings.timeout_statement === 'on') {
			var initialstatement = '';
			if (ExitBoxSettings.continue_or_cancel === 'continue') {
				initialstatement = ExitBoxSettings.timeout_text_continue.replace('{seconds}', ExitBoxSettings.timeout_seconds);
			}
			else {
				initialstatement = ExitBoxSettings.timeout_text_cancel.replace('{seconds}', ExitBoxSettings.timeout_seconds);
			}
			finishedbody =  finishedbody + '<br><p style="text-align: center;" id="continueorcancelcountdown">' + initialstatement + '</p>';
		}
		else {
			finishedbody =  finishedbody + '<progress value="0" max="' + ExitBoxSettings.timeout_seconds + '" id="ExitNotifierProgressBar" style="width: 0px;height: 0px;"></progress>';
		}
	}
	// console.log(finishedbody);
	// console.log(finishedtitle);
	// console.log(finishedconfirmtext);
	// console.log(finishedcanceltext);
	var countdownTimer = ''
	var blurbackground = false;
	if (ExitBoxSettings.blurbackground === 'on') {
		blurbackground = true;
	}
	jQuery.jAlert({
		'id': 'exitbox',
		'type': 'confirm', 
		'title': finishedtitle,
		'content': finishedbody,
		'confirmBtnText': finishedconfirmtext,
		'denyBtnText': finishedcanceltext,
		'theme': ExitBoxSettings.theme,
		'backgroundColor': ExitBoxSettings.backgroundcolor,
		'blurBackground': blurbackground,
		'size': ExitBoxSettings.size,
		'showAnimation': ExitBoxSettings.showAnimation,
		'hideAnimation': ExitBoxSettings.hideAnimation,
		'onConfirm': function() {
			jQuery(event.srcElement.form).submit();
		}, 
		'onDeny': function(){
			event.preventDefault();
		},
		'onClose': function(){
			clearInterval(countdownTimer);
		}
	});
	if (ExitBoxSettings.enable_timeout === 'on') {
		var timeleft = ExitBoxSettings.timeout_seconds;
		if (ExitBoxSettings.continue_or_cancel === 'continue') {
			countdownTimer = setInterval(function(){
				document.getElementById("ExitNotifierProgressBar").value = ExitBoxSettings.timeout_seconds - --timeleft;
				if (ExitBoxSettings.timeout_statement === 'on') {
					jQuery("#continueorcancelcountdown").html(ExitBoxSettings.timeout_text_continue.replace('{seconds}',timeleft));
				}
				if(timeleft <= 0) {
					clearInterval(countdownTimer);
					jQuery(".confirmBtn").click();
				}
			},1000);
		}
		else if (ExitBoxSettings.continue_or_cancel === 'cancel') {
			countdownTimer = setInterval(function(){
				document.getElementById("ExitNotifierProgressBar").value = ExitBoxSettings.timeout_seconds - --timeleft;
				if (ExitBoxSettings.timeout_statement === 'on') {
					jQuery("#continueorcancelcountdown").html(ExitBoxSettings.timeout_text_cancel.replace('{seconds}',timeleft));
				}
				if(timeleft <= 0) {
					clearInterval(countdownTimer);
					jQuery(".denyBtn").click();
				}
			},1000);
		}
	}
	//jQuery.data('dev.ja_body',exitNotifierTimer,countdownTimer);
  return false;
};

function stopcountdown() {
	clearInterval(jQuery.data('dev.ja_body',exitNotifierTimer));
	jQuery('#continueorcancelcountdown').toggle( "slow" );
}

jQuery(document).ready(function(){
	jQuery.noConflict();
	jQuery('head').append('<style>.ja_custom {' + ExitBoxSettings.custom_css + '}</style>');
	jQuery('head').append('<style>' + ExitBoxSettings.advanced_custom_css + '</style>');
	jQuery(function($) {
		// a href
		var select_external = 'a[href*="//"]:not([href*="' + ExitBoxSettings.siteroot + '"])';
		if (ExitBoxSettings.apply_to_all_offsite_links !== 'on') {
			select_external = ExitBoxSettings.jquery_selector_field;
		}
		jQuery(select_external).addClass('exitNotifierLink');
		if (ExitBoxSettings.addclasses === 'on') {
			jQuery(select_external).addClass(ExitBoxSettings.classestoadd);
		}
		jQuery(document).on( 'click', select_external, exit_notifier_leave_now );
		if (ExitBoxSettings.visual === 'on') {
			jQuery(select_external).append('&nbsp;<img class="flat" src="' + ExitBoxSettings.siteurl + '/wp-content/plugins/exit-notifier/external-link.png" border=0>');
		}
		// Forms
		if (ExitBoxSettings.enable_notifier_for_forms === 'on') {
			var submit_external = 'form[action*="//"]:not([action*="' + ExitBoxSettings.siteroot + '"])';
			if (ExitBoxSettings.apply_to_all_offsite_forms !== 'on') {
				submit_external = ExitBoxSettings.jquery_form_selector_field;
			}
			jQuery(submit_external).addClass('exitNotifierForm');
			//console.log(submit_external)
			var formsubmitbutton = jQuery(submit_external).find(':submit');
			jQuery(document).on( 'click', formsubmitbutton, exit_notifier_submit_now );
			if (ExitBoxSettings.visual === 'on') {
				jQuery(submit_external).append('&nbsp;<img class="flat" src="' + ExitBoxSettings.siteurl + '/wp-content/plugins/exit-notifier/external-link.png" border=0>');
			}
		}
		// Allow a click on the body to stop the countdown
		//jQuery("div.ja_body").on('click',stopcountdown);
	});
});