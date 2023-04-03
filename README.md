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
  

## Below is complete code for a html file which integrates the websdk.

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

