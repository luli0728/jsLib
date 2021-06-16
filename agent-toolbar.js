var AgentBar = function(option) {

	var self = this;
	var offsetTime = 0;
	var owReasons = null;
	var statusTimer = null;
	var container = $(document.body);
	
	if (option && option.container) {
		container = $(option.container);
	}
	
	if (option && isArray(option.owReasons) && option.owReasons.length > 0) {
		owReasons = option.owReasons;
	}
	
	var client = new AgentClient(option);

	this.version = client.version;
	
	this.getOption = function(field) {
		if (field == undefined) {
			var option = client.getOption(field);
			if (option) {
				option.owReasons = owReasons;
			}
			return option;
		} else if (field == 'owReasons') {
			return owReasons;
		} else {
			return client.getOption(field);
		}
	};

	this.setOption = function(option) {
		return client.setOption(option);
	};

	this.start = function() {
		return client.start();
	};

	this.stop = function() {
		return client.stop();
	};

	// 签入
	this.login = function() {
		return client.login();
	};

	// 签出
	this.logout = function() {
		return client.logout();
	};

	// 忙碌
	this.notReady = function() {
		return client.notReady();
	};

	// 空闲
	this.ready = function() {
		return client.ready();
	};

	// 其他工作
	this.otherWork = function(reason) {
		return client.otherWork(reason);
	};

	// 预约
	this.appoint = function(_appointType) {
		return client.appoint(_appointType);
	};

	// 强制签入
	this.forceLogin = function() {
		return client.forceLogin();
	};

	// 外呼
	this.makeCall = function(destType, destDesc, callerId, tenantId) {
		return client.makeCall(destType, destDesc, callerId, tenantId);
	};

	// 应答
	this.answerCall = function() {
		return client.answerCall();
	};

	// 挂机
	this.hangupCall = function() {
		return client.hangupCall();
	};

	// 结束话路
	this.clearCall = function() {
		return client.clearCall();
	};

	// 保持
	this.holdCall = function() {
		return client.holdCall();
	};

	// 取回
	this.retrieveCall = function() {
		return client.retrieveCall();
	};

	// 咨询
	this.consultCall = function(destType, destDesc, callerId) {
		return client.consultCall(destType, destDesc, callerId);
	};

	// 咨询接回
	this.reconnectCall = function() {
		return client.reconnectCall();
	};

	// 咨询变转接
	this.forwardCall = function() {
		return client.forwardCall();
	};

	// 咨询变会议
	this.joinCall = function() {
		return client.joinCall();
	};

	// 振铃转接
	this.deflectCall = function(destType, destDesc) {
		return client.deflectCall(destType, destDesc);
	};

	// 代接
	this.pickupCall = function(destType, destDesc) {
		return client.pickupCall(destType, destDesc);
	};

	// 转接
	this.transferCall = function(destType, destDesc, callerId) {
		return client.transferCall(destType, destDesc, callerId);
	};

	// 转IVR
	this.transferIVR = function(flowFlag, callData) {
		return client.transferIVR(flowFlag, callData);
	};

	// 会议
	this.conferenceCall = function(destType, destDesc, callerId) {
		return client.conferenceCall(destType, destDesc, callerId);
	};

	// 二次拨号
	this.sendDTMF = function(DTMF) {
		return client.sendDTMF(DTMF);
	};

	// 单步转移
	this.singleStepTransfer = function(destType, destDesc) {
		return client.singleStepTransfer(destType, destDesc);
	};

	// 强制忙碌
	this.forceNotReady = function(agentId) {
		return client.forceNotReady(agentId);
	};

	// 强制空闲
	this.forceReady = function(agentId) {
		return client.forceReady(agentId);
	};

	// 强制签出
	this.forceLogout = function(agentId) {
		return client.forceLogout(agentId);
	};

	// 监听
	this.listenCall = function(destType, destDesc) {
		return client.listenCall(destType, destDesc);
	};

	// 强插
	this.insertCall = function(destType, destDesc) {
		return client.insertCall(destType, destDesc);
	};

	// 拦截
	this.interceptCall = function(destType, destDesc) {
		return client.interceptCall(destType, destDesc);
	};

	// 强拆
	this.forceHangupCall = function(destType, destDesc) {
		return client.forceHangupCall(destType, destDesc);
	};

	// 设置随路数据
	this.setCallData = function(dataKey, dataValue) {
		return client.setCallData(dataKey, dataValue);
	};

	// 获取随路数据
	this.getCallData = function(dataKey, success, error) {
		return client.getCallData(dataKey, success, error);
	};

	// 获取坐席状态
	this.getAgentState = function(agentId, success, error) {
		return client.getAgentState(agentId, success, error);
	};

	// 开始录音
	this.startRecord = function(fileName) {
		return client.startRecord(fileName);
	};

	// 结束录音
	this.stopRecord = function() {
		return client.stopRecord();
	};

	// 抢接路由
	this.routeSelect = function(contactId, destType, destDesc) {
		return client.routeSelect(contactId, destType, destDesc);
	};

	client.onOnline= function(event) {
		if (isFunction(self.onOnline)) {
			self.onOnline(event);
		}
	};

	client.onOffline= function(event) {
		if (isFunction(self.onOffline)) {
			self.onOffline(event);
		}
	};
	
	client.onDialing = function(event) {

		if (event.callType == CALL_TYPE_EXTER) {
			container.find('#txtNumber').val(event.calledParty);
		} else {
			container.find('#txtNumber').val(event.oriDnis);
		}
		
		if (isFunction(self.onDialing)) {
			self.onDialing(event);
		}
	};

	client.onOffering = function(event) {

		if (event.callType == CALL_TYPE_EXTER) {
			container.find('#txtNumber').val(event.oriAni);
		} else {
			container.find('#txtNumber').val(event.callingParty);
		}
		
		if (isFunction(self.onOffering)) {
			self.onOffering(event);
		}
	};

	client.onConnected = function(event) {
		
		if (isFunction(self.onConnected)) {
			self.onConnected(event);
		}
	};

	client.onReleased = function(event) {
		if (isFunction(self.onReleased)) {
			self.onReleased(event);
		}
	};

	client.onRecordEnd = function(event) {
		if (isFunction(self.onRecordEnd)) {
			self.onRecordEnd(event);
		}
	};

	client.onError = function(event) {
		if (isFunction(self.onError)) {
			self.onError(event);
		}
	};

	client.onStatusChanged = function(event) {
		
		onStatusChanged(event);
		
		if (isFunction(self.onStatusChanged)) {
			self.onStatusChanged(event);
		}
	};

	function onStatusChanged(event) {

		closeConsult();
		
		var status = statusMap[event.currStatus];

		if (status) {

			var txtStatus = container.find('#txtStatus');
			var statusText = null;

			if (event.currStatus == AST_OTHERWORK && isArray(owReasons) && owReasons.length > 0) {
				statusText = owReasons[event.reasonCode];
			}

			if (statusText) {
				txtStatus.text(statusText);
			} else {
				txtStatus.text(status.text);
			}
			
			if (status.color) {
				txtStatus.css('color', status.color);
				txtStatus.next().css('color', status.color);
			}

			if (status.menu) {
				txtStatus.addClass('dropdown-toggle');
				txtStatus.attr('data-toggle', 'dropdown');
				txtStatus.next().removeClass('hidden');
				txtStatus.next().addClass('dropdown-toggle');
				txtStatus.next().attr('data-toggle', 'dropdown');
				txtStatus.parent().addClass('has-feedback');
			} else {
				txtStatus.removeClass('dropdown-toggle');
				txtStatus.removeAttr('data-toggle', 'dropdown');
				txtStatus.next().addClass('hidden');
				txtStatus.next().removeClass('dropdown-toggle');
				txtStatus.next().removeAttr('data-toggle', 'dropdown');
				txtStatus.parent().removeClass('has-feedback');
			}

			if (status.elementMap) {

				for ( var elementId in status.elementMap) {

					var element = container.find('#' + elementId);

					switch (status.elementMap[elementId]) {
					case 0:
						element.addClass('hidden');

						if (elementId == 'btnOtherWork' && isArray(owReasons) && owReasons.length > 0) {
							if (event.currStatus == AST_OTHERWORK) {
								container.find('.otherwork').removeAttr('disabled');
								container.find('.otherwork').removeClass('disabled');
								container.find('.otherwork').removeClass('hidden');
								container.find('#btnOtherWork' + event.reasonCode).addClass('hidden');
							} else {
								container.find('.otherwork').addClass('hidden');
							}
						}
						
						break;
					case 1:
						element.removeAttr('disabled');
						element.removeClass('disabled');
						element.removeClass('hidden');

						if (elementId == 'btnOtherWork' && isArray(owReasons) && owReasons.length > 0) {
							container.find('.otherwork').removeAttr('disabled');
							container.find('.otherwork').removeClass('disabled');
							container.find('.otherwork').removeClass('hidden');
						}
						
						break;
					case 2:
						element.attr('disabled', true);
						element.addClass('disabled');
						element.removeClass('hidden');

						if (elementId == 'btnOtherWork' && isArray(owReasons) && owReasons.length > 0) {
							container.find('.otherwork').attr('disabled', true);
							container.find('.otherwork').addClass('disabled');
							container.find('.otherwork').removeClass('hidden');
						}
						
						break;
					}

					container.find('.input-group-btn:last-child > .btn:visible:last').css({
						'border-bottom-right-radius' : '4px',
						'border-top-right-radius' : '4px'
					});

					container.find('.btn-group > .btn:visible').css({
						'border-radius' : 0
					});

					container.find('.btn-group > .btn:visible:first').css({
						'border-bottom-left-radius' : '4px',
						'border-top-left-radius' : '4px'
					});

					container.find('.btn-group > .btn:visible:last').css({
						'border-bottom-right-radius' : '4px',
						'border-top-right-radius' : '4px'
					});
				}
			}

			var startTime = event.startTime || currentTime();

			// 根据签入状态时间校准时间偏差，便于计算状态时长
			if (event.currStatus == AST_LOGIN) {
				offsetTime = moment().diff(moment(startTime), 'milliseconds');
			}
			
			if (startTime) {

				if (statusTimer) {
					clearInterval(statusTimer);
				}

				container.find('#txtDuration').text('00:00:00');

				statusTimer = setInterval(function() {
					
					var duration = 0;
					
					if ((event.currStatus == SST_ONLINE || event.currStatus == SST_OFFLINE) && event.reasonCode == 1) {
						duration = moment().diff(moment(startTime), 'seconds');
					} else {
						duration = moment().diff(moment(startTime).add(offsetTime, 'milliseconds'), 'seconds');
					}
					
					container.find('#txtDuration').text(formatDuration(duration));
				}, 1000);
			}
		}
	}

	function currentTime() {
		return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
	}

	function formatDuration(duration) {
		
		if (isNumber(duration) && duration >= 0) {
			
			function f(n) {
                return n < 10 ? '0' + n : n;
            }
			
			var hour = Math.floor(duration/3600);
			var minute = Math.floor((duration - hour * 3600) / 60);
			var second = Math.floor(duration - hour * 3600 - minute * 60);

			return f(hour) + ':' + f(minute) + ':' + f(second);
		} else {
			return '00:00:00';
		}
	};

	function isObject(value) {
		var type = typeof value;
		return !!value && (type == 'object' || type == 'function');
	}
	
	function isObjectLike(value) {
		return !!value && typeof value == 'object';
	}
	
	function isArray(value) {
		return isObjectLike(value) && Object.prototype.toString.call(value) == '[object Array]';
	};
	
	function isFunction(value) {
		return isObject(value) && Object.prototype.toString.call(value) == '[object Function]';
	}

	function isNumber(value) {
		return typeof value == 'number' || (isObjectLike(value) && Object.prototype.toString.call(value) == '[object Number]');
	}

	function isString(value) {
		return typeof value == 'string' || (isObjectLike(value) && Object.prototype.toString.call(value) == '[object String]');
	}

	function showConsult(event) {
		
		if ($(event.target).hasClass('open') == false) {
			
			container.find('[data-toggle="consult"]').removeClass('open');
			$(event.target).addClass('open');
			
			container.find('[data-toggle="consult"]').not('.open').popover('hide');
			$(event.target).popover('show');
		}

		$(event.target).next().find('#txtDesc').focus();
	}

	function closeConsult() {
		container.find('[data-toggle="consult"]').popover('hide');
		container.find('[data-toggle="consult"]').removeClass('open');
	}
	
	function submitConsult(event) {

		var destType = parseInt(container.find('#txtType').attr('data-type'));
		var destDesc = container.find('#txtDesc').val();

		var btnId = $(event.target).closest('.popover').prev().attr('id');
		
		if (btnId == 'btnTransfer') {
			client.transferCall(destType, destDesc);
		} else if (btnId == 'btnConsult') {
			client.consultCall(destType, destDesc);
		} else if (btnId == 'btnConference') {
			client.conferenceCall(destType, destDesc);
		}
	}

	function getDestType(destDesc) {

		var destType = DEST_TYPE_EXTERDN;
		
		if (destDesc && destDesc.length <= 6 && destDesc.substring(0, 1) != '0' &&
			destDesc.substring(0, 1) != '1' && destDesc.substring(0, 1) != '9') {
			destType = DEST_TYPE_INTERDN;
		}
		
		return destType;
	}
	
	function focusEnd(target) {

		if (target.createTextRange) {
			
			var range = target.createTextRange();
			
			range.moveStart("character", target.value.length);
			range.select();
			
		} else if (target.setSelectionRange) {
			target.setSelectionRange(target.value.length, target.value.length);
			target.focus();
		}
	}
	
	container.on('click', '#btnLogin', function(event) {
		client.login();
	});

	container.on('click', '#btnReady', function(event) {
		client.ready();
	});

	container.on('click', '#btnNotReady', function(event) {
		client.notReady();
	});

	container.on('click', '#btnOtherWork', function(event) {
		client.otherWork();
	});

	container.on('click', '#btnLogout', function(event) {
		client.logout();
	});

	container.on('keydown', '#txtNumber', function(event) {
		
		if (event.keyCode == 13) {
			
			var destDesc = $(this).val();
			
			if (destDesc) {
				client.makeCall(getDestType(destDesc), destDesc);
			}
		} else if (event.keyCode == 68) {
			$(event.target).popover('show');
			return false;
		}
	});

	container.on('focus', '#txtNumber', function(event) {
		focusEnd(event.target);
	});
	
	container.on('click', '.panel-dial .btn-dial', function(event) {
		
		var dtmf = $(event.target).text();
		var txtNumber = container.find('#txtNumber');
		
		txtNumber.val(txtNumber.val() + dtmf);
		txtNumber.focus();
		
		var status = client.getOption('status');
		
		if (status >= DST_CONSULTOFFHOOK && status <= DST_LISTENED) {
			client.sendDTMF(dtmf);
		}
	});

	container.on('click', '.panel-dial .btn-close', function(event) {
		var txtNumber = container.find('#txtNumber');
		txtNumber.popover('hide');
		txtNumber.focus();
	});
	
	container.on('click', '#btnCall', function(event) {

		var destDesc = container.find('#txtNumber').val();

		if (destDesc) {
			client.makeCall(getDestType(destDesc), destDesc);
		}
	});

	container.on('click', '#btnAnswer', function(event) {
		client.answerCall();
	});

	container.on('click', '#btnHangup', function(event) {
		client.hangupCall();
	});

	container.on('click', '#btnHold', function(event) {
		client.holdCall();
	});

	container.on('click', '#btnRetrieve', function(event) {
		client.retrieveCall();
	});

	container.on('click', '#btnReconnect', function(event) {
		client.reconnectCall();
	});

	container.on('click', '#btnTransfer', function(event) {
		showConsult(event);
	});

	container.on('click', '#btnConsult', function(event) {
		showConsult(event);
	});

	container.on('click', '#btnConference', function(event) {
		showConsult(event);
	});

	container.on('click', '#btnSatisfy', function(event) {
		client.transferIVR(FLOW_FLAG_SATISFY);
	});

	container.on('click', '.panel-consult .dest-type', function(event) {

		var txtType = container.find('#txtType');

		txtType.text($(this).text());
		txtType.attr('data-type', $(this).attr('data-type'));

		$(event.target).closest('.panel-consult').find('#txtDesc').focus();
	});

	container.on('keydown', '#txtDesc', function(event) {
		if (event.keyCode == 13) {
			submitConsult(event);
		}
	});

	container.on('focus', '#txtDesc', function(event) {
		focusEnd(event.target);
	});
	
	container.on('click', '.panel-consult .btn-submit', function(event) {
		submitConsult(event);
	});

	var AST_LOGIN = 1;
	var AST_NOTREADY = 2;
	var AST_READY = 3;
	var AST_LOCKED = 4;
	var AST_WORKING = 5;
	var AST_AFTERCALLWORK = 6;
	var AST_OTHERWORK = 7;
	var AST_LOGOUT = 8;
	var DST_NULL = 20;
	var DST_IDLE = 21;
	var DST_OFFHOOK = 22;
	var DST_OFFERING = 23;
	var DST_BECONSULTOFFERING = 24;
	var DST_DIALING = 25;
	var DST_CONSULTOFFHOOK = 26;
	var DST_CONSULTDIALING = 27;
	var DST_CONNECTED = 28;
	var DST_HELD = 29;
	var DST_BEHELD = 30;
	var DST_CONSULTCONNECTED = 31;
	var DST_BECONSULTCONNECTED = 32;
	var DST_CONFERENCED = 33;
	var DST_BECONFERENCED = 34;
	var DST_FORCEINSERTED = 35;
	var DST_LISTENED = 36;
	var SST_ONLINE = 50;
	var SST_OFFLINE = 51;
	var SST_LINKUP = 52;
	var SST_LINKDOWN = 53;

	var CALL_TYPE_EXTER = 1;
	var CALL_TYPE_INTER = 2;
	
	var CALL_DIRECTION_IN = 1;
	var CALL_DIRECTION_OUT = 2;

	var DEST_TYPE_INTERDN = 1; // 分机
	var DEST_TYPE_EXTERDN = 3; // 外线
	
	var FLOW_FLAG_SATISFY = '1';	// 转满意度
	
	var statusMap = {};

	statusMap[SST_ONLINE] = {
		text : '网络正常',
		color : 'green',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 2,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 1,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[SST_OFFLINE] = {
		text : '网络异常',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 2,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[AST_LOGIN] = {
		text : '签入',
		color : 'green',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 1,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 1,
			'btnNotReady' : 1,
			'btnOtherWork' : 1,
			'btnLogout' : 1,
			'txtDuration' : 1
		}
	};

	statusMap[AST_LOGOUT] = {
		text : '签出',
		color : '#d9534f',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 2,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 1,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[AST_NOTREADY] = {
		text : '忙碌',
		color : '#d9534f',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 1,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 1,
			'btnNotReady' : 0,
			'btnOtherWork' : 1,
			'btnLogout' : 1,
			'txtDuration' : 1
		}
	};

	statusMap[AST_READY] = {
		text : '空闲',
		color : 'green',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 1,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 1,
			'btnOtherWork' : 1,
			'btnLogout' : 1,
			'txtDuration' : 1
		}
	};

	statusMap[AST_LOCKED] = {
		text : '锁定',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 2,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 1,
			'txtDuration' : 1
		}
	};

	statusMap[AST_AFTERCALLWORK] = {
		text : '整理',
		color : '#d9534f',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 1,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 1,
			'btnNotReady' : 1,
			'btnOtherWork' : 1,
			'btnLogout' : 1,
			'txtDuration' : 1
		}
	};

	statusMap[AST_OTHERWORK] = {
		text : '小休',
		color : '#d9534f',
		menu : true,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 1,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 1,
			'btnNotReady' : 1,
			'btnOtherWork' : 0,
			'btnLogout' : 1,
			'txtDuration' : 1
		}
	};

	statusMap[DST_OFFHOOK] = {
		text : '摘机',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_OFFERING] = {
		text : '来电振铃',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 1,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_BECONSULTOFFERING] = {
		text : '被咨询振铃',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 1,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_DIALING] = {
		text : '外呼振铃',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 0,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_CONSULTOFFHOOK] = {
		text : '发起咨询',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 2,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_CONSULTDIALING] = {
		text : '咨询振铃',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 2,
			'btnAnswer' : 0,
			'btnHangup' : 0,
			'btnHold' : 0,
			'btnRetrieve' : 0,
			'btnReconnect': 1,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_CONNECTED] = {
		text : '通话',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 1,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 1,
			'btnConsult' : 1,
			'btnConference' : 1,
			'btnSatisfy' : 1,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_HELD] = {
		text : '保持',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 0,
			'btnRetrieve' : 1,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_BEHELD] = {
		text : '被保持',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_CONSULTCONNECTED] = {
		text : '咨询通话',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 0,
			'btnRetrieve' : 0,
			'btnReconnect': 1,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_BECONSULTCONNECTED] = {
		text : '被咨询通话',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_CONFERENCED] = {
		text : '会议',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 0,
			'btnRetrieve' : 0,
			'btnReconnect': 2,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_BECONFERENCED] = {
		text : '被会议',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_FORCEINSERTED] = {
		text : '强插',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	statusMap[DST_LISTENED] = {
		text : '监听',
		color : '#d9534f',
		menu : false,
		elementMap : {
			'txtNumber' : 1,
			'btnCall' : 0,
			'btnAnswer' : 0,
			'btnHangup' : 1,
			'btnHold' : 2,
			'btnRetrieve' : 0,
			'btnReconnect': 0,
			'btnTransfer' : 2,
			'btnConsult' : 2,
			'btnConference' : 2,
			'btnSatisfy' : 2,
			'txtStatus' : 1,
			'btnLogin' : 0,
			'btnReady' : 0,
			'btnNotReady' : 0,
			'btnOtherWork' : 0,
			'btnLogout' : 0,
			'txtDuration' : 1
		}
	};

	var agentbarTemplate = '<div class="agentbar">'
		+ '	<div class="btn-toolbar form-inline">'
		+ '		<div class="input-group">'
		+ '			<input type="text" class="form-control" data-toggle="dial" id="txtNumber">'
		+ '			<div class="input-group-btn">'
		+ '				<a class="btn btn-success" id="btnCall">呼叫</a>'
		+ '				<a class="btn btn-success hidden" id="btnAnswer">应答</a>'
		+ '				<a class="btn btn-danger hidden" id="btnHangup">挂机</a>'
		+ '			</div>'
		+ '		</div>'
		+ '		<div class="btn-group">'
		+ '			<a class="btn btn-info" id="btnHold">保持</a>'
		+ '			<a class="btn btn-info hidden" id="btnRetrieve">恢复</a>'
		+ '			<a class="btn btn-info hidden" id="btnReconnect">接回</a>'
		+ '			<a class="btn btn-info" id="btnTransfer" data-toggle="consult">转接</a>'
		+ '			<a class="btn btn-info" id="btnConsult" data-toggle="consult">咨询</a>'
		+ '			<a class="btn btn-info" id="btnConference" data-toggle="consult">会议</a>'
		+ '			<a class="btn btn-info hidden" id="btnSatisfy">转满意度</a>'
		+ '		</div>'
		+ '		<div class="input-group">'
		+ '			<div class="input-group has-feedback">'
		+ '				<div class="form-control dropdown-toggle" id="txtStatus" data-toggle="dropdown">空闲</div>'
		+ '				<div class="form-control-feedback dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></div>'
		+ '				<ul class="dropdown-menu">'
		+ '					<li><a class="hidden" id="btnLogin">签入</a></li>'
		+ '					<li><a class="hidden" id="btnReady">空闲</a></li>'
		+ '					<li><a class="hidden" id="btnNotReady">忙碌</a></li>'
		+ '					<li><a class="hidden otherwork" id="btnOtherWork">小休</a></li>'
		+ '					<li><a class="hidden" id="btnLogout">签出</a></li>'
		+ '				</ul>'
		+ '			</div>'
		+ '			<div class="input-group-addon" id="txtDuration">00:00:00</div>'
		+ '		</div>'
		+ '	</div>'
		+ '</div>';
	
	var consultTemplate = '<div class="panel-consult clearfix">'
		+ '<div class="input-group">'
		+ '		<div class="input-group has-feedback">'
		+ '			<div class="form-control dropdown-toggle" id="txtType" data-toggle="dropdown" data-type="1">分机</div>'
		+ '			<div class="form-control-feedback dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></div>'
		+ '			<ul class="dropdown-menu">'
		+ '				<li><a class="dest-type" data-type="1">分机</a></li>'
		+ '				<li><a class="dest-type" data-type="3">外线</a></li>'
		+ '				<li><a class="dest-type" data-type="2">工号</a></li>'
		+ '				<li><a class="dest-type" data-type="4">技能</a></li>'
		+ '			</ul>'
		+ '		</div>'
		+ '		<input type="text" class="form-control" id="txtDesc">'
		+ '		<div class="input-group-btn">'
		+ '			<a class="btn btn-warning btn-submit">确定</a>'
		+ '		</div>'
		+ '	</div>'
		+ '</div>';

	var dialTemplate = '<div class="panel-dial">'
		+ '	<div class="btn-toolbar">'
		+ '		<a class="btn btn-default btn-xs btn-dial">1</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">2</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">3</a>'
		+ '	</div>'
		+ '	<div class="btn-toolbar">'
		+ '		<a class="btn btn-default btn-xs btn-dial">4</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">5</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">6</a>'
		+ '	</div>'
		+ '	<div class="btn-toolbar">'
		+ '		<a class="btn btn-default btn-xs btn-dial">7</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">8</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">9</a>'
		+ '	</div>'
		+ '	<div class="btn-toolbar">'
		+ '		<a class="btn btn-default btn-xs btn-dial">*</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">0</a>'
		+ '		<a class="btn btn-default btn-xs btn-dial">#</a>'
		+ '	</div>'
		+ '	<div class="btn-toolbar">'
		+ '		<a class="btn btn-warning btn-xs btn-close">关闭</a>'
		+ '	</div>'
		+ '</div>';
	
	function buildOtherWork(reason, text) {
		container.on('click', '#btnOtherWork' + reason, function() {
			client.otherWork(reason);
		});
		return '<li><a class="otherwork" id="btnOtherWork' + reason + '">' + text + '</a></li>\n';
	}
	
	function init() {

		container.append(agentbarTemplate);

		if (owReasons) {
			var owHtml = '';
			for (var i = 0; i < owReasons.length; i++) {
				var owReason = $.trim(owReasons[i]);
				if (owReason) {
					owHtml += buildOtherWork(i, owReason);
				}
			}
			if (owHtml) {
				container.find('#btnOtherWork').parent().replaceWith(owHtml);
			}
		}

		onStatusChanged({currStatus: SST_OFFLINE});
		
		container.find('[data-toggle="consult"]').popover({
			content : consultTemplate,
			html : true,
			trigger : 'manual',
			placement : 'bottom'
		});

		container.find('[data-toggle="dial"]').popover({
			content : dialTemplate,
			html : true,
			trigger : 'manual',
			placement : 'bottom'
		});

		$(document).on('click', function(event) {
			
			if ($(event.target).closest('.agentbar .popover').length == 0) {
				
				if ($(event.target).next().find('.panel-consult').length == 0 && $(event.target).attr('data-toggle') != 'consult') {
					closeConsult();
				}

				if ($(event.target).next().find('.panel-dial').length == 0) {
					container.find('[data-toggle="dial"]').popover('hide');
				}
			}
		});
	}
	
	init();
};