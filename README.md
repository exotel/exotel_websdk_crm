# WebSDK for IPPSTN Calling

This project provides an easy-to-integrate SoftPhone SDK for web applications. The SDK allows developers to embed a fully functional softphone within their web projects which can be an inhouse webportal or a CRM Application, enabling seamless communication between agents and customers. The softphone supports both inbound and outbound calling, along with programmatically making calls . By following the simple integration steps provided, developers can quickly enhance their applications with powerful voice communication capabilities.

## Getting Started

Below are the steps to integrate the SDK:

1. Download the WebSDK folder from this repository.
2. Include the folder in wwwroot of your web project.
3. Include the SoftPhoneSDK.js and crypto-js.min.js in the head of your page.
4. Create an instance of SoftPhoneSDK using the below code: 

```
   var softphone = new SoftPhone(); 
   
  // Call InitializeWidgets method to render the iframe with call controls
  // "InitializeWidgets" method takes two parameters, first is your access token and second is the agent's username
  
  softphone.InitializeWidgets("ODZmYjJiOGItZGE4YS00NjQ5LWE4MmMtZGI5NzZiOTM0YzY0", "sumit");
  ```
  
5.The above code will render an iframe within the ic_widgetcontainer div.

6.The same SDK can also be used for programmatically making outbound calls from outside the iframe. An example is shown below.

7.Call the below method for making an outbound call

```
  softphone.MakeCall(phone);
  ```
  

## Below is complete code for a html file which integrates the websdk and Loads a UI for using the call Functionality.

```
<html>
<head>
    <title>MyCrm</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

    <script src="./websdk/assets/dist/exotelsdk.js"></script>
    <script type="text/javascript" src="./websdk/assets/dist/SoftphoneSDK.js"></script>
</head>
<body>
    <div style="height:300px;width:500px;float:left;">
    <input type="text" id="phone" name="phone" placeholder="Enter Phone Number" style="width: 300px; height: 30px; border: 1px solid grey; border-radius: 5px; padding: 5px; margin: 5px;">
    <input type="button" id="call" name="call" value="Call" style="width: 100px; height: 30px; border: 1px solid grey; border-radius: 5px; padding: 5px; margin: 5px;">
    </div>
    <!--add this div to your html page, this will serve as place holder for rendering the iframe with various call controls -->
    <div id="ic_widgetcontainer" style="border: 1px solid grey;width: 500px;float: right;">
    </div>
</body>
<script>
    $(document).ready(function(){
        //create instance of softphone js
        var softphone = new SoftPhone(); 
        //call InitializeWidgets method to render the iframe with call controls
        //"InitializeWidgets" method takes two parameters, first is your accesstoke and second is agent's username
        softphone.InitializeWidgets("ODZmYjJiOGItZGE4YS00NjQ5LWE4MmMtZGI5NzZiOTM0YzY0", "sumit");

        //call the "Call" method to initiate a outbount call
        $("#call").click(function(){
            var phone = $("#phone").val();
            softphone.MakeCall(phone);
        });
    });
</script>
</html>
```

## Below is complete code for a html file which integrates the websdk and emits events to callback functions, this can be used to build your own UI and integrated the calling functionality via SDK.

```
<!DOCTYPE html>
<html>

<head>
    <title>CRM Application</title>


    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

    <!-- //websdk -->
    <script type="text/javascript" src="WebSDK/assets/dist/exotelsdk.js"></script>
    <script type="text/javascript" src="WebSDK/assets/dist/SoftphoneSDK.js"></script>


</head>

<body>
    <header>SDK Demo Application</header>
    </br>
    Device status : <div id="devicestatus" style="color: blue;"></div>
    </br>
    </br>
    <input type="text" id="phone" placeholder="Enter Phone Number" value="">
    <button onclick="Call()">Call</button>
    </br>
    </br>
    <button onclick="AcceptCall()">Accept Call</button>
    <button onclick="RejectCall()">Reject Call</button>
    <button onclick="ToggleMute()">Mute Call</button>
    <button onclick="ToggleHold()">Hold Call</button>
    <div id="" style="margin-top: 100px;">logs</div>
    <div id="log" style="margin-top: 10px;">-----</div>
</body>
<script>
    $(document).ready(function () {
        //******************** - use only events , not the UI widgets ************** 
        function PhoneCallListenerCallback(a,b) {  
            debugger;
            console.log('=====PhoneCallListenerCallback==========');
            console.log('%c ' + a, 'background: #222; color: #bada55');
        }
        function PhoneRegisterEventCallBack(a) {
            // alert(a);
            $('#devicestatus').html(a);
            // $("#log").html(a);
            console.log('=====PhoneRegisterEventCallBack==========');
            console.log('%c ' + a, 'background: #222; color: #bada55');
        }

         /*"token", // Authorization token for the IPPstnCall service generated through token api using entity as app
           "appuserid", // String: Unique identifier for the app user making the call
           "autoconnectvoip", // Boolean: Indicates whether to auto register the sip 
           "PhoneRegisterEventCallBack", // Function: Callback to handle phone registration events
           "PhoneCallListenerCallback",  // Function: Callback to handle phone call events
         */
        var ippstncall = new IPPstnCall("<token>",
            "<appuserid>", false, PhoneRegisterEventCallBack, PhoneCallListenerCallback);

        //now call register device to resgister only when autoconnectvoip is set to false
        ippstncall.RegisterDevice();
        $.ippstncall = ippstncall;
        //end of code         
    });

    // Check the `SDK Initialization and User Registration Error Messages` section below for the list of statuses and messages.
    function OutboundResponse(status, message) {
        alert(status + " " + JSON.stringify(message))
    }

    function Call() {
        var phone = $("#phone").val();
        $.ippstncall.MakeCall(phone, OutboundResponse)
    }

    function ToggleHold() {
        $.ippstncall.toggleHoldButton();
    }
    function ToggleMute() {
        $.ippstncall.toggleMuteButton();
    }
    function RejectCall() {
        $.ippstncall.rejectCall();
    }
    function AcceptCall() {
        $.ippstncall.acceptCall();
    }

</script>

</html>
```

# SDK Initialization and User Registration Error Messages:
The following statuses and messages are thrown before initiating a call. You can handle these errors in the OutboundResponse function. 

|  status    | message |
| :---: | :---: |
| media_permission_denied   | either media device not available, or permission not given   |
| not_initialized   | sdk is not intialied   |
| websocket_connection_failed   | websocket connection is failing, due to network connectivity   |
| unregistered, terminated   | either your credential is invalid or registration keep alive failed   |
| initial   | sdk registration is progress   |
| registered   | ready   |
| unknown   | something went wrong   |
| disconnected   | websocket is not connected   |
| connecting   | Trying to connect the websocket   |

