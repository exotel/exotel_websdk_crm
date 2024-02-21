
// version 1.3
//***********voip config ******************* */
var voipdomain = "voip.in1.exotel.com:5071";//veeno
var voipdomain_sip = "voip.exotel.com";

var baseurl = "https://integrationscore.mum1.exotel.com";

// ========================= start of widgets ====================================

var widgetContainer = $(`<div style="box-shadow: -5px 0 5px rgba(0, 0, 0, 0.5);"> <div id="ic_cbcontainer"></div> <div id="ic_widgetcontainer"> </div> </div>`);
// //
// var widget = $(`<iframe style="height:95vh;border: none;"  scrolling="no"  width="380"
//                     id="icwidget" src="https://integrationscore.us3.qaexotel.com/v2/integrations/widgets" title="description"></iframe>`);

var widget = $(`<iframe style="height:95vh;border: none;"  scrolling="no"  width="380"
                    id="icwidget" src="https://integrationscore.mum1.exotel.com/v2/integrations/widgets" title="description"></iframe>`);



var clickevents;

class widgets {
    constructor(showtoggle, _clickevents) {

        widgetContainer.appendTo('#callwidgetpanel');
        widget.appendTo('#ic_widgetcontainer');

        clickevents = _clickevents;
        $('#sip-enabled').change(function () {
            if (this.checked) {
                widget.show();
                if (clickevents !== null) {
                    clickevents("register");
                }
            } else {
                widget.hide();
                if (clickevents !== null) {
                    clickevents("unregister");
                }
            }
        });
        this.RegisterPostmessageReceiver();
    }

    SetCreds(Authtoken,userid){
        var creds = {
            event : "credanddetails",
            token : Authtoken,
            userid : userid,
            baseurl : baseurl
        };
        var iframe = document.getElementById('icwidget');
        // Check if the iframe is already loaded
        if (iframe.readyState === 'complete') {
            // Send a message to the iframe
            iframe.contentWindow.postMessage(creds, '*');
        } else {
            // Wait for the iframe to finish loading
            iframe.addEventListener('load', function() {
                // Send a message to the iframe
                iframe.contentWindow.postMessage(creds, '*');
            });
        }

    }
    RegisterPostmessageReceiver() {
        window.addEventListener("message", receiveMessage, false);
        function receiveMessage(event) {
            console.log("event received from " + event.origin);
            console.log("message received in parent window --> " + event.data + event.origin);
            if (event.origin !== "https://integrationscore.us3.qaexotel.com"){
                console.log("not a authorized domain!");
                // return;
            }
            if(event.data.indexOf('makecall') != -1){
                ippstncall.MakeCall(event.data.split(':')[1],MakeCallCallbackForDialerWidget);
                return;
            }else if(event.data.indexOf('currentdevice') != -1){
                if(event.data.split(':')[1] === "sip") {
                    ippstncall.RegisterDevice();
                }else{
                    ippstncall.UnRegisterDevice();
                }
            }
            if (clickevents !== null) {
                clickevents(event.data);
            }
        }
    }

    TakeAction(event,phoneno){
        var data = {"event" :event ,"phoneno": phoneno};
        document.getElementById('icwidget').contentWindow.postMessage(data, "*");
    }

}

function MakeCallCallbackForDialerWidget(callbackmessage){
    var data = {"event" : "c2cresponse" ,"data": callbackmessage};
    document.getElementById('icwidget').contentWindow.postMessage(data, "*");
}

//========================== end of widgets ====================================

// ========================== start of ippstncall ====================================


var _SoftPhoneCallListenerCallback = null;
var _SoftPhoneRegisterEventCallBack = null;
var call = null;
var exWebClient = null;
// var _accesstoken = "";
var _loggedinuserid = "";
var sipAccountInfo = {};

class IPPstnCall {

    //this constructor is invoked when called from ippstn.js,
    constructor(authtoken, loggedinuserid, autoconnectvoip,SoftPhoneRegisterEventCallBack = null, SoftPhoneCallListenerCallback = null) {
        $.ic_userid = loggedinuserid;
        //this might be the case if widgets are not useds
        if($.ic_authtoken  === undefined){
            $.ic_authtoken = authtoken;
        }
        if($.ic_settingloaded !== true) {
            this.LoadSettings(authtoken);
            this.LoadUserDetails(loggedinuserid);
        }
        this.Initialize(authtoken, loggedinuserid, autoconnectvoip,SoftPhoneRegisterEventCallBack,SoftPhoneCallListenerCallback);

    }

    Initialize(accesstoken, loggedinuserid, autoconnectvoip,SoftPhoneRegisterEventCallBack , SoftPhoneCallListenerCallback ){
        _SoftPhoneCallListenerCallback = SoftPhoneCallListenerCallback;
        _SoftPhoneRegisterEventCallBack = SoftPhoneRegisterEventCallBack;

        //debugger;
        console.log("InitializeWidgets");
        // _accesstoken = accesstoken;
        _loggedinuserid = loggedinuserid;
        this.PullUserDetailsWithSipInfo();

        exWebClient = new exotelSDK.ExotelWebClient();
        console.log(sipAccountInfo);
        exWebClient.initWebrtc(sipAccountInfo, this.RegisterEventCallBack, this.CallListenerCallback, this.SessionCallback)

        if (autoconnectvoip) {
            this.RegisterDevice();
        }
    }
    RegisterDevice() {
        exWebClient.DoRegister();
    }

    UnRegisterDevice() {
        exWebClient.unregister();
    }

    CallListenerCallback(callObj, eventType, sipInfo) {
        call = exWebClient.getCall();
        callObj.callFromNumber = exWebClient.callFromNumber
        console.log(call.callDetails());
        if (_SoftPhoneCallListenerCallback != null) {
            _SoftPhoneCallListenerCallback(eventType, callObj);
        }
    }

    RegisterEventCallBack(state, sipInfo) {

        if (_SoftPhoneRegisterEventCallBack != null) {
            _SoftPhoneRegisterEventCallBack(state);
        }
        if (state === 'registered') {

        } else {
        }
    }

    SessionCallback(state, sipInfo) {
        console.log('Session state:', state, 'for number...', sipInfo);
    }

    PullUserDetailsWithSipInfo() {
        //make a http call to get user details for "_loggedinuserid" and use accesstoken for auth
        // var sipInfo = JSON.parse(phone)[0]
        sipAccountInfo = {
            'userName': $.ic_user.SipId.split(':')[1],
            'authUser': $.ic_user.SipId.split(':')[1],
            'sipdomain': $.ic_app.Data.ExotelAccountSid + "." + voipdomain_sip,
            'domain': voipdomain,
            'displayname': $.ic_user.ExotelUserName,
            'secret': $.ic_user.SipSecret,
            'port': "5070",
            'security': "wss",
            'endpoint': "wss"
        };
        console.log("------------------sipAccountInfo------------------");
        console.log(sipAccountInfo);
    }

    acceptCall() {
        if (call) {
            call.Answer();
        }
    }

    rejectCall() {
        if (call) {
            call.Hangup();
        }
    }

    checkClientStatus(callback) {
        exWebClient.checkClientStatus(function(status) {
            console.log("SDK Status " + status);
            callback(status);
        });
    }

    MakeCall(number, callback) {
        let payload = {
            "customer_id": $.ic_user.customer_id,
            "app_id": $.ic_user.AppID,
            "to": number,
            "user_id": $.ic_user.AppUserId
        }

        //make call
        $.ajax({
            type: 'POST',
            url: baseurl + '/v2/integrations/call/outbound_call',
            dataType: 'json',
            headers: {"Authorization":  $.ic_authtoken , 'content-type': 'application/json'},
            data: JSON.stringify(payload),
            async: true,
            success: function(data) {
                console.log("Success make call : ", data);
                if(callback !== null && callback !== undefined) {
                    callback("success", data);

                }
            },
            error: function(xhr, textStatus, error){
                console.log(xhr.statusText);
                console.log(textStatus);
                console.log(error);
                if(callback !== null && callback !== undefined) {
                    callback("failed", error);
                }
            }
        });

    }

    toggleHoldButton() {
        if (call) {
            call.HoldToggle();
            if (_SoftPhoneCallListenerCallback != null) {
                _SoftPhoneCallListenerCallback("holdtoggle", call);
            }
        }
    }

    toggleMuteButton() {
        debugger;
        if (call) {
            call.Mute();
            _SoftPhoneCallListenerCallback("mutetoggle", call);
        }
    }

    LoadSettings(token){

        //load app details
        $.ajax({
            url: baseurl+ '/v2/integrations/app',
            dataType: 'json',
            method : 'GET',
            async: false,
            headers: {"Authorization":  token},
            success: function(data) {
                $.ic_app = data;
            }
        });
        //load app settings
        $.ajax({
            url: baseurl + '/v2/integrations/app_setting',
            dataType: 'json',
            method : 'GET',
            async: false,
            headers: {"Authorization":  token},
            success: function(data) {
                $.ic_app_settings = data;
                $.each(data, function(key, value) {
                    if(value.SettingKey === "WidgetPosition"){
                        // SetupPositions(value.SettingVal);
                    }
                });
            }
        });
    }

    LoadUserDetails(userid){
        //load userdetails
        $.ajax({
            url: baseurl + '/v2/integrations/usermapping?user_id=' +  userid,
            dataType: 'json',
            headers: {"Authorization":  $.ic_authtoken , 'content-type': 'application/json'},
            async: false,
            success: function(data) {
                $.ic_user = data.Data;
                const key = '6368616e676520746869732070617373776f726420746f206120736563726574';
                const ciphertext = $.ic_user.SipSecret;
                const keyBytes = CryptoJS.enc.Hex.parse(key);
                const iv = CryptoJS.enc.Hex.parse(ciphertext.substring(0, 32));
                const encrypted = ciphertext.substring(32);
                const decrypted = CryptoJS.AES.decrypt(
                    { ciphertext: CryptoJS.enc.Hex.parse(encrypted) },
                    keyBytes,
                    { iv: iv, padding: CryptoJS.pad.NoPadding, mode: CryptoJS.mode.CFB }
                );
                $.ic_user.SipSecret = decrypted.toString(CryptoJS.enc.Utf8)
            }
        });
    }

}

//=========================== end of ippstn call =========================================


// ============================ start of softphone ======================================

var ippstncall;
var widgetcontroller;


class SoftPhone {
    constructor() {
    }

    InitializeWidgets(Authtoken , userid, autoconnectvoip = false) {
        $.ic_authtoken = Authtoken;
        this.LoadSettings(Authtoken);
        this.LoadUserDetails(userid);
        $.ic_userid = userid;
        $.ic_settingloaded = true;

        function WidgetEvents(event) {
            if (event == 'register') {
                ippstncall.RegisterDevice();
            }
            if (event == 'unregister') {
                ippstncall.UnRegisterDevice();
            }
            if (event == 'acceptcall') {
                ippstncall.acceptCall();
            }
            else if (event == 'rejectcall') {
                ippstncall.rejectCall();
            }
            else if (event == 'rejectCall_ongoingcall') {
                ippstncall.rejectCall();
            }
            else if (event == 'toggleMuteButton') {
                ippstncall.toggleMuteButton();
            }
            else if (event == 'toggleHoldButton') {
                ippstncall.toggleHoldButton();
            }
        }
        widgetcontroller = new widgets(true, WidgetEvents);

        widgetcontroller.SetCreds(Authtoken,userid);


        function SoftPhoneCallListenerCallback(event, b) {

            widgetcontroller.TakeAction(event,b.callFromNumber);
            return;
        }
        function SoftPhoneRegisterEventCallBack(a) {
            console.log('=====SoftPhoneRegisterEventCallBack==========');
            console.log(a);
        }
        // if (!autoconnectvoip) {
        //     widgetcontroller.ShowToggleBox();
        // }

        ippstncall = new IPPstnCall(Authtoken, userid, autoconnectvoip, SoftPhoneRegisterEventCallBack, SoftPhoneCallListenerCallback);

    }

    MakeCallCallback(status, callback, number) {
        if (status === "Registered") {
            this.MakeCall(number, callback);
        }else {
            //switch case and return callCall("Error", "Error Msg");
            //console.log("Status is: " + status);
            // Dictionary to map status codes to descriptions
            const errorDescriptions = {
                "media_permission_denied": "Media permission not given",
                "not_initialized": "sdk is not initialized",
                "websocket_connection_failed": "WebSocket connection is failing, due to network connectivity",
                "Disconnected": "websocket is not connected",
                "Unregistered": "either your credential is invalid or registration keep alive failed",
                "Terminated": "either your credential is invalid or registration keep alive failed",
                "Initial": "sdk registration is progress",
                "Registered": "ready",
                "unknown": "something went wrong",
                "Connecting": "Trying to connect the websocket",
            };
            // Check if the error code exists in the errorDescriptions object
            if (errorDescriptions.hasOwnProperty(status)) {
                // Get the description based on the status code
                var description = errorDescriptions[status];
            } else {
                // If the error code doesn't exist, default to "Unknown" and log a message
                console.log("Unknown status code:", status);
                var description = "Unknown";
            }
            var errorData = {
                "Response": {
                    "code": status,
                    "description": description
                }
            }
            callback("failed", errorData);
        }
    }

    MakeCallwithStatus(number, callback) {
        ippstncall.checkClientStatus(function(status){
            $.softphone.MakeCallCallback(status, callback, number);
        });
    }

    //if this method is called, this mean customer is using widgets tool, so we neet to pass message to iframe about call
    //direction
    MakeCall(phoneno,callback){
        ippstncall.MakeCall(phoneno,(message,data) => {
            //this is need to update call direction text in iframe widgets
            var data = {"event" :"c2ccalltriggered" ,"phoneno": phoneno};
            document.getElementById('icwidget').contentWindow.postMessage(data, "*");
            callback(message,data);
        });
    }


    LoadSettings(token){

        //load app details
        $.ajax({
            url: baseurl + '/v2/integrations/app',
            dataType: 'json',
            method : 'GET',
            async: false,
            headers: {"Authorization":  token},
            success: function(data) {
                $.ic_app = data;
            }
        });
        //load app settings
        $.ajax({
            url: baseurl+ '/v2/integrations/app_setting',
            dataType: 'json',
            method : 'GET',
            async: false,
            headers: {"Authorization":  token},
            success: function(data) {
                $.ic_app_settings = data;
                $.each(data, function(key, value) {
                    if(value.SettingKey === "WidgetPosition"){
                        SetupPositions(value.SettingVal);
                    }
                });
            }
        });
    }
    LoadUserDetails(userid){
        //load userdetails
        $.ajax({
            url: baseurl + '/v2/integrations/usermapping?user_id=' +  userid,
            dataType: 'json',
            async: false,
            headers: {"Authorization":  $.ic_authtoken , 'content-type': 'application/json'},
            success: function(data) {
                $.ic_user = data.Data;
                const key = '6368616e676520746869732070617373776f726420746f206120736563726574';
                const ciphertext = $.ic_user.SipSecret;
                const keyBytes = CryptoJS.enc.Hex.parse(key);
                const iv = CryptoJS.enc.Hex.parse(ciphertext.substring(0, 32));
                const encrypted = ciphertext.substring(32);
                const decrypted = CryptoJS.AES.decrypt(
                    { ciphertext: CryptoJS.enc.Hex.parse(encrypted) },
                    keyBytes,
                    { iv: iv, padding: CryptoJS.pad.NoPadding, mode: CryptoJS.mode.CFB }
                );
                $.ic_user.SipSecret = decrypted.toString(CryptoJS.enc.Utf8)
            }
        });
    }
}
//============================= end of softphone ======================================
