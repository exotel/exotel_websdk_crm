
var baseurl = "https://integrationscore.us3.qaexotel.com";
// var baseurl = "http://localhost:8080";
var voipdomain = "voip.exotel.in";
var voipdomain_sip = "voip.exotel.com";

// ========================= start of widgets ====================================

var widgetContainer = $(`<div style="box-shadow: -5px 0 5px rgba(0, 0, 0, 0.5);"> <div id="ic_cbcontainer"></div> <div id="ic_widgetcontainer"> </div> </div>`);

var widget = $(`<iframe style="height:95vh;border: none;"  scrolling="no"  width="500"
                    id="icwidget" src="https://integrationscore.us3.qaexotel.com/v2/integrations/widgets" title="description"></iframe>`);

// var widget = $(`<iframe style="height:95vh;border: none;"  scrolling="no"  width="500"
//                     id="icwidget" src="http://localhost:8080/v2/integrations/widgets" title="description"></iframe>`);

var clickevents;

class widgets {
    constructor(showtoggle, _clickevents) {

        widgetContainer.appendTo('#callwidgetpanel');
        // widget_toggle_sip.appendTo('#ic_cbcontainer');
        // widget_toggle_device.appendTo('#ic_cbcontainer');baseurl
        widget.appendTo('#ic_widgetcontainer');

        clickevents = _clickevents;
        // widget.hide();

        // if (showtoggle) {
        //     this.ShowToggleBox();
        // }

        $('#sip-enabled').change(function () {
            if (this.checked) {
                widget.show();
                if (clickevents !== null) {
                    clickevents("register");
                }
                // var returnVal = confirm("Are you sure?");
                // $(this).prop("checked", returnVal);
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
        // document.getElementById('icwidget').contentWindow.postMessage(creds, "*");
    }

    // ShowToggleBox() {
    //     widget_toggle_sip.show();
    //
    // }
    // HideToggleBox() {
    //     widget_toggle_sip.hide();
    // }

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
var _accesstoken = "";
var _loggedinuserid = "";
var sipAccountInfo = {};

class IPPstnCall {

    //this constructor is invoked when called from ippstn.js,
    constructor(accesstoken, loggedinuserid, autoconnectvoip,SoftPhoneRegisterEventCallBack = null, SoftPhoneCallListenerCallback = null) {
        $.ic_userid = loggedinuserid;
        if($.ic_settingloaded !== true) {
            this.LoadSettings(accesstoken);
            this.LoadUserDetails(accesstoken, loggedinuserid);
        }
        this.Initialize(accesstoken, loggedinuserid, autoconnectvoip,SoftPhoneRegisterEventCallBack,SoftPhoneCallListenerCallback);

    }

    Initialize(accesstoken, loggedinuserid, autoconnectvoip,SoftPhoneRegisterEventCallBack , SoftPhoneCallListenerCallback ){
        _SoftPhoneCallListenerCallback = SoftPhoneCallListenerCallback;
        _SoftPhoneRegisterEventCallBack = SoftPhoneRegisterEventCallBack;

        console.log("InitializeWidgets")
        _accesstoken = accesstoken;
        _loggedinuserid = loggedinuserid;
        this.PullUserDetailsWithSipInfo();

        exWebClient = new exotelSDK.ExotelWebClient();
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
            'userName': $.ic_user.SipId.split(':')[1],// sipInfo.Username,
            'authUser': $.ic_user.SipId.split(':')[1],//sipInfo.Username,
            'sipdomain': $.ic_app.Data.ExotelAccountSid + "." + voipdomain_sip,//sipInfo.Domain,
            'domain': voipdomain + ":443",// sipInfo.HostServer + ":" + sipInfo.Port,
            // 'sipdomain': "ccplexopoc1m.voip.exotel.com",//sipInfo.Domain,
            // 'domain': "voip.exotel.in:443",// sipInfo.HostServer + ":" + sipInfo.Port,
            'displayname': $.ic_user.ExotelUserName,//sipInfo.DisplayName,
            'secret': $.ic_user.SipSecret,//sipInfo.Password,
            'port': "443",//sipInfo.Port,
            'security': "wss",//sipInfo.Security,
            'endpoint': "wss"//sipInfo.EndPoint
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
            headers: {"Authorization":  _accesstoken , 'content-type': 'application/json'},
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

    LoadUserDetails(appid,userid){
        //load userdetails
        $.ajax({
            url: baseurl + '/v2/integrations/usermapping?app_id=' + appid + "&user_id=" +  userid,
            dataType: 'json',
            async: false,
            success: function(data) {
                $.ic_user = data.Response;
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
        this.LoadSettings(Authtoken);
        this.LoadUserDetails(Authtoken,userid);
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
    LoadUserDetails(appid,userid){
        //load userdetails
        $.ajax({
            url: baseurl + '/v2/integrations/usermapping?app_id=' + appid + "&user_id=" +  userid,
            dataType: 'json',
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
//
// function SetupPositions(position){
//     if (position === "BottomRight"){
//         $("#togglewidget").css({'bottom':'1%','top':''});
//         return;
//     }
//     if (position === "TopRight"){
//         $("#togglewidget").css({'top':'1%','bottom':''});
//         return;
//     }
// }
//============================= end of softphone ======================================