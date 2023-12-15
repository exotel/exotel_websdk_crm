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

    <!-- //websdk -->
    <script type="text/javascript" src="https://integrationscore.mum1.exotel.com/public/websdk/assets/dist/exotelsdk.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <script type="text/javascript" src="./public/websdk/js/SoftphoneSDK.js"></script> 


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


        // var ippstncall = new IPPstnCall("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6ImRlOWUxZmM0LTYxMWYtNDU0Mi05ZWRlLWRjMzFmOWI1NzFiZiIsImV4cCI6MTY5ODY3NTMxNH0.c_RJdsZccwXd431lExS-PSrdsu-EYmWcxxGWPyssdIU",
        //     "SumitSagar", true, PhoneRegisterEventCallBack, PhoneCallListenerCallback);
        var ippstncall = new IPPstnCall("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjgxMTc0NDI3LTc5NTgtNDFkYi05MzI5LTU3YzQyYTNlNjQ0NSIsImV4cCI6MTcxMDA1MTk5Mn0.9E9YWOD6EMbr13MnjlKvOyezsY53FYzGE6T60gjauYY",
            "sumitexotel133m", true, PhoneRegisterEventCallBack, PhoneCallListenerCallback);

        //now call register device to resgister
        ippstncall.RegisterDevice();
        $.ippstncall = ippstncall;
        //end of code         
    });

    function MakeCallCallback(callbackmessage, data) {
        // alert("Click to call respon se -> " + callbackmessage);
        //alert("API : " + callbackmessage + " Response : " + JSON.stringify(data));
        $("#log").html("API : " + callbackmessage + " Response : " + JSON.stringify(data));
    }
    function Call() {
        var phone = $("#phone").val();
        $.ippstncall.MakeCall(phone, MakeCallCallback);
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

