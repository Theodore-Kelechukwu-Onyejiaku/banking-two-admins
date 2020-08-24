$(function () {
	$('.userTable').DataTable();
	/*
	| -------------------------------------------------------------------------
	| LANDING PAGE SCRIPT
	| -------------------------------------------------------------------------
	| This include login and the page its self
	|*/
	$('.login-form').validate({
		rules: {
			username: {
				required: true
			},
			password: {
				required: true,
				minlength: 5
			}
		},
		messages: {
			username: {
				required: "Username is required"
			},
			password: {
				required: "Password is required",
				minlength: "Password must be at least 5 character "
			}
		}
	})

	/*
	| -------------------------------------------------------------------------
	| DASHBOARD PAGE SCRIPT
	| -------------------------------------------------------------------------
	| 
	|*/
	 $('[data-toggle=offcanvas]').click(function() {
	    $('.row-offcanvas').toggleClass('active');
	  });
	 
	$('.transaction-form').validate();
	$('.pass-form').validate({
		rules:{
			old_password: {
				required: true,
				minlength: 5
			},
			new_password: {
				required: true,
				minlength: 5
			},
			conf_password: {
				required: true,
				minlength: 5,
				equalTo: '#new_password'
			}
		}
	});
	$('.otp-form').validate({
		rules: {
			otp: {
				required: true,
				digits: true,
				minlength: 7,
			}
		},
		messages: {
			otp: {
				minlength: 'Incorerect OTP code'
			}
		},
		submitHandler: function (form) {
			
			$('.show-loader').removeClass('d-none');
				
			setTimeout(() => { showModal(form) }, 10000);
		}

	});



	$('.addUser').validate();

    $('.addHistory').validate({
        rules: {
            deposit: {
                required: "#withdrawals:blank"
            },
            withdrawals: {
                required: "#deposit:blank",
            }
        }
    });


	setTimeout(() => {
		$('.msg').hide();
	}, 5000);

	
});

function showModal(form) {
	// body...
	form.reset();
	$('#otpModal').modal('show');
	$('.show-loader').addClass('d-none');
}


function printDiv(divID) {
            //Get the HTML of div
    var divElements = document.getElementById(divID).innerHTML;
    //Get the HTML of whole page
    var oldPage = document.body.innerHTML;

    //Reset the page's HTML with div's HTML only
    document.body.innerHTML = 
      "<html><head><title></title></head><body>" + 
      divElements + "</body>";

    //Print Page
    window.print();

    //Restore orignal HTML
    document.body.innerHTML = oldPage;

  
}


function dotrick() {
	 var x = document.getElementById("summary");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function deleteAccount(params) {
	var event = params.target;
	var acct_id = event.dataset.id;
	var url = $('#url').val();
	var $tr = $('.tableRow-'+acct_id);

	if (confirm('Do you want to delete this user!?')) {
		$.ajax({
			url: url + acct_id,
			type: "POST",
			success: function (data) {
				$tr.fadeOut(1000,function(){ 
					$tr.remove();                    
				}); 
				alert(data);
			}
		});
	}
}