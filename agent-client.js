var AgentClient = function(option) {

	var version = '7.0.0';
	
	var self = this;
	var socket = null;
	var acwTimer = null;
	var loginTimer = null;

	var actionType = 0;
	var appointType = 0;
	var callDataQueue = [];
	var agentStateQueue = [];
	
	var isOnline = false;
	
	var agent = {
		agentId : '',
		agentDn : '',
		agentName : '',
		agentType : 1,
		skillDesc : '',
		tenantDesc : '',
		acdAgentId : '',
		acdAgentGroup : '',
		acdAgentPassword : '',
		status: 0,
		agentIp: '',
		phoneIp: '',
		sessionId: '',
		isLogin: false
	};

	var config = {
		proxyUrl : '',	// 代理服务地址
		answerUrl : '',	// 话机应答地址
		hangupUrl : '',	// 话机挂机地址
		autoLogin : true,	// 是否自动签入
		forceLogin : true,	// 是否强制签入
		autoAnswer : false,	// 是否自动应答
		autoReady : 1,	// 自动空闲, 1:事后整理(默认), 2:自动空闲, 3:自动忙碌
		acwTime : 0,	// 事后整理时长(毫秒)
		answerTime : 2000,	// 自动应答延时(毫秒)
		transferFlag : 1,	// 转接标志, 1:通话转(默认), 2:振铃转
		dialPrefix : '0',	// 外呼前缀
		dialCaller : '',	// 外呼主叫号码
		ivrDn : '6000',	// IVR号码
		debug : false	// 启用调试
	};

	setOption(option);
	
	function getOption(field) {
		if (field == undefined) {
			return {
				agentId : agent.agentId,
				agentDn : agent.agentDn,
				agentName : agent.agentName,
				agentType : agent.agentType,
				skillDesc : agent.skillDesc,
				tenantDesc : agent.tenantDesc,
				acdAgentId : agent.acdAgentId,
				acdAgentGroup : agent.acdAgentGroup,
				acdAgentPassword : agent.acdAgentPassword,
				status: agent.status,
				agentIp: agent.agentIp,
				phoneIp: agent.phoneIp,
				sessionId : agent.sessionId,
				isLogin : agent.isLogin,
				proxyUrl : config.proxyUrl,
				answerUrl : config.answerUrl,
				hangupUrl : config.hangupUrl,
				autoLogin : config.autoLogin,
				forceLogin : config.forceLogin,
				autoAnswer : config.autoAnswer,
				autoReady : config.autoReady,
				acwTime : config.acwTime,
				answerTime : config.answerTime,
				transferFlag : config.transferFlag,
				dialPrefix : config.dialPrefix,
				dialCaller : config.dialCaller,
				ivrDn : config.ivrDn,
				debug : config.debug
			};
		} else {
			var value = agent[field];
			
			if (value == undefined) {
				value = config[field];
			}
			
			return value;
		}
	}

	function setOption(option) {
		
		option = option || {};
		
		if (!agent.isLogin) {
			if (option.hasOwnProperty('agentId')) {
				agent.agentId = (option.agentId || '') + '';
			}

			if (option.hasOwnProperty('agentDn')) {
				agent.agentDn = (option.agentDn || '') + '';
			}

			if (option.hasOwnProperty('agentName')) {
				agent.agentName = (option.agentName || '') + '';
			}

			if (option.hasOwnProperty('agentType')) {
				agent.agentType = option.agentType;
			}

			if (option.hasOwnProperty('skillDesc')) {
				agent.skillDesc = (option.skillDesc || '') + '';
			}

			if (option.hasOwnProperty('tenantDesc')) {
				agent.tenantDesc = (option.tenantDesc || '') + '';
			}

			if (option.hasOwnProperty('acdAgentId')) {
				agent.acdAgentId = (option.acdAgentId || '') + '';
			}

			if (option.hasOwnProperty('acdAgentGroup')) {
				agent.acdAgentGroup = (option.acdAgentGroup || '') + '';
			}

			if (option.hasOwnProperty('acdAgentPassword')) {
				agent.acdAgentPassword = (option.acdAgentPassword || '') + '';
			}

			if (option.hasOwnProperty('sessionId')) {
				agent.sessionId = (option.sessionId || '') + '';
			}

			if (!agent.sessionId) {
				agent.sessionId = getCookie('sid-' + agent.agentId);
			}
		}

		if (option.hasOwnProperty('proxyUrl')) {
			config.proxyUrl = (option.proxyUrl || '') + '';
		}

		if (option.hasOwnProperty('answerUrl')) {
			config.answerUrl = (option.answerUrl || '') + '';
		}

		if (option.hasOwnProperty('hangupUrl')) {
			config.hangupUrl = (option.hangupUrl || '') + '';
		}

		if (option.hasOwnProperty('autoLogin')) {
			config.autoLogin = option.autoLogin;
		}

		if (option.hasOwnProperty('forceLogin')) {
			config.forceLogin = option.forceLogin;
		}

		if (option.hasOwnProperty('autoAnswer')) {
			config.autoAnswer = option.autoAnswer;
		}

		if (option.hasOwnProperty('autoReady')) {
			config.autoReady = option.autoReady;
		}

		if (option.hasOwnProperty('acwTime')) {
			config.acwTime = option.acwTime;
		}

		if (option.hasOwnProperty('answerTime')) {
			config.answerTime = option.answerTime;
		}

		if (option.hasOwnProperty('transferFlag')) {
			config.transferFlag = option.transferFlag;
		}

		if (option.hasOwnProperty('dialPrefix')) {
			config.dialPrefix = (option.dialPrefix || '') + '';
		}

		if (option.hasOwnProperty('dialCaller')) {
			config.dialCaller = (option.dialCaller || '') + '';
		}

		if (option.hasOwnProperty('ivrDn')) {
			config.ivrDn = (option.ivrDn || '') + '';
		}

		if (option.hasOwnProperty('debug')) {
			config.debug = option.debug;
		}
		
		return true;
	}

	function start() {

		if (!socket) {

			socket = io.connect(config.proxyUrl, {forceNew: true});

			socket.on('connect', function() {
				onMessage(createAgentClientOnLineEvent());
			});

			socket.on('connect_error', function(data) {
				var errorCode = '1343225931';
				var errorDesc = 'Err_IContact_' + (data ? data.type || 'TransportError' : 'TransportError');
				onMessage(createUniversalFailureEvent(errorCode, errorDesc));
			});

			socket.on('disconnect', function() {
				onMessage(createAgentClientOffLineEvent());
			});

			socket.on('message', function(message) {
				onMessage(message);
			});
		}
	}

	function stop() {

		if (agent.isLogin) {
			logout();
		}

		setTimeout(function() {
			if (socket && isOnline) {
				socket.close();
			}
		}, 100);
	}

	function login() {
		var agentPrivateData = {TAC: config.dialPrefix || ''};
		return sendCommand(createLoginCommand(agent, JSON.stringify(agentPrivateData)));
	}

	function logout() {
		if (agent.isLogin) {
			return sendCommand(createLogoutCommand(agent.agentId));
		}
		return false;
	}

	function notReady() {
		if (agent.isLogin) {
			return sendCommand(createNotReadyCommand(agent.agentId));
		}
		return false;
	}

	function ready() {
		if (agent.isLogin) {
			return sendCommand(createReadyCommand(agent.agentId));
		}
		return false;
	}

	function otherWork(reason) {
		if (agent.isLogin) {
			return sendCommand(createOtherWorkCommand(agent.agentId, reason));
		}
		return false;
	}

	function appoint(_appointType) {
		appointType = _appointType;
		return true;
	}

	function forceLogin() {
		
		forceLogout(agent.agentId);
		
		setTimeout(function() {
			login();
		}, 100);
	}
	
	function makeCall(destType, destDesc, callerId, tenantId) {

		if (destType === DEST_TYPE_EXTERDN) {

			destDesc = config.dialPrefix + destDesc;

			if (callerId === null || callerId === undefined || callerId === '') {
				callerId = config.dialCaller;
			}
		} else {
			callerId = '';
		}

		return sendCommand(createMakeCallCommand(agent.agentId, destType, destDesc, callerId, tenantId));
	}

	function answerCall() {
		if (agent.isLogin) {
			httpGet(buildAnswerUrl());
			return sendCommand(createAnswerCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function autoAnswerCall() {
		if (config.autoAnswer) {
			setTimeout(function() {
				answerCall();
			}, config.answerTime);
		}
	}
	
	function hangupCall() {
		if (agent.isLogin) {
			httpGet(buildHangupUrl());
			return sendCommand(createHangupCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function clearCall() {
		if (agent.isLogin) {
			return sendCommand(createClearCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function holdCall() {
		if (agent.isLogin) {
			return sendCommand(createHoldCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function retrieveCall() {
		if (agent.isLogin) {
			actionType = APPOINT_TYPE_NULL;
			return sendCommand(createRetrieveCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function consultCall(destType, destDesc, callerId) {

		if (agent.isLogin) {

			if (destType === DEST_TYPE_EXTERDN) {

				destDesc = config.dialPrefix + destDesc;

				if (callerId === null || callerId === undefined || callerId === '') {
					callerId = config.dialCaller;
				}
			} else {
				callerId = '';
			}

			return sendCommand(createConsultCallCommand(agent.agentId, agent.agentDn, destType, destDesc, ACTION_TYPE_TRANSFER, callerId));
		}

		return false;
	}

	function reconnectCall() {
		if (agent.isLogin) {
			actionType = ACTION_TYPE_NULL;
			return sendCommand(createReconnectCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function forwardCall() {
		if (agent.isLogin) {
			actionType = ACTION_TYPE_NULL;
			return sendCommand(createTransferCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function joinCall() {
		if (agent.isLogin) {
			actionType = ACTION_TYPE_NULL;
			return sendCommand(createConferenceCallCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function deflectCall(destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createDeflectCallCommand(agent.agentId, agent.agentDn, destType, destDesc));
		}
		return false;
	}

	function pickupCall(destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createPickupCallCommand(agent.agentId, agent.agentDn, destType, destDesc));
		}
		return false;
	}

	function transferCall(destType, destDesc, callerId) {

		if (agent.isLogin) {

			if (destType === DEST_TYPE_EXTERDN) {

				destDesc = config.dialPrefix + destDesc;

				if (callerId === null || callerId === undefined || callerId === '') {
					callerId = config.dialCaller;
				}
			} else {
				callerId = '';
			}

			actionType = ACTION_TYPE_TRANSFER;

			return sendCommand(createConsultCallCommand(agent.agentId, agent.agentDn, destType, destDesc, ACTION_TYPE_TRANSFER, callerId));
		}

		return false;
	}

	function transferIVR(flowFlag, callData) {

		setCallData('IVRFlowFlag', flowFlag);
		setCallData('AgentID', agent.agentId);
		setCallData('AgentDN', agent.agentDn);
		
		if (isObject(callData)) {
			for (var p in callData) {
				if (callData.hasOwnProperty(p)) {
					setCallData(p,  callData[p]);
				}
			}
		}

		singleStepTransfer(DEST_TYPE_EXTERDN, config.ivrDn);
	}
	
	function conferenceCall(destType, destDesc, callerId) {

		if (agent.isLogin) {

			if (destType === DEST_TYPE_EXTERDN) {

				destDesc = config.dialPrefix + destDesc;

				if (callerId === null || callerId === undefined || callerId === '') {
					callerId = config.dialCaller;
				}
			} else {
				callerId = '';
			}

			actionType = ACTION_TYPE_CONFERENCE;

			return sendCommand(createConsultCallCommand(agent.agentId, agent.agentDn, destType, destDesc, ACTION_TYPE_CONFERENCE, callerId));
		}

		return false;
	}

	function sendDTMF(DTMF) {
		if (agent.isLogin) {
			return sendCommand(createSendDTMFCommand(agent.agentId, agent.agentDn, DTMF));
		}
		return false;
	}

	function singleStepTransfer(destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createSingleStepTransferCommand(agent.agentId, agent.agentDn, destType, destDesc));
		}
		return false;
	}

	function forceNotReady(agentId) {
		if (agent.isLogin) {
			return sendCommand(createForceNotReadyCommand(agent.agentId, agentId));
		}
		return false;
	}

	function forceReady(agentId) {
		if (agent.isLogin) {
			return sendCommand(createForceReadyCommand(agent.agentId, agentId));
		}
		return false;
	}

	function forceLogout(agentId) {
		if (agent.isLogin) {
			return sendCommand(createForceLogoutCommand(agent.agentId, agentId));
		} else {
			return sendCommand(createForceLogoutCommand('', agentId));
		}
	}

	function listenCall(destType, destDesc, actionType) {
		if (agent.isLogin) {
			return sendCommand(createListenCommand(agent.agentId, agent.agentDn, destType, destDesc, actionType));
		}
		return false;
	}

	function insertCall(destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createForceInsertCommand(agent.agentId, agent.agentDn, destType, destDesc));
		}
		return false;
	}

	function interceptCall(destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createInterceptCommand(agent.agentId, agent.agentDn, destType, destDesc));
		}
		return false;
	}

	function forceHangupCall(destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createForceHangupCommand(agent.agentId, agent.agentDn, destType, destDesc));
		}
		return false;
	}

	function setCallData(dataKey, dataValue) {
		if (agent.isLogin) {
			return sendCommand(createSetCallDataCommand(agent.agentId, agent.agentDn, dataKey, dataValue));
		}
		return false;
	}
	
	function getCallData(dataKey, success, error) {
		if (agent.isLogin && dataKey) {
			callDataQueue = [];
			sendCommand(createGetCallDataCommand(agent.agentId, agent.agentDn, dataKey));
			waitCallData(dataKey, success, error);
		}
	}

	function waitCallData(dataKey, success, error) {

		var timeout = 200;
		var interval = 10;
		var start = (new Date()).getTime();
		
		var timer = setInterval(function() {
			
			var current = (new Date()).getTime();
			
			if (current - start < timeout) {
				
				var length = callDataQueue.length;
				
				for (var i = 0; i < length; i++) {
					
					var response = callDataQueue.shift();
					
					if (response && response.Key_IContact_CallDataKey == dataKey) {
						clearInterval(timer);
						if (isFunction(success)) {
							success(response.Key_IContact_CallDataValue);
						}
					}
				}
			} else {
				clearInterval(timer);
				if (isFunction(error)) {
					error();
				}
			}
		}, interval);
	}

	function getAgentState(agentId, success, error) {
		if (agent.isLogin) {
			agentStateQueue = [];
            sendCommand(createGetAgentStateCommand(agent.agentId, agent.agentDn, agentId));
            waitAgentState(agentId, success, error);
        }
        return false;
    }

	function waitAgentState(agentId, success, error) {

		var timeout = 200;
		var interval = 10;
		var start = (new Date()).getTime();
		
		var timer = setInterval(function() {
			
			var current = (new Date()).getTime();
			
			if (current - start < timeout) {
				
				var length = agentStateQueue.length;
				
				for (var i = 0; i < length; i++) {
					
					var response = agentStateQueue.shift();
					
					if (response && response.Key_IContact_DestAgentID == agentId) {
						clearInterval(timer);
						if (isFunction(success)) {
							success(response.Key_IContact_DestAgentStatus, response.Key_IContact_DeviceStatus);
						}
					}
				}
			} else {
				clearInterval(timer);
				if (isFunction(error)) {
					error();
				}
			}
		}, interval);
	}

	function startRecord(fileName) {
		if (agent.isLogin) {
			return sendCommand(createStartRecordCommand(agent.agentId, agent.agentDn, fileName));
		}
		return false;
	}

	function stopRecord() {
		if (agent.isLogin) {
			return sendCommand(createStopRecordCommand(agent.agentId, agent.agentDn));
		}
		return false;
	}

	function routeSelect(contactId, destType, destDesc) {
		if (agent.isLogin) {
			return sendCommand(createRouteSelectCommand(agent.agentId, agent.agentDn, contactId, destType, destDesc));
		}
		return false;
	}

	function sendCommand(command) {
		
		if (isOnline) {

			// 取消自动空闲
			if (acwTimer) {
				clearTimeout(acwTimer);
			}
			
			if (agent.sessionId) {
				command.Key_IContact_SessionID = agent.sessionId;
			}
			
			debug('send command:', command);
			
			socket.emit('command', command);
			
			return true;
		}
		return false;
	}

	function createLoginCommand(agent, agentPrivateData) {
		return {
			MessageID : Cmd_IContact_AgentLogin,
			Key_IContact_AgentID : agent.agentId,
			Key_IContact_AgentDN : agent.agentDn,
			Key_IContact_AgentName : agent.agentName,
			Key_IContact_AgentType : agent.agentType,
			Key_IContact_SkillDesc : agent.skillDesc,
			Key_IContact_TenantDesc : agent.tenantDesc,
			Key_IContact_ACDAgentID : agent.acdAgentId,
			Key_IContact_ACDAgentGroup : agent.acdAgentGroup,
			Key_IContact_ACDAgentPassword : agent.acdAgentPassword,
			Key_IContact_AgentPrivateData : agentPrivateData + ''
		};
	}

	function createLogoutCommand(agentId) {
		return {
			MessageID : Cmd_IContact_AgentLogout,
			Key_IContact_AgentID : agentId + ''
		};
	}

	function createNotReadyCommand(agentId) {
		return {
			MessageID : Cmd_IContact_AgentNotReady,
			Key_IContact_AgentID : agentId + ''
		};
	}

	function createReadyCommand(agentId) {
		return {
			MessageID : Cmd_IContact_AgentReady,
			Key_IContact_AgentID : agentId + ''
		};
	}

	function createOtherWorkCommand(agentId, reason) {
		return {
			MessageID : Cmd_IContact_AgentOtherWork,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_Reason : parseInt(reason)
		};
	}

	function createMakeCallCommand(agentId, destType, destDesc, callingParty, tenantId) {
		return {
			MessageID : Cmd_IContact_MakeCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : (destDesc || '') + '',
			Key_IContact_CallingParty : (callingParty || '') + '',
			Key_IContact_TenantID : (tenantId || '') + ''
		};
	}

	function createAnswerCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_AnswerCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createHangupCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_HangupCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createClearCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_ClearCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createHoldCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_HoldCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createRetrieveCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_RetrieveCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createTransferCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_TransferCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createConferenceCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_ConferenceCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createConsultCallCommand(agentId, agentDn, destType, destDesc, consultType, callingParty) {
		return {
			MessageID : Cmd_IContact_ConsultCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + '',
			Key_IContact_ConsultType : parseInt(consultType),
			Key_IContact_CallingParty : callingParty + ''
		};
	}

	function createReconnectCallCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_ReconnectCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createDeflectCallCommand(agentId, agentDn, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_DeflectCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}

	function createPickupCallCommand(agentId, agentDn, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_PickupCall,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}

	function createSendDTMFCommand(agentId, agentDn, DTMF) {
		return {
			MessageID : Cmd_IContact_SendDTMF,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_SendDTMFDigits : DTMF + ''
		};
	}

	function createSingleStepTransferCommand(agentId, agentDn, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_SingleStepTransfer,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}

	function createForceLogoutCommand(agentId, destAgentId) {
		return {
			MessageID : Cmd_IContact_ForceAgentLogout,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DestAgentID : destAgentId + ''
		};
	}

	function createForceReadyCommand(agentId, destAgentId) {
		return {
			MessageID : Cmd_IContact_ForceAgentReady,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DestAgentID : destAgentId + ''
		};
	}

	function createForceNotReadyCommand(agentId, destAgentId) {
		return {
			MessageID : Cmd_IContact_ForceAgentNotReady,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DestAgentID : destAgentId + ''
		};
	}

	function createListenCommand(agentId, agentDn, destType, destDesc, actionType) {
		return {
			MessageID : Cmd_IContact_Listen,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + '',
			Key_IContact_ActionType : actionType + ''
		};
	}

	function createForceInsertCommand(agentId, agentDn, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_ForceInsert,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}

	function createInterceptCommand(agentId, agentDn, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_Intercept,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}

	function createForceHangupCommand(agentId, agentDn, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_ForceHangup,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}
	
	function createSetCallDataCommand(agentId, agentDn, dataKey, dataValue) {
		return {
			MessageID : Cmd_IContact_SetCallData,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_CallDataKey : dataKey + '',
			Key_IContact_CallDataValue : dataValue + ''
		};
	}

	function createGetCallDataCommand(agentId, agentDn, dataKey) {
		return {
			MessageID : Cmd_IContact_GetCallData,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_CallDataKey : dataKey + ''
		};
	}

	function createGetAgentStateCommand(agentId, agentDn, destAgentId) {
        return {
            MessageID: Cmd_IContact_GetAgentState,
            Key_IContact_AgentID: agentId + '',
            Key_IContact_DeviceDN: agentDn + '',
            Key_IContact_DestAgentID: destAgentId + ''
        };
    }
	
	function createStartRecordCommand(agentId, agentDn, fileName) {
		return {
			MessageID : Cmd_IContact_StartRecord,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_FileName : fileName + ''
		};
	}

	function createStopRecordCommand(agentId, agentDn) {
		return {
			MessageID : Cmd_IContact_StopRecord,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + ''
		};
	}

	function createRouteSelectCommand(agentId, agentDn, contactId, destType, destDesc) {
		return {
			MessageID : Cmd_IContact_AgentRouteSelect,
			Key_IContact_AgentID : agentId + '',
			Key_IContact_DeviceDN : agentDn + '',
			Key_IContact_ContactID : contactId + '',
			Key_IContact_DestType : parseInt(destType),
			Key_IContact_DestDesc : destDesc + ''
		};
	}

	function createAgentClientOnLineEvent() {
		return {
			MessageID : Evt_ISystem_AgentClientOnLine,
			Key_IContact_TimeStamp : currentTime()
		}
	}

	function createAgentClientOffLineEvent() {
		return {
			MessageID : Evt_ISystem_AgentClientOffLine,
			Key_IContact_TimeStamp : currentTime()
		}
	}
	
	function createUniversalFailureEvent(errorCode, errorDesc) {
		return {
			MessageID: Evt_IContact_UniversalFailure,
			Key_IContact_UniversalFailureID: errorCode + '',
			Key_IContact_UniversalFailureDesc: errorDesc + '',
			Key_IContact_TimeStamp: currentTime()
		};
	}
	
	function currentTime() {
		
		function f(n) {
            return n < 10 ? '0' + n : n;
        }

		function f2(n) {
			if (n < 10) return '00' + n;
            return n < 100 ? '0' + n : n;
        }

		var now = new Date();

		return now.getFullYear() + '-' +
			f(now.getMonth() + 1) + '-' +
			f(now.getDate()) + ' ' +
			f(now.getHours()) + ':' +
			f(now.getMinutes()) + ':' +
			f(now.getSeconds()) + '.' +
			f2(now.getMilliseconds());
	}
	
	function onMessage(message) {

		debug('received message:', message);
		
		if (!message || !message.MessageID) {
			return;
		}

		if (message.MessageID.substring(0, 3) === 'Evt') {
			onEvent(message);
		} else if (message.MessageID.substring(0, 4) === 'Resp') {
			onResponse(message);
		}
	}

	function onResponse(response) {

		switch (response.MessageID) {
		case Resp_IContact_AgentLogin:
			onAgentLoginResponse(response);
			break;
		case Resp_IContact_GetCallData:
			callDataQueue.push(response);
			break;
		case Resp_IContact_GetAgentState:
			agentStateQueue.push(response);
			break;
		}
	}
	
	function onAgentLoginResponse(response) {
		agent.phoneIp = response.Key_IContact_PhoneAddress || '';
	}
	
	function onEvent(event) {

		switch (event.MessageID) {

		case Evt_IContact_AgentLogin:
		case Evt_IContact_AgentNotReady:
		case Evt_IContact_AgentReady:
		case Evt_IContact_AgentLocked:
		case Evt_IContact_AgentWorking:
		case Evt_IContact_AgentAfterCallWork:
		case Evt_IContact_AgentOtherWork:
		case Evt_IContact_AgentLogout:
			onAgentEvent(event);
			break;

		case Evt_IContact_OffHook:
		case Evt_IContact_Dialing:
		case Evt_IContact_Offering:
		case Evt_IContact_Connected:
		case Evt_IContact_Failed:
		case Evt_IContact_Released:
		case Evt_IContact_Notify:
		case Evt_IContact_Held:
		case Evt_IContact_BeHeld:
		case Evt_IContact_ConsultOffHook:
		case Evt_IContact_ConsultDialing:
		case Evt_IContact_ConsultConnected:
		case Evt_IContact_BeConsultOffering:
		case Evt_IContact_BeConsultConnected:
		case Evt_IContact_ConsultFailed:
		case Evt_IContact_Conferenced:
		case Evt_IContact_BeConferenced:
		case Evt_IContact_ForceInserted:
		case Evt_IContact_Listened:
		case Evt_IContact_Recording:
		case Evt_IContact_RecordEnd:
			onCallEvent(event);
			break;

		case Evt_IContact_ASFailure:
		case Evt_IContact_UniversalFailure:
			onErrorEvent(event);
			break;

		case Evt_ISystem_AgentClientOnLine:
		case Evt_ISystem_AgentClientOffLine:
		case Evt_ISystem_AgentProxyOnLine:
		case Evt_ISystem_AgentProxyOffLine:
		case Evt_IContact_AgentServiceOnLine:
		case Evt_IContact_AgentServiceOffLine:
		case Evt_IContact_LinkUp:
		case Evt_IContact_LinkDown:
			onSystemEvent(event);
			break;
		}
	}

	function onAgentEvent(event) {

		var reasonCode = event.Key_IContact_Reason;
		var startTime = event.Key_IContact_StartTime;

		switch (event.MessageID) {

		case Evt_IContact_AgentLogin:
			onAgentLogin(event);
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_LOGIN, reasonCode, startTime);
			break;

		case Evt_IContact_AgentNotReady:
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_NOTREADY, reasonCode, startTime);
			break;

		case Evt_IContact_AgentReady:
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_READY, reasonCode, startTime);
			break;

		case Evt_IContact_AgentLocked:
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_LOCKED, reasonCode, startTime);
			break;

		case Evt_IContact_AgentWorking:
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_WORKING, reasonCode, startTime);
			break;

		case Evt_IContact_AgentAfterCallWork:
			onAgentAfterCallWork(event);
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_AFTERCALLWORK, reasonCode, startTime);
			break;

		case Evt_IContact_AgentOtherWork:
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_OTHERWORK, reasonCode, startTime);
			break;

		case Evt_IContact_AgentLogout:
			onAgentLogout(event);
			fireStatusChangedEvent(EVENT_TYPE_AGENT, AST_LOGOUT, reasonCode, startTime);
			break;
		}
	}

	function onCallEvent(event) {

		var currState = event.Key_IContact_CurrStatus;
		var reasonCode = event.Key_IContact_Reason;
		var startTime = event.Key_IContact_StartTime;

		switch (event.MessageID) {

		case Evt_IContact_OffHook:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_OFFHOOK, reasonCode, startTime);
			answerCall();
			break;

		case Evt_IContact_Dialing:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_DIALING, reasonCode, startTime);
			fireDialingEvent(event);
			answerCall();
			break;

		case Evt_IContact_Offering:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_OFFERING, reasonCode, startTime);
			fireOfferingEvent(event);
			autoAnswerCall();
			break;

		case Evt_IContact_Connected:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_CONNECTED, reasonCode, startTime);
			fireConnectedEvent(event);
			break;

		case Evt_IContact_Failed:
			fireStatusChangedEvent(EVENT_TYPE_CALL, currState, reasonCode, startTime);
			actionType = ACTION_TYPE_NULL;
			break;

		case Evt_IContact_Released:
			httpGet(buildHangupUrl());
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_IDLE, reasonCode, startTime);
			fireReleasedEvent(event);
			actionType = ACTION_TYPE_NULL;
			break;

		case Evt_IContact_Held:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_HELD, reasonCode, startTime);
			break;

		case Evt_IContact_BeHeld:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_BEHELD, reasonCode, startTime);
			break;

		case Evt_IContact_ConsultOffHook:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_CONSULTOFFHOOK, reasonCode, startTime);
			break;

		case Evt_IContact_ConsultDialing:

			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_CONSULTDIALING, reasonCode, startTime);

			if (actionType === ACTION_TYPE_TRANSFER && config.transferFlag === TRANSFER_FLAG_DIALING) {
				forwardCall();
			}
			break;

		case Evt_IContact_ConsultConnected:

			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_CONSULTCONNECTED, reasonCode, startTime);

			if (actionType === ACTION_TYPE_CONFERENCE) {
				joinCall();
			}

			if (actionType === ACTION_TYPE_TRANSFER) {
				forwardCall();
			}
			break;

		case Evt_IContact_BeConsultOffering:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_BECONSULTOFFERING, reasonCode, startTime);
			fireOfferingEvent(event);
			autoAnswerCall();
			break;

		case Evt_IContact_BeConsultConnected:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_BECONSULTCONNECTED, reasonCode, startTime);
			fireConnectedEvent(event);
			break;

		case Evt_IContact_ConsultFailed:
			fireStatusChangedEvent(EVENT_TYPE_CALL, currState, reasonCode, startTime);
			actionType = ACTION_TYPE_NULL;
			break;

		case Evt_IContact_Conferenced:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_CONFERENCED, reasonCode, startTime);
			break;

		case Evt_IContact_BeConferenced:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_BECONFERENCED, reasonCode, startTime);
			fireConnectedEvent(event);
			break;

		case Evt_IContact_ForceInserted:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_FORCEINSERTED, reasonCode, startTime);
			answerCall();
			break;

		case Evt_IContact_Listened:
			fireStatusChangedEvent(EVENT_TYPE_CALL, DST_LISTENED, reasonCode, startTime);
			answerCall();
			break;

		case Evt_IContact_Recording:
			break;

		case Evt_IContact_RecordEnd:
			fireRecordEndEvent(event);
			break;
		}
	}

	function onErrorEvent(event) {

		switch (event.MessageID) {
		case Evt_IContact_ASFailure:
		case Evt_IContact_UniversalFailure:
			
			// 坐席工号占用时执行强制签入
			if (config.forceLogin && event.Key_IContact_UniversalFailureDesc == 'Err_IContact_AgentIDInService') {

				if (loginTimer) {
					clearInterval(loginTimer);
				}
				
				forceLogin();
			} else {
				fireErrorEvent(event);
			}
			
			break;
		}
	}

	function onSystemEvent(event) {

		var reasonCode = event.Key_IContact_Reason;
		var timestamp = event.Key_IContact_TimeStamp;

		switch (event.MessageID) {

		case Evt_ISystem_AgentClientOnLine:
			isOnline = true;
			fireOnlineEvent(REASON_AGENTCLIENT, timestamp);
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_ONLINE, REASON_AGENTCLIENT, timestamp);
			break;

		case Evt_ISystem_AgentClientOffLine:
			isOnline = false;
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_OFFLINE, REASON_AGENTCLIENT, timestamp);
			fireOfflineEvent(REASON_AGENTCLIENT, timestamp);
			break;

		case Evt_ISystem_AgentProxyOnLine:
			isOnline = true;
			fireOnlineEvent(REASON_AGENTPROXY, timestamp);
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_ONLINE, REASON_AGENTPROXY, timestamp);
			break;

		case Evt_ISystem_AgentProxyOffLine:
			isOnline = false;
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_OFFLINE, REASON_AGENTPROXY, timestamp);
			fireOfflineEvent(REASON_AGENTPROXY, timestamp);
			break;

		case Evt_IContact_AgentServiceOnLine:
			isOnline = true;
			fireOnlineEvent(REASON_AGENTSERVICE, timestamp);
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_ONLINE, REASON_AGENTSERVICE, timestamp);
			break;

		case Evt_IContact_AgentServiceOffLine:
			isOnline = false;
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_OFFLINE, REASON_AGENTSERVICE, timestamp);
			fireOfflineEvent(REASON_AGENTSERVICE, timestamp);
			break;

		case Evt_IContact_LinkUp:
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_LINKUP, reasonCode, timestamp);
			break;

		case Evt_IContact_LinkDown:
			fireStatusChangedEvent(EVENT_TYPE_SYSTEM, SST_LINKDOWN, reasonCode, timestamp);
			break;
		}
	}

	function onAgentLogin(event) {

		if (loginTimer) {
			clearInterval(loginTimer);
		}
		
		if (event.Key_IContact_PrivateData) {
			agent.agentIp = event.Key_IContact_PrivateData.Key_IContact_AgentIP;
		}

		agent.isLogin = true;
		agent.sessionId = event.Key_IContact_SessionID;
		
		setCookie('sid-' + agent.agentId, agent.sessionId);
	}

	function onAgentLogout(event) {
		agent.isLogin = false;
		agent.sessionId = null;
		expireCookie('sid-' + agent.agentId);
	}

	function onAgentAfterCallWork(event) {

		if (appointType == APPOINT_TYPE_NOTREADY) {
			appointType = APPOINT_TYPE_NULL;
			notReady();
			return;
		}

		if (appointType == APPOINT_TYPE_AFTERCALLWORK) {
			appointType = APPOINT_TYPE_NULL;
			return;
		}

		if (appointType == APPOINT_TYPE_OTHERWORK) {
			appointType = APPOINT_TYPE_NULL;
			otherWork(0);
			return;
		}

		if (acwTimer) {
			clearTimeout(acwTimer);
		}
		
		acwTimer = setTimeout(function() {
			switch (config.autoReady) {
			case AUTO_TYPE_AGENTREADY:
				ready();
				break;
				
			case AUTO_TYPE_AGENTNOTREADY:
				notReady();
				break;
			}
		}, config.acwTime);
	}

	function fireOnlineEvent(reasonCode, startTime) {
		if (isFunction(self.onOnline)) {
			self.onOnline({
				reasonCode: reasonCode,
				startTime: startTime
			});
		}

		// 自动签入
		if (config.autoLogin && agent.status == 0) {
			login();
		}
		
		// 重连自动签入
		if (agent.isLogin) {

			if (loginTimer) {
				clearInterval(loginTimer);
			}

			login();

			// 每6秒重试一次
			loginTimer = setInterval(function() {
				login();
			}, 6000);
		}
	}

	function fireOfflineEvent(reasonCode, startTime) {
		if (isFunction(self.onOffline)) {
			self.onOffline({
				reasonCode: reasonCode,
				startTime: startTime
			});
		}
	}
	
	function fireStatusChangedEvent(eventType, currStatus, reasonCode, startTime) {
		
		if (eventType == EVENT_TYPE_AGENT || eventType == EVENT_TYPE_CALL) {
			agent.status = currStatus;
		}
		
		if (isFunction(self.onStatusChanged)) {
			self.onStatusChanged({
				eventType: eventType,
				currStatus: currStatus,
				reasonCode: reasonCode,
				startTime: startTime
			});
		}
	}

	function fireDialingEvent(event) {
		if (isFunction(self.onDialing)) {
			self.onDialing({
				contactId : event.Key_IContact_ContactID,
				currStatus : event.Key_IContact_CurrStatus,
				lastStatus : event.Key_IContact_LastStatus,
				oriAni : event.Key_IContact_ANI,
				oriDnis : event.Key_IContact_DNIS,
				deviceDn : event.Key_IContact_DeviceDN,
				deviceType : event.Key_IContact_DeviceType,
				channelType : event.Key_IContact_ChannelType,
				callType : event.Key_IContact_CallType,
				callDirection : event.Key_IContact_CallDirection,
				callId : event.Key_IContact_CallID,
				callingParty : event.Key_IContact_CallingParty,
				calledParty : event.Key_IContact_CalledParty,
				otherParty : event.Key_IContact_OtherParty,
				tenantId: event.Key_IContact_TenantID,
				resonCode : event.Key_IContact_Reason,
				startTime : event.Key_IContact_StartTime
			});
		}
	}

	function fireOfferingEvent(event) {
		if (isFunction(self.onOffering)) {
			self.onOffering({
				contactId : event.Key_IContact_ContactID,
				currStatus : event.Key_IContact_CurrStatus,
				lastStatus : event.Key_IContact_LastStatus,
				oriAni : event.Key_IContact_ANI,
				oriDnis : event.Key_IContact_DNIS,
				deviceDn : event.Key_IContact_DeviceDN,
				deviceType : event.Key_IContact_DeviceType,
				channelType : event.Key_IContact_ChannelType,
				callType : event.Key_IContact_CallType,
				callDirection : event.Key_IContact_CallDirection,
				callId : event.Key_IContact_CallID,
				callingParty : event.Key_IContact_CallingParty,
				calledParty : event.Key_IContact_CalledParty,
				otherParty : event.Key_IContact_OtherParty,
				tenantId: event.Key_IContact_TenantID,
				resonCode : event.Key_IContact_Reason,
				startTime : event.Key_IContact_StartTime
			});
		}
	}

	function fireConnectedEvent(event) {
		if (isFunction(self.onConnected)) {
			self.onConnected({
				contactId : event.Key_IContact_ContactID,
				currStatus : event.Key_IContact_CurrStatus,
				lastStatus : event.Key_IContact_LastStatus,
				oriAni : event.Key_IContact_ANI,
				oriDnis : event.Key_IContact_DNIS,
				deviceDn : event.Key_IContact_DeviceDN,
				deviceType : event.Key_IContact_DeviceType,
				channelType : event.Key_IContact_ChannelType,
				callType : event.Key_IContact_CallType,
				callDirection : event.Key_IContact_CallDirection,
				callId : event.Key_IContact_CallID,
				callingParty : event.Key_IContact_CallingParty,
				calledParty : event.Key_IContact_CalledParty,
				otherParty : event.Key_IContact_OtherParty,
				tenantId: event.Key_IContact_TenantID,
				resonCode : event.Key_IContact_Reason,
				startTime : event.Key_IContact_StartTime
			});
		}
	}

	function fireReleasedEvent(event) {
		if (isFunction(self.onReleased)) {
			self.onReleased({
				contactId : event.Key_IContact_ContactID,
				currStatus : event.Key_IContact_CurrStatus,
				lastStatus : event.Key_IContact_LastStatus,
				oriAni : event.Key_IContact_ANI,
				oriDnis : event.Key_IContact_DNIS,
				deviceDn : event.Key_IContact_DeviceDN,
				deviceType : event.Key_IContact_DeviceType,
				channelType : event.Key_IContact_ChannelType,
				callType : event.Key_IContact_CallType,
				callDirection : event.Key_IContact_CallDirection,
				callId : event.Key_IContact_CallID,
				callingParty : event.Key_IContact_CallingParty,
				calledParty : event.Key_IContact_CalledParty,
				otherParty : event.Key_IContact_OtherParty,
				tenantId: event.Key_IContact_TenantID,
				resonCode : event.Key_IContact_Reason,
				startTime : event.Key_IContact_StartTime
			});
		}
	}

	function fireRecordEndEvent(event) {
		if (isFunction(self.onRecordEnd)) {
			self.onRecordEnd({
				contactId : event.Key_IContact_ContactID,
				oriAni : event.Key_IContact_ANI,
				oriDnis : event.Key_IContact_DNIS,
				deviceDn : event.Key_IContact_DeviceDN,
				deviceType : event.Key_IContact_DeviceType,
				channelType : event.Key_IContact_ChannelType,
				callType : event.Key_IContact_CallType,
				callDirection : event.Key_IContact_CallDirection,
				callId : event.Key_IContact_CallID,
				callingParty : event.Key_IContact_CallingParty,
				calledParty : event.Key_IContact_CalledParty,
				otherParty : event.Key_IContact_OtherParty,
				recordTime : event.Key_IContact_TimeStamp,
				recordFile : event.Key_IContact_FileName,
				recordDuration : event.Key_IContact_TimeLen,
				tenantId: event.Key_IContact_TenantID,
				resonCode : event.Key_IContact_Reason,
				startTime : event.Key_IContact_StartTime
			});
		}
	}

	function fireErrorEvent(event) {
		if (isFunction(self.onError)) {
			self.onError({
				errorCode : event.Key_IContact_UniversalFailureID,
				errorDesc : event.Key_IContact_UniversalFailureDesc,
				startTime : event.Key_IContact_TimeStamp
			});
		}
	}

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

	function debug(message, data) {
		if (config.debug && window.console && console.log) {
			if (isObject(data)) {
				if (JSON && JSON.stringify) {
					console.log(message, JSON.stringify(data, null, 2));
				} else {
					console.log(message, data);
				}
			} else {
				console.log(message, data);
			}
		}
	}

	function httpGet(url) {
		try {
			if (url) {
				debug('http get:', url);

				var xhr = new XMLHttpRequest();
			
				if ('withCredentials' in xhr) {
					
					xhr.open('GET', url);
					xhr.send();
					
				} else if (window.XDomainRequest) {
					
					var xdr = new XDomainRequest();

					xdr.open('GET', url);
					setTimeout(function() {
						xdr.send();
					}, 0);
				}
			}
		} catch (e) {
			debug('http error:', e ? e.message : e);
		}
	}
	
	function buildAnswerUrl() {

		var answerUrl = config.answerUrl;
		var phoneIp = agent.phoneIp;
		
		if (answerUrl && isString(answerUrl)) {
			if (answerUrl.substring(0, 7).toLowerCase() == 'http://') {
				return answerUrl;
			} else {
				if (phoneIp && isString(phoneIp)) {
					if (phoneIp.substring(0, 7).toLowerCase() == 'http://') {
						return phoneIp + ('/' + answerUrl).replace('//', '/');
					} else {
						return 'http://' + phoneIp + ('/' + answerUrl).replace('//', '/');
					}
				} else {
					return null;
				}
			}
		} else {
			return null;
		}
	}

	function buildHangupUrl() {

		var hangupUrl = config.hangupUrl;
		var phoneIp = agent.phoneIp;

		if (hangupUrl && isString(hangupUrl)) {
			if (hangupUrl.substring(0, 7).toLowerCase() == 'http://') {
				return hangupUrl;
			} else {
				if (phoneIp && isString(phoneIp)) {
					if (phoneIp.substring(0, 7).toLowerCase() == 'http://') {
						return phoneIp + ('/' + hangupUrl).replace('//', '/');
					} else {
						return 'http://' + phoneIp + ('/' + hangupUrl).replace('//', '/');
					}
				} else {
					return null;
				}
			}
		} else {
			return null;
		}
	}
	
	function getCookie(key) {
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"
			+ encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	}
	
	function setCookie(key, value, end, path, domain, secure) {
		
		if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
			return false;
		}
		
		var expires = "";
		
		if (end) {
			switch (end.constructor) {
			case Number:
				expires = end === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + end;
				break;
			case String:
				expires = "; expires=" + end;
				break;
			case Date:
				expires = "; expires=" + end.toUTCString();
				break;
			}
		}
		
		document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + expires
			+ (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "")	+ (secure ? "; secure" : "");
		
		return true;
	}
	
	function hasCookie(key) {
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	}
	
	function expireCookie(key, path, domain) {
		if (!key || !hasCookie(key)) {
			return false;
		}
		document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
				+ (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "");
		return true;
	}

	var EVENT_TYPE_AGENT = 1;
	var EVENT_TYPE_CALL = 2;
	var EVENT_TYPE_SYSTEM = 3;

	var AGENT_TYPE_NORMAL = 1; // 普通坐席
	var AGENT_TYPE_ACD = 2; // ACD坐席
	var AGENT_TYPE_VIRTUAL = 3; // 虚拟坐席
	var AGENT_TYPE_SOFTACD = 4; // SoftACD坐席

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

	var REASON_AGENTCLIENT = 1; // 事件原因：AgentClient
	var REASON_AGENTPROXY = 2; // 事件原因：AgentProxy
	var REASON_AGENTSERVICE = 3; // 事件原因：AgentService

	var ACTION_TYPE_NULL = 0; // 没有动作
	var ACTION_TYPE_TRANSFER = 1; // 转接动作
	var ACTION_TYPE_CONFERENCE = 2; // 会议动作

	var APPOINT_TYPE_NULL = 0; // 取消预约
	var APPOINT_TYPE_NOTREADY = 1; // 预约忙碌
	var APPOINT_TYPE_AFTERCALLWORK = 2; // 预约整理
	var APPOINT_TYPE_OTHERWORK = 3; // 预约其他

	var DEST_TYPE_INTERDN = 1; // 分机
	var DEST_TYPE_AGENTID = 2; // 工号
	var DEST_TYPE_EXTERDN = 3; // 外线
	var DEST_TYPE_SKILLGROUP = 4; // 技能
	var DEST_TYPE_SATISFACTION = 5; // 转满意度
	var DEST_TYPE_PASSWORD = 6; // 转密码验证
	var DEST_TYPE_CONSULT2TRANSFER = 7; // 咨询变转接
	var DEST_TYPE_CONSULT2CONFERENCE = 8; // 咨询变会议
	var DEST_TYPE_TRANSFERIVR = 9; // 转IVR语音

	var TRANSFER_TYPE_CONSULT = 1; // 咨询转接
	var TRANSFER_TYPE_SINGLESTEP = 2; // 单步转接

	var TRANSFER_FLAG_CONNECTED = 1; // 通话转
	var TRANSFER_FLAG_DIALING = 2; // 振铃转

	var AUTO_TYPE_AGENTACW = 1; // 事后整理
	var AUTO_TYPE_AGENTREADY = 2; // 自动空闲
	var AUTO_TYPE_AGENTNOTREADY = 3; // 自动忙碌

	// 状态控制命令
	var Cmd_IContact_AgentLogin = 'Cmd_IContact_AgentLogin';
	var Cmd_IContact_AgentLogout = 'Cmd_IContact_AgentLogout';
	var Cmd_IContact_AgentNotReady = 'Cmd_IContact_AgentNotReady';
	var Cmd_IContact_AgentReady = 'Cmd_IContact_AgentReady';
	var Cmd_IContact_AgentOtherWork = 'Cmd_IContact_AgentOtherWork';

	// 呼叫控制命令
	var Cmd_IContact_MakeCall = 'Cmd_IContact_MakeCall';
	var Cmd_IContact_AnswerCall = 'Cmd_IContact_AnswerCall';
	var Cmd_IContact_HangupCall = 'Cmd_IContact_HangupCall';
	var Cmd_IContact_ClearCall = 'Cmd_IContact_ClearCall';
	var Cmd_IContact_HoldCall = 'Cmd_IContact_HoldCall';
	var Cmd_IContact_RetrieveCall = 'Cmd_IContact_RetrieveCall';
	var Cmd_IContact_TransferCall = 'Cmd_IContact_TransferCall';
	var Cmd_IContact_ConferenceCall = 'Cmd_IContact_ConferenceCall';
	var Cmd_IContact_ConsultCall = 'Cmd_IContact_ConsultCall';
	var Cmd_IContact_ReconnectCall = 'Cmd_IContact_ReconnectCall';
	var Cmd_IContact_DeflectCall = 'Cmd_IContact_DeflectCall';
	var Cmd_IContact_PickupCall = 'Cmd_IContact_PickupCall';
	var Cmd_IContact_SendDTMF = 'Cmd_IContact_SendDTMF';
	var Cmd_IContact_SingleStepTransfer = 'Cmd_IContact_SingleStepTransfer';

	// 质检命令
	var Cmd_IContact_ForceAgentLogout = 'Cmd_IContact_ForceAgentLogout';
	var Cmd_IContact_ForceAgentReady = 'Cmd_IContact_ForceAgentReady';
	var Cmd_IContact_ForceAgentNotReady = 'Cmd_IContact_ForceAgentNotReady';
	var Cmd_IContact_Listen = 'Cmd_IContact_Listen';
	var Cmd_IContact_ForceInsert = 'Cmd_IContact_ForceInsert';
	var Cmd_IContact_Intercept = 'Cmd_IContact_Intercept';
	var Cmd_IContact_ForceHangup = 'Cmd_IContact_ForceHangup';

	// 随路数据命令
	var Cmd_IContact_SetCallData = 'Cmd_IContact_SetCallData';
	var Cmd_IContact_GetCallData = 'Cmd_IContact_GetCallData';

	// 其他命令
	var Cmd_IContact_GetAgentState = 'Cmd_IContact_GetAgentState';
	var Cmd_IContact_StartRecord = 'Cmd_IContact_StartRecord';
	var Cmd_IContact_StopRecord = 'Cmd_IContact_StopRecord';
	var Cmd_IContact_AgentRouteSelect = 'Cmd_IContact_AgentRouteSelect';

	// 响应消息
	var Resp_IContact_AgentLogin = 'Resp_IContact_AgentLogin';
	var Resp_IContact_GetCallData = 'Resp_IContact_GetCallData';
	var Resp_IContact_GetAgentState = 'Resp_IContact_GetAgentState';
	
	// 坐席事件
	var Evt_IContact_AgentLogin = 'Evt_IContact_AgentLogin';
	var Evt_IContact_AgentLogout = 'Evt_IContact_AgentLogout';
	var Evt_IContact_AgentReady = 'Evt_IContact_AgentReady';
	var Evt_IContact_AgentNotReady = 'Evt_IContact_AgentNotReady';
	var Evt_IContact_AgentOtherWork = 'Evt_IContact_AgentOtherWork';
	var Evt_IContact_AgentAfterCallWork = 'Evt_IContact_AgentAfterCallWork';
	var Evt_IContact_AgentLocked = 'Evt_IContact_AgentLocked';
	var Evt_IContact_AgentWorking = 'Evt_IContact_AgentWorking';
	var Evt_IContact_ASFailure = 'Evt_IContact_ASFailure';
	var Evt_IContact_UniversalFailure = 'Evt_IContact_UniversalFailure';

	// 设备事件
	var Evt_IContact_OffHook = 'Evt_IContact_OffHook';
	var Evt_IContact_Dialing = 'Evt_IContact_Dialing';
	var Evt_IContact_Offering = 'Evt_IContact_Offering';
	var Evt_IContact_Connected = 'Evt_IContact_Connected';
	var Evt_IContact_Failed = 'Evt_IContact_Failed';
	var Evt_IContact_Released = 'Evt_IContact_Released';
	var Evt_IContact_Notify = 'Evt_IContact_Notify';
	var Evt_IContact_Held = 'Evt_IContact_Held';
	var Evt_IContact_BeHeld = 'Evt_IContact_BeHeld';
	var Evt_IContact_ConsultOffHook = 'Evt_IContact_ConsultOffHook';
	var Evt_IContact_ConsultDialing = 'Evt_IContact_ConsultDialing';
	var Evt_IContact_ConsultConnected = 'Evt_IContact_ConsultConnected';
	var Evt_IContact_BeConsultOffering = 'Evt_IContact_BeConsultOffering';
	var Evt_IContact_BeConsultConnected = 'Evt_IContact_BeConsultConnected';
	var Evt_IContact_ConsultFailed = 'Evt_IContact_ConsultFailed';
	var Evt_IContact_Conferenced = 'Evt_IContact_Conferenced';
	var Evt_IContact_BeConferenced = 'Evt_IContact_BeConferenced';
	var Evt_IContact_ForceInserted = 'Evt_IContact_ForceInserted';
	var Evt_IContact_Listened = 'Evt_IContact_Listened';
	var Evt_IContact_Recording = 'Evt_IContact_Recording';
	var Evt_IContact_RecordEnd = 'Evt_IContact_RecordEnd';

	// 系统事件
	var Evt_IContact_AgentServiceOnLine = 'Evt_IContact_AgentServiceOnLine';
	var Evt_IContact_AgentServiceOffLine = 'Evt_IContact_AgentServiceOffLine';
	var Evt_IContact_LinkUp = 'Evt_IContact_LinkUp';
	var Evt_IContact_LinkDown = 'Evt_IContact_LinkDown';
	var Evt_ISystem_AgentProxyOnLine = 'Evt_ISystem_AgentProxyOnLine';
	var Evt_ISystem_AgentProxyOffLine = 'Evt_ISystem_AgentProxyOffLine';
	var Evt_ISystem_AgentClientOnLine = 'Evt_ISystem_AgentClientOnLine';
	var Evt_ISystem_AgentClientOffLine = 'Evt_ISystem_AgentClientOffLine';

	this.version = version;
	
	this.getOption = function(field) {
		return getOption(field);
	};

	this.setOption = function(option) {
		return setOption(option);
	};

	this.start = function() {
		return start();
	};

	this.stop = function() {
		return stop();
	};

	// 签入
	this.login = function() {
		return login();
	};

	// 签出
	this.logout = function() {
		return logout();
	};

	// 忙碌
	this.notReady = function() {
		return notReady();
	};

	// 空闲
	this.ready = function() {
		return ready();
	};

	// 其他工作
	this.otherWork = function(reason) {
		return otherWork(reason);
	};

	// 预约
	this.appoint = function(_appointType) {
		return appoint(_appointType);
	};

	// 强制签入
	this.forceLogin = function() {
		return forceLogin();
	};

	// 外呼
	this.makeCall = function(destType, destDesc, callerId, tenantId) {
		return makeCall(destType, destDesc, callerId, tenantId);
	};

	// 应答
	this.answerCall = function() {
		return answerCall();
	};

	// 挂机
	this.hangupCall = function() {
		return hangupCall();
	};

	// 结束话路
	this.clearCall = function() {
		return clearCall();
	};

	// 保持
	this.holdCall = function() {
		return holdCall();
	};

	// 取回
	this.retrieveCall = function() {
		return retrieveCall();
	};

	// 咨询
	this.consultCall = function(destType, destDesc, callerId) {
		return consultCall(destType, destDesc, callerId);
	};

	// 咨询接回
	this.reconnectCall = function() {
		return reconnectCall();
	};

	// 咨询变转接
	this.forwardCall = function() {
		return forwardCall();
	};

	// 咨询变会议
	this.joinCall = function() {
		return joinCall();
	};

	// 振铃转接
	this.deflectCall = function(destType, destDesc) {
		return deflectCall(destType, destDesc);
	};

	// 代接
	this.pickupCall = function(destType, destDesc) {
		return pickupCall(destType, destDesc);
	};

	// 转接
	this.transferCall = function(destType, destDesc, callerId) {
		return transferCall(destType, destDesc, callerId);
	};

	// 转IVR
	this.transferIVR = function(flowFlag, callData) {
		return transferIVR(flowFlag, callData);
	};

	// 会议
	this.conferenceCall = function(destType, destDesc, callerId) {
		return conferenceCall(destType, destDesc, callerId);
	};

	// 二次拨号
	this.sendDTMF = function(DTMF) {
		return sendDTMF(DTMF);
	};

	// 单步转接
	this.singleStepTransfer = function(destType, destDesc) {
		return singleStepTransfer(destType, destDesc);
	};

	// 强制忙碌
	this.forceNotReady = function(agentId) {
		return forceNotReady(agentId);
	};

	// 强制空闲
	this.forceReady = function(agentId) {
		return forceReady(agentId);
	};

	// 强制签出
	this.forceLogout = function(agentId) {
		return forceLogout(agentId);
	};

	// 监听
	this.listenCall = function(destType, destDesc) {
		return listenCall(destType, destDesc);
	};

	// 强插
	this.insertCall = function(destType, destDesc) {
		return insertCall(destType, destDesc);
	};

	// 拦截
	this.interceptCall = function(destType, destDesc) {
		return interceptCall(destType, destDesc);
	};

	// 强拆
	this.forceHangupCall = function(destType, destDesc) {
		return forceHangupCall(destType, destDesc);
	};

	// 获取随路数据
	this.getCallData = function(dataKey, success, error) {
		return getCallData(dataKey, success, error);
	};

	// 设置随路数据
	this.setCallData = function(dataKey, dataValue) {
		return setCallData(dataKey, dataValue);
	};

	// 获取坐席状态
	this.getAgentState = function(agentId, success, error) {
		return getAgentState(agentId, success, error);
	};
	
	// 开始录音
	this.startRecord = function(fileName) {
		return startRecord(fileName);
	};

	// 结束录音
	this.stopRecord = function() {
		return stopRecord();
	};

	// 抢接路由
	this.routeSelect = function(contactId, destType, destDesc) {
		return routeSelect(contactId, destType, destDesc);
	};

	this.onOnline = function(event) {
		
	};
	
	this.onOffline = function(event) {
		
	};
	
	this.onStatusChanged = function(event) {
	};

	this.onDialing = function(event) {
	};

	this.onOffering = function(event) {
	};

	this.onConnected = function(event) {
	};

	this.onReleased = function(event) {
	};

	this.onRecordEnd = function(event) {
	};

	this.onError = function(event) {
	};
};
