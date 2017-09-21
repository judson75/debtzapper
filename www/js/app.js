// Initialize app
var app = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var serviceURL = 'http://myloanzapper.com/dz/api/v1/';
var storage = window.localStorage;

// Add view
var mainView = app.addView('.view-main', {
    dynamicNavbar: true
});

//deleteStorage('applogin');
setStorage('user_id', 1);
setStorage('applogin', 1);
//setStorage('max_accounts', 1);

//console.log("LOGGED IN: " + isLoggedIn());
if(isLoggedIn() !== true) {
	//mainView.router.load({pageName: 'dashboard'});
	mainView.router.loadPage('welcome.html');
}
else {
	buildDashboard();
	$('.toolbar').show();
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //alert("READY");
	//Push Notify
	var push = PushNotification.init({
		"android": {
			"senderID": "1058444389453"
		},
		"browser": {},
		"ios": {
			"sound": true,
			"vibration": true,
			"badge": true
		},
		"windows": {}
	});
	
	oldRegId = getStorage('registrationId');
	push.on('registration', function(data) {   
		//alert("reg Data: " + data.registrationId);  //this function give registration id from the GCM server if you dont want to see it please comment it
		if(data.registrationId != oldRegId) {
			setStorage('registrationId', data.registrationId);
		}
	});
	
	push.on('error', function(e) {
		alert("push error = " + e.message);
	});

	push.on('notification', function(data) {
		//alert('notification event');
		navigator.notification.alert(
			data.message,         // message
			null,                 // callback
			data.title,           // title
			'OK'                  // buttonName
		);
	});
	
	AppRate.preferences.storeAppURL = {
	  ios: '<my_app_id>',
	  android: 'market://details?id=com.loanzapper.app',
	  windows: 'ms-windows-store://pdp/?ProductId=<the apps Store ID>',
	  blackberry: 'appworld://content/[App Id]/',
	  windows8: 'ms-windows-store:Review?name=<the Package Family Name of the application>'
	};
	
	AppRate.preferences.displayAppName = 'LoanZapper';
	AppRate.preferences.usesUntilPrompt = 10;
	AppRate.promptForRating(false);
})

$$(document).on('pageReinit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	console.log("PAGE REINIT NAME: " + page.name);

})
// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
app.onPageInit('about', function (page) {
    // Do something here for "about" page
	
})


$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	/*console.log("PAGE NAME: " + page.name);*/
	if (page.name === 'index') {
		//console.log('INDEX, CHECK LOGGIN: ' + isLoggedIn());
		if($('#acct-id-input').val() == '') {
			$('#acct-id-input').val(getStorage('acct-id'));
			buildDashboard();
		}
	}
    
    if (page.name === 'amortization') {
		var amount = $('input[name="loan_amount"]').val().replace(/,/g, '');
		var rate = $('input[name="int_rate"]').val();
		var years = $('input[name="loan_years"]').val();
		var start_date = $('input[name="start_date"]').val();
		var current_month = $('input[name="current_month"]').val();
		var acct_id = $('input[name="id"]').val();
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'amort_table',
				'format': 'json',
				'amount': amount, 
				'rate': rate, 
				'years': years, 
				'start_date': start_date, 
				'current_month': current_month,
				'acct_id': acct_id,	
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
				/*console.log('Data: ' + data);*/ 
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code); */
				if(obj.code === 1) {
					$('#amort-container').html(obj.data, function() {
						//scroll to current month.
						if ($('.current-month').length) {
							console.log("SCROLL");
							$('html,body').animate({
							  scrollTop: $('.current-month').offset().top
							}, 1000);
							return false;
						}
					});
					
				}
				else {
					//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				}
				loading('hide');
			},
			error : function(request,error) {
				//$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
	
	if (page.name === 'settings') {
		//get settings
		var id = getStorage('user_id');
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'settings',
				'format': 'json',
				'id': id,
			},
			dataType: 'html',
			beforeSend: function() {
				//loading('show');
		  	},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code); */
				if(obj.code === 1) {
					$('#settingsFrm input[name="first_name"]').val(obj.data.first_name);
					$('#settingsFrm input[name="last_name"]').val(obj.data.last_name);
					$('#settingsFrm input[name="email"]').val(obj.data.email);
					$('#settingsFrm input[name="cell_phone"]').val(obj.data.cell_phone);
					if(obj.data.email_optin == 1) {
						$('#settingsFrm input[name="email_optin"]').prop('checked', true);
					}
					if(obj.data.sms_optin == 1) {
						$('#settingsFrm input[name="sms_optin"]').prop('checked', true);
					}
				}
				else {
					
				}
			},
			error : function(request,error) {
				//$('.login-screen-title').after('<div class="alert alert-error">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
	
	if (page.name === 'coupon') {
		$('#payment-amt').html(getStorage('payment-amt'));
		$('#acct-id').html(getStorage('acct-number'));
		
	}
	
	if (page.name === 'alerts') {
		
		var user_id = $('input[name="user_id"]').val();
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'alerts_table',
				'format': 'json',
				'user_id': user_id,	
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
			/*console.log('Data: ' + data);*/ 
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code);*/
				if(obj.code === 1) {
					$('#alerts-container').html(obj.data);	
				}
				else {
					//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				}
				loading('hide');
				$$('.page-content').on('scroll',function(e){
					$('.alert-tr').each(function( index ) {
						if(isScrolledIntoView($(this)) === true) {
							var id = $(this).attr('id').replace('alert-tr-', '');
							/*console.log("ID: " + id);*/
							//mark as read 
							if(!$(this).hasClass('read')) {
								$$.ajax({
									url : serviceURL,
									type : 'POST',
									data : {
										'method': 'post',
										'action': 'mark_alert_read',
										'format': 'json',
										'id' : id, 
									},
									dataType: 'html',
									beforeSend: function() {

									},
									success : function(data) {
									console.log("ALERT STATUS DATA: " + data);
										var obj = $.parseJSON(data);
										if(obj.code === 1) {
											$('#alert-tr-' + id).addClass('read');
										}
										else {

										}

									},
									error : function(request,error) {
										console.log("Request (error): "+JSON.stringify(request));
									}
								});
							}
						}
					});	
			
				});
			},
			error : function(request,error) {
				//$('.login-screen-title').after('<div class="alert alert-error list-block">' + JSON.stringify(request) + '</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
})

$$(document).on('click', '.sendResetBtn', function() {
	$('.alert').remove();
	var error_count = 0;
	var email = $$('input[name="reset_user_email"]').val();
	if(email == '') {
		$('input[name="reset_user_email"]').addClass('hasError');
		//' + ppmnt + ' = ' +  amount + '
		$('input[name="reset_user_email"]').after('<div class="helper error">You must enter an email address</div>');
		error_count++;
	}
	if(error_count > 0) {
		return false;
	}
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'send_reset',
			'format': 'json',
			'email' : email,
		},
		dataType: 'html',
		beforeSend: function() {

	  	},
		success : function(data) {
			console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				$('#reset-password-form').prepend('<div class="alert alert-success">Please check your email for instructions.</div>');	
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				//$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
			}
			
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
		}
	});
})

$$(document).on('click', '.loginBtn', function() {
	$('.alert').remove();
	var email = $$('input[name="email"]').val();
	var password = $$('input[name="password"]').val();
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'user_login',
			'format': 'json',
			'email': email,
			'password': password
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			console.log('Data: ' + data);
			var obj = $.parseJSON(data);
			/*console.log('Resp: ' + obj.code);*/
			if(obj.code === 1 && obj.data.id != '' && obj.data.id != null) {
				setStorage('email', obj.data.email);
				setStorage('user_id', obj.data.id);
				setStorage('applogin', 1);
				setStorage('max_accounts', obj.data.max_accounts);
				mainView.router.loadPage('index.html');
				location.reload();
			}
			else {
				$('.login-screen-title').after('<div class="alert alert-error list-block">' + obj.data + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured. Please try back again later.</div>');
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});

})



$(document).on('click', '.signupBtn', function() {
	$('.alert').remove();
	var error_count = 0;
	var email = $('input[name="register_email"]').val();
	var password = $('input[name="register_password"]').val();
	var first_name = $('input[name="first_name"]').val();
	var last_name = $('input[name="last_name"]').val();
	var cell_phone = $('input[name="cell_phone"]').val();
	if(first_name === '') {
		$('input[name="first_name"]').parent('div').addClass('hasError');
		$('input[name="first_name"]').after('<div class="helper error">Please enter first name</div>');
		error_count++;
	}
	if(last_name === '') {
		$('input[name="last_name"]').parent('div').addClass('hasError');
		$('input[name="last_name"]').after('<div class="helper error">Please enter last name</div>');
		error_count++;
	}
	if(email === '') {
		$('input[name="register_email"]').parent('div').addClass('hasError');
		$('input[name="register_email"]').after('<div class="helper error">Please enter email address</div>');
		error_count++;
	}
	else if(!validateEmail(email)) {
		$('input[name="register_email"]').parent('div').addClass('hasError');
		$('input[name="register_email"]').after('<div class="helper error">Please enter a valid email address</div>');
		error_count++;
	}
	if(password === '') {
		$('input[name="password"]').parent('div').addClass('hasError');
		$('input[name="password"]').after('<div class="helper error">Please enter password</div>');
		error_count++;
	}
	if(error_count > 0) {
		return false;
	}
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'register_user',
			'format': 'json',
			'email' : email, 
			'password': password, 
			'first_name': first_name, 
			'last_name': last_name, 
			'cell_phone': cell_phone,
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) { 
				$('#register-form').prepend('<div class="alert alert-success">You are now registered</div>');
			}
			else {
				$('#register-form').prepend('<div class="alert alert-error">' + obj.data + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.updateSettingsBtn', function() {
	$('.alert').remove();
	var id = getStorage('user_id');
	var first_name = $('#settingsFrm input[name="first_name"]').val();
	var last_name = $('#settingsFrm input[name="last_name"]').val();
	var email = $('#settingsFrm input[name="email"]').val();
	var cell_phone = $('#settingsFrm input[name="cell_phone"]').val();
	var email_optin = $('#settingsFrm input[name="email_optin"]:checked').val();
	var sms_optin = $('#settingsFrm input[name="sms_optin"]:checked').val();
	var password = $('#settingsFrm input[name="password"]').val();
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'settings',
			'format': 'json',
			'id': id,
			'first_name': first_name,
			'last_name': last_name,
			'email' : email,
			'cell_phone': cell_phone,
			'email_optin': email_optin,
			'sms_optin': sms_optin,
			'password': password,
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
			///	location.reload(); 
				$('#settingsFrm').prepend('<div class="alert alert-success">Your settings have been saved</div>');
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '#step1', function() {
	//if not on this page go to it
	if($('#step-add-debt').css('display') != 'block') {
		$('#step-add-debt').show();
		$('#step-add-income').hide();
		$('#step-add-plan').hide();
		$('#step1').addClass('active');
		$('#step2').removeClass('active');
		$('#step3').removeClass('active');
	}
});

$(document).on('click', '#step2', function() {
	//if not on this page go to it
	if($('#step-add-income').css('display') != 'block') {
		$('#step-add-debt').hide();
		$('#step-add-income').show();
		$('#step-add-plan').hide();
		$('#step1').removeClass('active');
		$('#step2').addClass('active');
		$('#step3').removeClass('active');
	}
});

$(document).on('click', '#step3', function() {
	//if not on this page go to it
	if($('#step-add-plan').css('display') != 'block') {
		$('#step-add-debt').hide();
		$('#step-add-income').hide();
		$('#step-add-plan').show();
		$('#step1').removeClass('active');
		$('#step2').removeClass('active');
		$('#step3').addClass('active');
	}
});

$(document).on('click', '.saveDebtbtn', function() {
	//We will save via ajax, once saved, ask to add another debt or proceed to income
	var error_count = 0;
	$('.helper').remove();
	var user_id = getStorage('user_id');
	var title = $('#debt-form input[name="debt_title"]').val();
	var int_rate = $('#debt-form input[name="int_rate"]').val();
	var beg_balance = $('#debt-form input[name="beg_balance"]').val();
	var beg_date = $('#debt-form input[name="beg_date"]').val();
	var loan_term = $('#debt-form input[name="loan_term"]').val();
	var cur_balance = $('#debt-form input[name="cur_balance"]').val(); 
	var due_date = $('#debt-form select[name="due_date"]').val();
	if(title == '') {
		$('#debt-form input[name="debt_title"]').addClass('hasError');
		$('#debt-form input[name="debt_title"]').after('<div class="helper error">You must enter a title</div>');
		error_count++;
	}
	if(int_rate == '') {
		$('#debt-form input[name="int_rate"]').addClass('hasError');
		$('#debt-form input[name="int_rate"]').after('<div class="helper error">You must enter an interest rate</div>');
		error_count++;
	}
	if(beg_balance == '') {
		$('#debt-form input[name="beg_balance"]').addClass('hasError');
		$('#debt-form input[name="beg_balance"]').after('<div class="helper error">You must enter a beginning balance</div>');
		error_count++;
	}
	if(beg_date == '') {
		$('#debt-form input[name="beg_date"]').addClass('hasError');
		$('#debt-form input[name="beg_date"]').after('<div class="helper error">You must enter a beginning date</div>');
		error_count++;
	}
	if(cur_balance == '') {
		$('#debt-form input[name="cur_balance"]').addClass('hasError');
		$('#debt-form input[name="cur_balance"]').after('<div class="helper error">You must enter a current balance</div>');
		error_count++;
	}
	if(due_date == '') {
		$('#debt-form select[name="due_date"]').addClass('hasError');
		$('#debt-form select[name="due_date"]').after('<div class="helper error">You must enter a due date</div>');
		error_count++;
	}
	if(loan_term == '') {
		$('#debt-form input[name="loan_term"]').addClass('hasError');
		$('#debt-form input[name="loan_term"]').after('<div class="helper error">You must enter a loan term</div>');
		error_count++;
	}
	if(error_count > 0 ) {

		return false;
	}
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'debt',
			'format': 'json',
			'user_id' : user_id, 
			'title': title, 
			'int_rate': int_rate, 
			'beg_balance': beg_balance, 
			'cur_balance': cur_balance, 
			'due_date': due_date, 
			'beg_date': beg_date, 
			'loan_term': loan_term, 
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				//show confirm
				//set global for step 1
				setStorage('step_1_completed', 1);
				confirm_dialog('<h3><i class="fa fa-thumbs-o-up green" aria-hidden="true"></i>Your input has been saved!</h3><p>Would you like to add another debt, or proceed to income?</p>', 'Add Another', 'Proceed To Income',
					function() {
						//yes clicked - clear Form and show
						$('#debt-form input[name="debt_title"]').val('');
						$('#debt-form input[name="int_rate"]').val('');
						$('#debt-form input[name="beg_balance"]').val('');
						$('#debt-form input[name="beg_date"]').val('');
						$('#debt-form input[name="loan_term"]').val('');
						$('#debt-form input[name="cur_balance"]').val(''); 
						$('#debt-form select[name="due_date"]').val('');
					},
					function() {
						//No -- show income and hide debt form
						$('#step-add-debt').hide();
						$('#step-add-income').show();
						$('#step1').removeClass('active');
						$('#step2').addClass('active');
					}
				);
				
			}
			else {
				loading('hide');
				$('#debt-form').prepend('<div class="alert alert-error">' + obj.msg + '</div>');
			}
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.saveIncomebtn', function() {
	//We will save via ajax, once saved, ask to add another debt or proceed to income
	var error_count = 0;
	$('.helper').remove();
	var user_id = getStorage('user_id');
	var title = $('#income-form input[name="income_title"]').val();
	var inc_amount = $('#income-form input[name="inc_amount"]').val();
	var income_often = $('#income-form select[name="income_often"]').val();
	if(title == '') {
		$('#income-form input[name="income_title"]').addClass('hasError');
		$('#income-form input[name="income_title"]').after('<div class="helper error">You must enter a title</div>');
		error_count++;
	}
	if(inc_amount == '') {
		$('#income-form input[name="inc_amount"]').addClass('hasError');
		$('#income-form input[name="inc_amount"]').after('<div class="helper error">You must enter an amount</div>');
		error_count++;
	}
	if(income_often == '') {
		$('#income-form input[name="income_often"]').addClass('hasError');
		$('#income-form input[name="income_often"]').after('<div class="helper error">Please select how often</div>');
		error_count++;
	}
	if(error_count > 0 ) {

		return false;
	}
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'income',
			'format': 'json',
			'user_id' : user_id, 
			'title': title, 
			'inc_amount': inc_amount, 
			'income_often': income_often,  
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				//show confirm
				
				//set global for step 2
				setStorage('step_2_completed', 1);
				confirm_dialog('<h3><i class="fa fa-thumbs-o-up green" aria-hidden="true"></i>Your input has been saved!</h3><p>Would you like to add another income, or proceed to payoff strategy?</p>', 'Add Another', 'Proceed To Strategy',
					function() {
						//yes clicked - clear Form and show
						$('#income-form input[name="income_title"]').val('');
						$('#income-form input[name="inc_amount"]').val('');
						$('#income-form select[name="income_often"]').val('');
					},
					function() {
						//No -- show income and hide debt form
						$('#step-add-debt').hide();
						$('#step-add-income').hide();
						$('#step-add-plan').show();
						$('#step1').removeClass('active');
						$('#step2').removeClass('active');
						$('#step3').addClass('active');
					}
				);	
			}
			else {
				loading('hide');
				$('#income-form').prepend('<div class="alert alert-error">' + obj.msg + '</div>');
			}
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});



$(document).on('click', '.savePlanbtn', function() {
	//We will save via ajax, once saved, ask to add another debt or proceed to income
	var error_count = 0;
	$('.helper').remove();
	var user_id = getStorage('user_id');
	var strategy = $('#plan-form input[name="strategy"]:checked').val();
	if(strategy == '' || strategy === null || strategy === undefined) {
		$('#plan-form').addClass('hasError');
		$('#plan-form').prepend('<div class="helper error">Please select how often</div>');
		error_count++;
	}
	if(error_count > 0 ) {
		return false;
	}
	
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'plan',
			'format': 'json',
			'user_id' : user_id, 
			'strategy': strategy,  
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				//show confirm	
				//set global for step 2
				setStorage('step_3_completed', 1);
				confirm_dialog('<h3><i class="fa fa-thumbs-o-up green" aria-hidden="true"></i>Your input has been saved!</h3><p>Click below to go to your dashboard</p>', 'Dashboard', '',
					function() {
						//yes clicked - clear Form and show
						mainView.router.loadPage('index.html');
					},
					function() {
						//No -- show income and hide debt form
						mainView.router.loadPage('index.html');
					}
				);	
			}
			else {
				loading('hide');
				$('#plan-form').prepend('<div class="alert alert-error">' + obj.msg + '</div>');
			}
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});


function loading(method) {
	if(method === 'show' || method === '') {
		$('body').append('<div class="page-overlay"><div class="loading"><span style="width:42px; height:42px" class="preloader preloader-white"></span></div></div>');
	}
	else if(method === 'hide') {
		$('.page-overlay').fadeOut('fast', function() {
			$(this).remove();
		});
	}
}

function isLoggedIn() {

	if(getStorage('applogin') !== '' && getStorage('applogin') !== null && getStorage('user_id') != null) {
		return true;
	}
	return false;	
}

function setStorage(name, value) {
	storage.setItem(name, value);
}

function getStorage(name) {
	var val = storage.getItem(name);
	return val;
}

function deleteStorage(name) {
	//alert("DELETED");
	storage.removeItem(name);
	if(name === 'applogin') {
		storage.removeItem('id');
		storage.removeItem('user_id');
		storage.removeItem('first_name');
		storage.removeItem('last_name');
		storage.removeItem('email');
	}
}

function modalOpen(id) {
	$('.app-modal').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
}

function modalClose() {
	$('.app-modal').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function confirm_dialog(message, yesBtnText, noBtnText, yesCallback, noCallback) {
	if(yesBtnText != null && yesBtnText != '') {
		$('#btnYes').text(yesBtnText);
	}
	console.log("NBT: " + noBtnText);
	if(noBtnText != null && noBtnText != '') {
		$('#btnNo').text(noBtnText);
		$('#btnNo').show();
	}
	else {
		$('#btnNo').hide();
	}
	$('#confirm').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
	$('#confirm .title').html(message);
	//var confirm_dialog = $('#confirm').confirm_dialog();

	$('#btnYes').click(function() {
		confirm_dialog_close();
		yesCallback();
	});
	$('#btnNo').click(function() {
		confirm_dialog_close();
		noCallback();
	});
}

function confirm_dialog_close() {
	$('#confirm').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}





$(document).on('click', '.deleteAcctBtn', function() {
	var id = $(this).attr('data-id');
	console.log("ID: " + id);
	confirm_dialog('<h3><i class="typcn typcn-delete-outline"></i>Are you sure you want to delete this account?</h3><p>This will remove the account and is irreversible</p>', '', '',
		function() {
			//delete payment
			$$.ajax({
				url : serviceURL,
				type : 'POST',
				data : {
					'method': 'delete',
					'action': 'account',
					'format': 'json',
					'id' : id,
				},
				dataType: 'html',
				beforeSend: function() {
					loading('show');
			  	},
				success : function(data) {
				console.log("DATA: " + data);
					var obj = $.parseJSON(data);
					if(obj.code === 1) {
						$('#acct-id-input').val('');
						buildDashboard();
						loading('hide');
					}
					else {
						//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
						loading('hide');
					}
				},
				error : function(request,error) {
					console.log("Request (error): "+JSON.stringify(request));
					loading('hide');
				}
			});
		},
		function() {
			//No -- Do nothing
			$('html,body').animate({
				scrollTop: $("#payments-container").offset().top
			}, 'slow');
		}
	);

});

$(document).on('click', '.changepayStatus', function() {
	var id = $(this).attr('data-id');
	var status = $(this).attr('data-status');
	console.log(status);
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'payment_status',
			'format': 'json',
			'id' : id, 
			'status': status
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				if(status == 1) {
					$('#pay-status-' + id).find('i').removeClass('payClr');
					$('#pay-status-' + id).find('i').addClass('payNot');
					$('#pay-status-' + id).find('i').attr('data-status', 0);
					$('#pay-container-' + id).find('.cancelPaymentBtn').show();
				}
				else {
					$('#pay-status-' + id).find('i').addClass('payClr');
					$('#pay-status-' + id).find('i').removeClass('payNot');
					$('#pay-status-' + id).find('i').attr('data-status', 1);
					$('#pay-container-' + id).find('.cancelPaymentBtn').hide();
				}
				loading('hide');

			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				loading('hide');
			}
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.cancelPaymentBtn', function() {
	$('.alert').remove();
	var id = $(this).attr('data-id');
	console.log("ID: " + id);
	confirm_dialog('<h3><i class="typcn typcn-delete-outline"></i>Are you sure you want to delete this payment?</h3><p>This will remove the payment and is irreversible</p>',
		function() {
			//delete payment
			$$.ajax({
				url : serviceURL,
				type : 'POST',
				data : {
					'method': 'delete',
					'action': 'payment',
					'format': 'json',
					'id' : id,
				},
				dataType: 'html',
				beforeSend: function() {
					loading('show');
			  	},
				success : function(data) {
				console.log("DATA: " + data);
					var obj = $.parseJSON(data);
					if(obj.code === 1) {
						$('#pay-container-' + id).fadeOut().remove();
						$('#payments-table').before('<div class="alert alert-success">Payment successfully deleted</div>');
						loading('hide');
					}
					else {
						//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
						loading('hide');
					}
				},
				error : function(request,error) {
					console.log("Request (error): "+JSON.stringify(request));
					loading('hide');
				}
			});
		},
		function() {
			//No -- Do nothing
			$('html,body').animate({
				scrollTop: $("#payments-container").offset().top
			}, 'slow');
		}
	);
});


$(document).on('click', '.account', function() {
	mainView.router.loadPage('account_overview.html');
});

function showAccountSetupScreen(id) {
	console.log(id);
	$('.app-modal-title').html('Setup Account');
	if(id !== null) {
		$('.app-modal-title').html('Update Account');
	}
	$('.app-modal').attr('id', 'account-setup-modal');
	var form = '';
	//see if user has more accounts
	/*if(id == null && getStorage('account_count') >= getStorage('max_accounts')) {
		form += '<h1>You have reached the maximum accounts</h1>';
		form += '<p>Click below to upgrade your account to unlock unlimited accounts</p>';
		$('.modal-footer').html('<a href="upgrade.html" class="btn btn-primary">Upgrade Account</a> <button type="button" class="btn btn-danger closeModal">Cancel</button>');
	}
	else {*/
		//Form
		form += '<form id="acctSetupFrm" method="post">';
		var orig_date = '';
		if(id !== null) {
			form += '<input type="hidden" name="id" value="' + id + '">';
			var orig_date = $('input[name="start_date"]').val().replace(/-/g, '/');
			var today = new Date(orig_date);
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
				dd = '0'+dd
			} 
	
			if(mm<10) {
				mm = '0'+mm
			} 
			orig_date = mm + '/' + dd + '/' + yyyy;	
		}
		var account_title = (id !== null) ? $('input[name="account_title"]').val() : '';
		var account_number = (id !== null) ? $('input[name="account_number"]').val() : '';
		var loan_amount = (id !== null) ? $('input[name="loan_amount"]').val() : '';
		
		var loan_term = (id !== null) ? $('input[name="loan_term"]').val() : '';
		var int_rate = (id !== null) ? $('input[name="int_rate"]').val() : '';
		var due_date = (id !== null) ? $('input[name="due_date"]').val() : '';
		form += '<div class="form-group">';
		form += '<label for="account_title">Account Title:</label>';
		form += '<input type="text" name="account_title" id="account_title" placeholder="Account Title" value="' + account_title + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="account_number">Account Number:</label>';
		form += '<input type="text" name="account_number" id="account_number" placeholder="Account Number" value="' + account_number + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="account_number">Loan Amount:</label>';
		form += '<input type="text" name="loan_amount" id="loan_amount" placeholder="Loan Amount" value="' + loan_amount + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="orig_date">Start Date:</label>';
		form += '<input type="date" name="orig_date" id="orig_date" class="datepicker" placeholder="" value="' + orig_date + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="due_date">Due Date:</label>';
		form += '<select name="due_date" id="due_date" class="">';
		for (i = 1; i <= 31; i++) {
			var j = i % 10,
			k = i % 100;
			if (j == 1 && k != 11) {
				ord = i + "st";
			}
			else if (j == 2 && k != 12) {
				 ord = i + "nd";
			}
			else if (j == 3 && k != 13) {
				ord =i + "rd";
			}
			else {
				ord = i + "th";
			}
			form += '<option value="' + i + '"';
			if( i == due_date) {
				form += ' selected';
			}
			form += '>' + ord + '</option>';
		}
		form += '</select>';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="loan_term">Loan Term <small>(Months)</small>:</label>';
		form += '<input type="text" name="loan_term" id="loan_term" placeholder="Loan Term" value="' + loan_term + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="int_rate">Interest Rate:</label>';
		form += '<input type="text" name="int_rate" id="int_rate" placeholder="Interest Rate" value="' + int_rate + '">';
		form += '</div>';
		form += '</form>';
		$('.modal-footer').html('<button type="button" class="btn btn-primary saveAcctBtn">Save Changes</button> <button type="button" class="btn btn-danger closeModal">Cancel</button>');
	/*}*/
	$('.modal-body').html(form);
	
	modalOpen('account-setup-modal');
}

function saveAcct() {
	var error_count = 0;
	$('.helper').remove();
	var user_id = getStorage('user_id');
	//check required
	var id = $('#acctSetupFrm input[name="id"]').val();
	var account_title = $('#acctSetupFrm input[name="account_title"]').val();
	var account_number = $('#acctSetupFrm input[name="account_number"]').val();
	var loan_term = $('#acctSetupFrm input[name="loan_term"]').val();
	var loan_amount = $('#acctSetupFrm input[name="loan_amount"]').val();
	var orig_date = $('#acctSetupFrm input[name="orig_date"]').val();
	var due_date = $('#acctSetupFrm select[name="due_date"]').val();
	var int_rate = $('#acctSetupFrm input[name="int_rate"]').val();
//console.log("ACCT NUMBER: " + account_number);
	//verify data 
	if(account_title == '') {
		$('#acctSetupFrm input[name="account_title"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="account_title"]').after('<div class="helper">Account title required</div>');
		error_count++;
	}

	if(account_number == '') {
		$('#acctSetupFrm input[name="account_number"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="account_number"]').after('<div class="helper">Account number required</div>');
		error_count++;
	}

	if(loan_term == '') {
		$('#acctSetupFrm input[name="loan_term"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="loan_term"]').after('<div class="helper">Loan term required</div>');
		error_count++;
	}

	if(orig_date == '') {
		$('#acctSetupFrm input[name="orig_date"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="orig_date"]').after('<div class="helper">Loan origination date required</div>');
		error_count++;
	}

	if(due_date == '') {
		$('#acctSetupFrm select[name="due_date"]').parent('div').addClass('hasError');
		$('#acctSetupFrm select[name="due_date"]').after('<div class="helper">Loan due date required</div>');
		error_count++;
	}

	if(int_rate == '') {
		$('#acctSetupFrm input[name="int_rate"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="int_rate"]').after('<div class="helper">Interest rate required</div>');
		error_count++;
	}

	if(error_count > 0 ) {

		return false;
	}

	//console.log(site_url + "lib/inc/ajax.inc.php");
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'save_account',
			'format': 'json',
			'id': id, 
			'user_id': user_id, 
			'account_title': account_title, 
			'account_number': account_number, 
			'loan_amount': loan_amount, 
			'loan_term': loan_term, 
			'orig_date': orig_date, 
			'due_date': due_date, 
			'int_rate': int_rate
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				location.reload(); 
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
}

function registerPushToken() {
	var token = getStorage('registrationId');
	var user = getStorage('user_id');
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'push_token',
			'format': 'json',
			'token': token, 
			'user': user,
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				location.reload(); 
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
}

function buildDashboard() {
	console.log("Building Dashboard");
	$('body').append('<div class="page-overlay"><div class="loading"><span style="width:42px; height:42px" class="preloader preloader-white"></span></div></div>');
	$('#user-id-input').val()
	var user_id = getStorage('user_id');
	var dashboard_html = '';
	
	
	/*
	$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method' : 'get',
			'action' : 'dashboard',
			'format' : 'json',
			'user' : user_id,
			'acct': acct_id
		},
		dataType:'html',
		beforeSend: function() {
			
	  	},
		success : function(data) {              
			console.log('Dashboard Data: ' + data);
			//Register push Token
			if(getStorage('registrationId') !== '') {
				registerPushToken();
			}
			var obj = $.parseJSON(data);
			$('#dashboard-container').html('');
			var dashboard_html = '';
			if(obj.data.acct != '' && obj.data.acct != null) {
				//obj.data.id;
				//console.log(obj.data.acct.id);
				$('#acct-id-input').val(obj.data.acct.id);
				//alerts 
				if(obj.data.unread_alert_count != '' && obj.data.unread_alert_count > 0) {
					var alert_count = (obj.data.unread_alert_count > 9) ? '9+' : obj.data.unread_alert_count ;
					$('.halerts i').after('<span class="alert-count">' + alert_count + '</span>');
				}
				var alerts = '';
				if(obj.data.alerts != '' && obj.data.alerts != null) {
					alerts += '<ul>';
					$.each( obj.data.alerts, function( index, value ) {
						/*console.log(obj.data.alerts[index].id);*\/
						alerts += '<li>';
						var icon = '<i class="typcn typcn-bell"></i>';
						if(obj.data.alerts[index].type == 'payment') {
							icon = '<i class="fa fa-usd"></i>';
						}
						alerts += '<div id="alert-tr-'  + obj.data.alerts[index].id + '" class="alert-div';
						if(obj.data.alerts[index].alert_read == 1) {
							alerts += ' read';
						}
						alerts += '"><div class="alert-icon">' + icon + '</div>';
						alerts += '<div class="alert-text"><h4 style="margin: 0; line-height: 1em;">'  + obj.data.alerts[index].alert_text + '<h4><small>'  + obj.data.alerts[index].time_ago + '</small></div></div>';
						alerts += '<div class="clr"></div>';
						alerts += '</li>';
					});
					alerts += '</ul>';
				}
				$('.alerts-container').html(alerts);
				//Loan Overview
				//dashboard_html += '';
				//	});
				//}
				//else {
					dashboard_html += '<p style="text-align: center;">You have not entered any payments.</p> <span class="makePaymentBtn btn btn-primary">Click here to get started</span>';
				//}

				//dashboard_html += '</div>';
				//dashboard_html += '</div>';
				//dashboard_html += '</div>';
				//dashboard_html += '<div class="clr"></div>';

				//dashboard_html += '<div id="app-rate"><img src="lib/icon/rate_app.png"></div>';
				//$('#payments-container').html(payments_html);
				//$.mobile.loading('hide');
				$('#dashboard-container').html(dashboard_html);
				if(obj.data.acct.int_saved != '' && obj.data.acct.int_saved != null) {
					$("#savings-circle").circliful({
						animationStep: 5,
						foregroundBorderWidth: 23,
						backgroundBorderWidth: 25,
						percent: saved_percent,
						icon: 'f155',
						iconSize: '40',
						iconPosition: 'middle',
						showPercent: 1,
						target: 0,
						noPercentageSign: true,
						replacePercentageByText: "$" + int_saved,
						percentageTextSize: '14'
					});
				}
			}
			else {
				dashboard_html += '<center><img src="lib/icon/icon-2.png" style="margin: 20px auto 0;"></center><h2 style="text-align: center; margin-top: 30px;">You do not have any accounts setup</h2><p style="text-align: center;">If you would like to get started saving money, click the button below!</p><span class="newAcctBtn btn btn-primary" style="text-transform: uppercase;">Click here to get started</span>';
				$('#dashboard-container').html(dashboard_html);
			}
			$('.page-overlay').fadeOut('fast', function() {
				$(this).remove();
			});
			
			
		},
		error : function(request,error) {
			//alert("Dashboard Request (error): " + JSON.stringify(request));
			//$.mobile.loading('hide');
			$('.page-overlay').fadeOut('fast', function() {
				$(this).remove();
			});
		}
	});
	*/
	
	$('.page-overlay').fadeOut('fast', function() {
		$(this).remove();
	});
	if(getStorage('step_3_completed')== 1) {
		dashboard_html += '<h1 class="payoff-center">Payoff Plan</h2>';
		dashboard_html += '<ul id="accts-list">';
		//
		dashboard_html += '<li>';
		dashboard_html += '<span class="phase-bubble"><span class="phase-title">Phase</span><span class="phase-count">1</span><span class="phase-weeks">21 Weeks</span></span>';
		dashboard_html += '<div class="accounts">';
		//account loop
		dashboard_html += '<div class="account">';
		dashboard_html += '<span class="account-title">Jeep Payment - Carmax</span>';
		dashboard_html += '<span class="account-balance">$5,000.00</span>';
		//dashboard_html += '<span class="account-actions"><i class="fa fa-plus-circle account-add green"></i> <i class="fa fa-minus-circle account-add red"></i></span>';
		dashboard_html += '</div>';
		
		dashboard_html += '<div class="account">';
		dashboard_html += '<span class="account-title">Car Payment - Capital One</span>';
		dashboard_html += '<span class="account-balance">$25,000.00</span>';
		//dashboard_html += '<span class="account-actions"><i class="fa fa-plus-circle account-add green"></i> <i class="fa fa-minus-circle account-add red"></i></span>';
		dashboard_html += '</div>';
		
		dashboard_html += '<div class="account">';
		dashboard_html += '<span class="account-title">Credit Car # 1 Payment - Capital One Venture</span>';
		dashboard_html += '<span class="account-balance">$1,000.00</span>';
		//dashboard_html += '<span class="account-actions"><i class="fa fa-plus-circle account-add green"></i> <i class="fa fa-minus-circle account-add red"></i></span>';
		dashboard_html += '</div>';
		
		// end acct loop
		dashboard_html += '</div><div class="clr"></div>';
		dashboard_html += '</li>';
		//
		dashboard_html += '<li>';
		dashboard_html += '<span class="phase-bubble"><span class="phase-title">Phase</span><span class="phase-count">2</span><span class="phase-weeks">12 Weeks</span></span>';
		dashboard_html += '<div class="accounts">';
		//account loop
		dashboard_html += '<div class="account">';
		dashboard_html += '<span class="account-title">Jeep Payment - Carmax</span>';
		dashboard_html += '<span class="account-balance">$5,000.00</span>';
		//dashboard_html += '<span class="account-actions"><i class="fa fa-plus-circle account-add green"></i> <i class="fa fa-minus-circle account-add red"></i></span>';
		dashboard_html += '</div>';
		
		dashboard_html += '<div class="account">';
		dashboard_html += '<span class="account-title">Car Payment - Capital One</span>';
		dashboard_html += '<span class="account-balance">$25,000.00</span>';
		//dashboard_html += '<span class="account-actions"><i class="fa fa-plus-circle account-add green"></i> <i class="fa fa-minus-circle account-add red"></i></span>';
		dashboard_html += '</div>';
		
		dashboard_html += '<div class="account">';
		dashboard_html += '<span class="account-title">Credit Car # 1 Payment - Capital One Venture</span>';
		dashboard_html += '<span class="account-balance">$1,000.00</span>';
		//dashboard_html += '<span class="account-actions"><i class="fa fa-plus-circle account-add green"></i> <i class="fa fa-minus-circle account-add red"></i></span>';
		dashboard_html += '</div>';
		
		// end acct loop
		dashboard_html += '</div><div class="clr"></div>';
		dashboard_html += '</li>';
		
		dashboard_html += '</ul>';
	}
	else {
		dashboard_html += '<center><img src="lib/icon/icon-2.png" style="margin: 20px auto 0;"></center><h2 style="text-align: center; margin-top: 30px;">Welcome to DebtZapper!</h2><p style="text-align: center;">If you would like to get started paying down your debt, click the button below!</p><a class="getStartedBtn btn btn-primary" style="text-transform: uppercase;" href="get_started.html">Click here to get started</a>';
	}
	$('#dashboard-container').html(dashboard_html);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}