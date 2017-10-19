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
	console.log(e);
	/*console.log("PAGE NAME: " + page.name);*/
	if (page.name === 'index') {
		//console.log('INDEX, CHECK LOGGIN: ' + isLoggedIn());
		if($('#acct-id-input').val() == '') {
			$('#acct-id-input').val(getStorage('acct-id'));
			buildDashboard();
		}
	}
    
	if (page.name === 'account_overview') {
		//var id = getUrlVars()["id"];
		var id = page.query.id;
		//Ajax to get account info
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'account_data',
				'format': 'json',
				'id': id
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				if(obj.resp == true) {
					var notes = (obj.data.account_notes != null) ? obj.data.account_notes : '';
					//var beg_date = (data.beg_date != null) ? formatDate(new Date(obj.data.beg_date)) : ''; //obj.data.beg_date_formatted
					var j = obj.data.due_date % 10,
						k = obj.data.due_date % 100;
					if (j == 1 && k != 11) {
						var dnth = obj.data.due_date + "st";
					}
					else if (j == 2 && k != 12) {
						var dnth = obj.data.due_date + "nd";
					}
					else if (j == 3 && k != 13) {
						var dnth = obj.data.due_date + "rd";
					}
					else {
						var dnth = obj.data.due_date + "th";
					}
					var form_html = '';
					form_html += '<h2><span class="account-data">' + obj.data.title + '</span><span class="account-input"><input type="text" name="title" class="" value="' + obj.data.title + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></h2>';
					form_html += '<input type="hidden" name="account_id" value="' + id + '">';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Balance:</label><b>$<span class="account-data">' + obj.data.cur_balance + '</span><span class="account-input"><input type="text" name="cur_balance" class="" value="' + obj.data.cur_balance + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></b>';
					form_html += '</div>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Due Date:</label><b><span class="account-data">' + dnth + '</span><span class="account-input"><select name="due_date" class="">';
					form_html += '<option value="">Due Date</option>';
					for (i = 1; i <= 31; i++) {
						var j = i % 10,
							k = i % 100;
						if (j == 1 && k != 11) {
							var nth = i + "st";
						}
						else if (j == 2 && k != 12) {
							var nth = i + "nd";
						}
						else if (j == 3 && k != 13) {
							var nth = i + "rd";
						}
						else {
							var nth = i + "th";
						}
						form_html += '<option value="' + i + '"';
						if(obj.data.due_date == i) {
						   form_html += ' selected';
						}
						form_html += '>' + nth + '</option>';
					} 
					form_html += '</select><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></b>';
					form_html += '</div>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Monthly Payment:</label><b>$<span class="account-data">' + obj.data.monthly_payment + '</span><span class="account-input"><input type="text" name="monthly_payment" class="" value="' + obj.data.monthly_payment + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></b>';
					form_html += '</div>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Interest Rate:</label><b><span class="account-data">' + obj.data.int_rate + '</span><span class="account-input"><input type="text" name="int_rate" class="" value="' + obj.data.int_rate + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span>%</b><br>';
					form_html += '</div>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Beginning Balance:</label><b>$<span class="account-data">' + obj.data.beg_balance + '</span><span class="account-input"><input type="text" name="beg_balance" class="" value="' + obj.data.beg_balance + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></b>';
					form_html += '</div>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Beginning Date:</label><b><span class="account-data">' + obj.data.beg_date_formatted + '</span><span class="account-input"><input type="text" name="beg_date" class="" value="' + obj.data.beg_date + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></b>';
					form_html += '</div>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<label for="">Loan Term (months):</label><b><span class="account-data">' + obj.data.loan_term + '</span><span class="account-input"><input type="text" name="loan_term" class="" value="' + obj.data.loan_term + '"><button type="button" class="btn btn btn-primary btn-sm saveAcctBtn"><i class="fa fa-floppy-o"></i></button></span></b>';
					form_html += '</div>';
					form_html += '<button class="btn btn-danger">Delete/Pay Off</button>';
         			form_html += '<hr>';
         			form_html += '<h3>Enter Additional Notes</h3>';
					form_html += '<div class="acct-form-grp">';
					form_html += '<textarea class="ta1" name="account_notes">' + notes + '</textarea> <button type="button" class="btn btn btn-primary btn-sm saveAcctBtn saveNotesBtn"><i class="fa fa-floppy-o"></i> Save Notes</button>';
					form_html += '</div>';
					$('#account-edit-form').html(form_html);
					
				}
				else {
					
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
	if (page.name === 'overview') {
		
		var page_html = '';
		var chart_data = [];
		var chart_labels = [];
		var chart_colors = [
			'rgb(255, 99, 132)',
			'rgb(54, 162, 235)',
			'rgb(154, 235, 59)'
		];
		
		var user_id = getStorage('user_id');
		
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'get_overview',
				'format': 'json',
				'user_id': user_id
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
			},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				
				if(obj.resp === true) {
					chart_data.push(parseFloat(obj.data.total_debt).toFixed(2));
					chart_labels.push('Debt');
					chart_data.push(parseFloat(obj.data.total_bills).toFixed(2));
					chart_labels.push('Bills');
					chart_data.push(parseFloat(obj.data.total_income).toFixed(2));
					chart_labels.push('Income');
					
					
					//page_html += '<div class="ov-chart" id="ov-chart"></div>';
					page_html += '<div id="canvas-holder" style="width:100%; min-height: 300px; margin-bottom: 40px; ">';
					page_html += '<canvas id="ov-chart" />';
					page_html += '</div>';
					page_html += '<div class="ov-label">Total Debt</div>';
					page_html += '<div class="ov-total"><span class="ov-dollar">$</span><span id="roll-debt" class="">0</span> <small>/mo.</small></div>';
					page_html += '<div class="ov-link"><a href="debt.html">View Debt</a></div>';
					page_html += '<hr>';
					page_html += '<div class="ov-label">Total Bills</div>';
					page_html += '<div class="ov-total"><span class="ov-dollar">$</span><span id="roll-bills" class="">0</span> <small>/mo.</small></div>';
					page_html += '<div class="ov-link"><a href="bills.html">View Bills</a></div>';
					page_html += '<hr>';
					page_html += '<div class="ov-label">Total Income</div>';
					page_html += '<div class="ov-total"><span class="ov-dollar">$</span><span id="roll-income" class="';
					if(parseInt(obj.data.total_diff) < 0) {
						page_html += 'negative';
					}
					page_html += '">0</span> <small>/mo.</small></div>';
					page_html += '<div class="ov-link"><a href="income.html">View Income</a></div>';
					page_html += '<hr>';
					page_html += '<div class="ov-label">Diff</div>';
					page_html += '<div class="ov-total"><span class="ov-dollar">$</span><span id="roll-diff" class="">0</span> <small>/mo.</small></div>';
					page_html += '<hr>';
					page_html += '<div class="ov-label">Payoff Strategy</div>';
					page_html += '<div class="ov-text">' + obj.data.strategy + '</div>';
					page_html += '<hr>';
					page_html += '<div class="ov-label">Monthly Earmark</div>';
					page_html += '<div class="ov-text">' + obj.data.payoff_earmark + '</div>';
					page_html += '<hr>';
					page_html += '<div class="ov-label">Payoff Rollover</div>';
					page_html += '<div class="ov-text">' + obj.data.rollover + '</div>';
					page_html += '<div class="ov-subtext">' + obj.data.rollover_info + '</div>';
					
					$('#overview-container').html(page_html);

					var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
					setTimeout(function(){ 
						$('#roll-debt').animateNumber(
						  {
							number: obj.data.total_debt,
							numberStep: comma_separator_number_step
						  }
						);

						$('#roll-income').animateNumber(
						  {
							number: obj.data.total_income,
							numberStep: comma_separator_number_step
						  }
						);
						
						$('#roll-bills').animateNumber(
						  {
							number: obj.data.total_bills,
							numberStep: comma_separator_number_step
						  }
						);

						$('#roll-diff').animateNumber(
						  {
							number: obj.data.total_diff,
							numberStep: comma_separator_number_step
						  }
						);
					}, 500);

					var config = {
						type: 'doughnut',
						data: {
							datasets: [{
								data: chart_data,
								backgroundColor: chart_colors,
								label: 'Dataset 1'
							}],
							labels: chart_labels
						},
						options: {
							responsive: true,
							legend: {
								position: 'top',
							},
							title: {
								display: true,
								text: 'Debt/Income Ratio'
							},
							animation: {
								animateScale: true,
								animateRotate: true
							},
							maintainAspectRatio: false
						}
					};

					var ctx = document.getElementById('ov-chart').getContext("2d");
					ctx.height = 300;
					window.myDoughnut = new Chart(ctx, config);
				}
				
				
				
				loading('hide');
			},
			error : function(request,error) {
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});
	}
	if (page.name === 'debt') {
		
		var user_id = getStorage('user_id');
		var page_html = '';
		
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'get_debt',
				'format': 'json',
				'user_id': user_id
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
			},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				
				if(obj.resp === true) {
					page_html += '<div class="ov-label">Total Debt</div>';
					page_html += '<div class="ov-total">$' + obj.data.total_debt.formatMoney(2, '.', ',') + ' <small>per mo.</small></div>';
					var tdebt = obj.data.total_debt;
					delete obj.data.total_debt;
					page_html += '<hr>';
					page_html += '<div class=""><button class="btn btn-secondary addDebt">+ Add Debt</button></div>';
					page_html += '<table class="table striped">';
					$.each( obj.data, function( i, data ) {
						//
						page_html += '<tr>';
						page_html += '<td>';
						page_html += '<h3>' + data.title + '</h3>';
						page_html += '<small>Int. Rate: <b>' + data.int_rate + '%</b><br>Bal.: <b>$' + parseFloat(data.cur_balance).formatMoney(2, '.', ',') + '</b></small>';
						page_html += '</td>';
						page_html += '<td>$' + data.monthly_payment + '</td>';
						page_html += '<td class="actions"><button class="btn btn-xs btn-primary editDebt" data-id="' + data.id + '"><i class="fa fa-pencil"></i></button> <button class="btn btn-xs btn-danger deleteDebt" data-id="' + data.id + '"><i class="fa fa-trash"></i></button></td>';
						page_html += '</tr>';
					});
					tdebt
					page_html += '<tr><td><h3>Total debt</h3></td>' + tdebt + '<td></td><td></td></tr>';
					page_html += '</table>';
					$('#debt-container').html(page_html);
				}
				loading('hide');
			},
			error : function(request,error) {
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}	
		});
		
	}
	if (page.name === 'income') {
		var user_id = getStorage('user_id');
		var page_html = '';
		
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'get_income',
				'format': 'json',
				'user_id': user_id
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
			},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				
				if(obj.resp === true) {
					
					page_html += '<div class="ov-label">Total Income</div>';
					page_html += '<div class="ov-total">$' + obj.data.total_income.formatMoney(2, '.', ',') + ' <small>per mo.</small></div>';
					delete obj.data.total_income;
					page_html += '<hr>';
					page_html += '<div class=""><button class="btn btn-secondary addIncome">+ Add Income</button></div>';
					page_html += '<table class="table striped">';
					
					$.each( obj.data, function( i, data ) {
						page_html += '<tr>';
						page_html += '<td>';
						page_html += '<h3>' + data.title + '</h3>';
						page_html += '<small>$' + data.amount + ' ' + data.freq + '</small>';
						page_html += '</td>';
						page_html += '<td>$' +  parseFloat(data.total_monthly).formatMoney(2, '.', ',') + '<small>/mo.</small></td>';
						page_html += '<td class="actions"><button class="btn btn-xs btn-primary"><i class="fa fa-pencil"></i></button> <button class="btn btn-xs btn-danger"><i class="fa fa-trash"></i></button></td>';
						page_html += '</tr>';
					});
					
					page_html += '</table>';
					$('#income-container').html(page_html);
				}
				loading('hide');
			},
			error : function(request,error) {
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}	
		});
	}
	if (page.name === 'bills') {
		var user_id = getStorage('user_id');
		var page_html = '';
		
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'get_bills',
				'format': 'json',
				'user_id': user_id
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
			},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				
				if(obj.resp === true) {
					
					page_html += '<div class="ov-label">Total Bills</div>';
					page_html += '<div class="ov-total">$' + obj.data.total_bills.formatMoney(2, '.', ',') + ' <small>per mo.</small></div>';
					delete obj.data.total_bills;
					page_html += '<hr>';
					page_html += '<div class=""><button class="btn btn-secondary addBill">+ Add Bill</button></div>';
					page_html += '<table class="table striped">';
					
					$.each( obj.data, function( i, data ) {
						page_html += '<tr>';
						page_html += '<td>';
						page_html += '<h3>' + data.title + '</h3>';
						page_html += '<small>$' + data.amount + ' ' + data.freq + '</small>';
						page_html += '</td>';
						page_html += '<td>$' + parseFloat(data.total_monthly).formatMoney(2, '.', ',') + '<small>/mo.</small></td>';
						page_html += '<td class="actions"><button class="btn btn-xs btn-primary"><i class="fa fa-pencil"></i></button> <button class="btn btn-xs btn-danger"><i class="fa fa-trash"></i></button></td>';
						page_html += '</tr>';
					});
					
					page_html += '</table>';
					$('#bills-container').html(page_html);
				}
				loading('hide');
			},
			error : function(request,error) {
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}	
		});
	}
	
	/*
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
				/*console.log('Data: ' + data);*\/ 
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code); *\/
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
				/*console.log('Resp: ' + obj.code); *\/
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
			/*console.log('Data: ' + data);*\/ 
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code);*\/
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
							/*console.log("ID: " + id);*\/
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
	*/
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

$(window).bind('load resize scroll',function(e){
	console.log("TOTAL ON SCREEN: " + $('.ov-total').isOnScreen());
});

$(document).on('click', '.editDebt', function() {
	var id = $(this).attr('data-id');
	var user_id = getStorage('user_id');
	//Get Debt Info
	$('.app-modal-title').html('Edit Debt');
	var form_html = '';
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'get',
			'action': 'get_debt',
			'format': 'json',
			'id': id,
			'user_id': user_id
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			console.log('Data: ' + data);
			var obj = $.parseJSON(data);
			loading('hide');
			/*console.log('Resp: ' + obj.code);*/
			if(obj.resp === true) {
				form_html += '<form id="edit-debt-frm">';
				form_html += '<div class="form-group"><label for="title">Title:</label><input type="text" name="title" id="title" value="' + obj.data.title + '"></div>';
				form_html += '<div class="form-group"><label for="monthly_payment">Mo. Payment:</label><input type="text" name="monthly_payment" id="monthly_payment" value="' + obj.data.monthly_payment + '">';
				form_html += '<div class="form-group"><label for="beg_balance">Beginning Balance:</label><input type="text" name="beg_balance" id="beg_balance" value="' + obj.data.beg_balance + '">';
				form_html += '<div class="form-group"><label for="cur_balance">Current Balance:</label><input type="text" name="cur_balance" id="cur_balance" value="' + obj.data.cur_balance + '">';
				form_html += '<div class="form-group"><label for="beg_date">Beginning Date:</label><input type="text" name="beg_date" id="beg_date" value="">';
				form_html += '<div class="form-group"><label for="loan_term">Loan Term:</label><input type="text" name="loan_term" id="loan_term" value="' + obj.data.loan_term + '">';
				form_html += '<div class="form-group"><label for="int_rate">Interest Rate:</label><input type="text" name="int_rate" id="int_rate" value="' + obj.data.int_rate + '">';
				form_html += '<div class="form-group"><label for="due_date">Due Date:</label><input type="text" name="title" value="">';
				form_html += '<div class="form-group"><label for="notes">Notes:</label><textarea name="note">' + obj.data.notes + '</textarea>';
				form_html += '<div class="form-group"></div>';
				form_html += '</form>';
				$('.app-modal-title').html('Edit Debt - ' + obj.data.title);
				$('.modal-body').html(form_html);
				$('.app-modal').attr('id', 'edit-debt-modal');
				modalOpen('edit-debt-modal');
			}
			else {
				
			}

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
	var monthly_payment = $('#debt-form select[name="monthly_payment"]').val();
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
	if(monthly_payment == '') {
		$('#debt-form input[name="monthly_payment"]').addClass('hasError');
		$('#debt-form input[name="monthly_payment"]').after('<div class="helper error">You must enter your monthly payment</div>');
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
			'monthly_payment': monthly_payment,
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
	var payoff_earmark = $('#plan-form input[name="payoff_earmark"]').val();
	if(strategy == '' || strategy === null || strategy === undefined) {
		$('#plan-form').addClass('hasError');
		$('#plan-form').prepend('<div class="helper error">Please select how often</div>');
		error_count++;
	}
	if(payoff_earmark == '') {
		$('#plan-form').addClass('hasError');
		$('#plan-form').prepend('<div class="helper error">Please enter payoff earmark</div>');
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
			'payoff_earmark': payoff_earmark
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


$(document).on('click', '.account-data', function() {
	$('.account-input').hide();
	$('.account-data').show().css('display', 'inline-block');
	$(this).hide();
	$(this).next('.account-input').show().css('display', 'inline-block');
	$(this).next('.account-input').find('input, select').focus();
	
});

$(document).on('click', '.saveAcctBtn', function(event) {
	var input = $(this).parent().find('input, select');
	var id = $('#account-edit-form input[name="account_id"]').val();
	$('.update-helper').remove();
	console.log(input.attr('name'));
	//Ajax to save field
	$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method' : 'post',
			'action' : 'update_account_field',
			'format' : 'json',
			'id' : id,
			'field' : input.attr('name'),
			'value' : input.val()
		},
		dataType:'html',
		beforeSend: function() {

		},
		success : function(data) {              
			console.log('Dashboard Data: ' + data);
			var obj = $.parseJSON(data);
			if(obj.resp == true) {
				input.parent().after('<div class="helper success update-helper">Your information has been updated</div>');
			}
			else {
				
			}
			input.parent().parent().find('.account-data').show().css('display', 'inline-block');
			input.parent().parent().find('.account-input').hide();
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.account', function(event) {
	var id = $(this).attr('id').replace('account-', '');
	//console.log(id);
	mainView.router.loadPage('account_overview.html?id=' + id);
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
	//console.log("Building Dashboard");
	$('body').append('<div class="page-overlay"><div class="loading"><span style="width:42px; height:42px" class="preloader preloader-white"></span></div></div>');
	$('#user-id-input').val()
	var user_id = getStorage('user_id');
	var dashboard_html = '';
	$('.page-overlay').fadeOut('fast', function() {
		$(this).remove();
	});
	if(getStorage('step_3_completed')== 1) {
		$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method' : 'get',
				'action' : 'dashboard',
				'format' : 'json',
				'user' : user_id
			},
			dataType:'html',
			beforeSend: function() {

			},
			success : function(data) {              
				console.log('Dashboard Data: ' + data);
				var obj = $.parseJSON(data);
				if(obj.code == 1) {
					switch(obj.data.strategy) {
						case 'low_balance_first':
							var strategy = 'lowest balance first';
						break;
						case 'high_interest_first':
							var strategy = 'highest interest rate first';
						break;
						case 'high_balance_first':
							var strategy = 'highest balance first';
						break;
						case 'low_interest_first':
							var strategy = 'lowest interest rate first';
						break;
					}
					var dashboard_html = '';
					//var chart_data = [];
					//var chart_labels = [];
					//var chart_colors = ['rgb(255, 99, 132',
					//					'rgb(54, 162, 235'];
					//chart_data.push(12);
					//'rgb(255, 206, 86','rgb(75, 192, 192)','rgb(153, 102, 255)'
					
					dashboard_html += '<h1 class="payoff-center">Payoff Plan</h2>';
					dashboard_html += '<p class="center">Below is your payoff plan using ' + strategy + ' to pay off your debt.</p>';
					//dashboard_html += '<div id="canvas-holder" style="width:100%">';
        			//dashboard_html += '<canvas id="chart-area" />';
    				//dashboard_html += '</div>';
					//dashboard_html += '<div class="exp"></div>';
					
					if(obj.data.months_saved > 24) {
						//var months_saved = (obj.data.months_saved/12).toFixed(1) + ' Years';
						var months_saved = (obj.data.months_saved/12).toFixed(1);
					}
					else {
						//var months_saved = (obj.data.months_saved/12).toFixed(1) + " Months";
						var months_saved = (obj.data.months_saved/12).toFixed(1);
					}
					if(obj.data.strategy_months > 24) {
						var strategy_months1 = " Years";
						var strategy_months = (obj.data.strategy_months/12) + " Years";
					}
					else {
						var strategy_months1 = " Months";
						var strategy_months = obj.data.strategy_months + " Months";
					}
					var money_saved = obj.data.int_saved;
					//chart_data.push(months_saved);
					//chart_labels.push('Time Saved');
					//chart_data.push(money_saved);
					//chart_labels.push('Money Saved');
					//console.log(chart_data);
					//Extra Info 
					dashboard_html += '<div id="et-info">';
					dashboard_html += '<span class="et-title"><span id="roll-months" class="">0</span></span><small>months saved</small>';
					dashboard_html += '<span class="et-title"><span id="roll-strategy" class="">0</span>' + strategy_months1 + '</span><small>to fullfil strategy</small>';
					dashboard_html += '<span class="et-title">$<span id="roll-money" class="">0</span></span><small>Saved!</small>';
					dashboard_html += '</div>';
					
					dashboard_html += '<ul id="accts-list">';
					$.each( obj.data.phases, function( i, phase ) {
						//console.log( i + ": " + phase );
						dashboard_html += '<li>';
						if(phase.notices) {
							$.each( phase.notices, function( n, notice ) {
								dashboard_html += notice;
							});
						}
						//extra pay
						dashboard_html += '<div class="alert alert-default">Phase Earmark: $' + parseFloat(phase.extra_pay).formatMoney(2, '.', ',') + '</div>';
						if(phase.weeks < 53) {
							var weeks = phase.weeks + ' Wks';
						}
						else if(phase.months < 25) {
							var weeks = phase.months + ' Mo.';
						}
						else {
							//var weeks = round(($phase['months']/12), 1) . ' Years';
							var weeks = (phase.months/12).toFixed(1) + ' Yrs';
						}
						dashboard_html += '<span class="phase-bubble"><span class="phase-title">Phase</span><span class="phase-count">' + phase.phase + '</span><span class="phase-weeks">' + weeks + '</span></span>';
						dashboard_html += '<div class="accounts">';
						//account loop
						$.each( phase.accts, function( p, acct ) {
							dashboard_html += '<div class="account" id="account-' + acct.id + '" data-id="' + acct.id + '">';
							dashboard_html += '<span class="account-title">' + acct.title + '</span>';
							dashboard_html += '<span class="account-balance">$' + acct.balance.formatMoney(2, '.', ',') + '</span>';
							dashboard_html += '</div>';
						});
						// end acct loop
						dashboard_html += '</div><div class="clr"></div>';
						dashboard_html += '</li>';	
					});
					dashboard_html += '</ul>';
	
					var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
					var decimal_places = 2;
					var decimal_factor = decimal_places === 0 ? 1 : Math.pow(10, decimal_places);
						$('#roll-months').animateNumber(
						  {
							number: parseFloat(months_saved).toFixed(1),
							numberStep: comma_separator_number_step
						  }
						);

						$('#roll-strategy').animateNumber(
						  {
							number: parseFloat(strategy_months).toFixed(1),
							numberStep: comma_separator_number_step
						  }
						);
						
						$('#roll-money').animateNumber(
						  {
							number: obj.data.int_saved,
							numberStep: comma_separator_number_step
						  }
						);

			
				}
				
				$('#dashboard-container').html(dashboard_html);
				
				
				//$(".exp").donutpie();
				/*
				$(".exp").CanvasJSChart({ 
					title: { 
						text: "Percentage Population of Countries in EU - 2007" 
					}, 
					data: [{ 
						type: "doughnut", 
						indexLabel: "{label}: {y}%",
						toolTipContent: "{label}: {y}%",
						dataPoints: [ 
							{ label: "Germany",       y: 16.6}, 
							{ label: "France",        y: 12.8}, 
							{ label: "United Kingdom",y: 12.3}, 
							{ label: "Italy",         y: 11.9}, 
							{ label: "Spain",         y: 9.0}, 
							{ label: "Poland",        y: 7.7}, 
							{ label: "Other (21 Countries)",y: 29.7} 
						] 
					}] 
				});
				
				var randomScalingFactor = function() {
					return Math.round(Math.random() * 100);
				};


				var config = {
					type: 'doughnut',
					data: {
						datasets: [{
							data: chart_data,
							backgroundColor: chart_colors,
							label: 'Dataset 1'
						}],
						labels: chart_labels
					},
					options: {
						responsive: true,
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: 'Chart.js Doughnut Chart'
						},
						animation: {
							animateScale: true,
							animateRotate: true
						}
					}
				};
				
				var ctx = document.getElementById("chart-area").getContext("2d");
				window.myDoughnut = new Chart(ctx, config);
				*/
				//console.log(dashboard_html);
			},
			error : function(request,error) {
				//alert("Dashboard Request (error): " + JSON.stringify(request));
				//$.mobile.loading('hide'); 
				$('.page-overlay').fadeOut('fast', function() {
					$(this).remove();
				});
			}
		});	
	}
	else {
		dashboard_html += '<center><img src="lib/icon/icon-2.png" style="margin: 20px auto 0;"></center><h2 style="text-align: center; margin-top: 30px;">Welcome to DebtZapper!</h2><p style="text-align: center;">If you would like to get started paying down your debt, click the button below!</p><a class="getStartedBtn btn btn-primary" style="text-transform: uppercase;" href="get_started.html">Click here to get started</a>';
		$('#dashboard-container').html(dashboard_html);
	}
	
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };


$.fn.isOnScreen = function(){
    
    var win = $(window);
    
    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();
    
    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();
    
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    
};