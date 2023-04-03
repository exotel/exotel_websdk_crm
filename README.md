# WebSDK for IPPSTN Calling

This project provides an easy-to-integrate SoftPhone SDK for web applications. The SDK allows developers to embed a fully functional softphone within their web projects, enabling seamless communication between agents and customers. The softphone supports both inbound and outbound calling, along with programmatically making calls from outside the iframe. By following the simple integration steps provided, developers can quickly enhance their applications with powerful voice communication capabilities.

## Getting Started

Below are the steps to integrate the SDK:

1. Download the web SDK
2. Include the folder in wwwroot of your web project.
3. Include the SoftPhoneSDK.js and crypto-js.min.js in the head of your page.
4. Create an instance of SoftPhoneSDK using the below code: 

   var softphone = new SoftPhone(); 
   
  // Call InitializeWidgets method to render the iframe with call controls
  // "InitializeWidgets" method takes two parameters, first is your access token and second is the agent's username
  
  softphone.InitializeWidgets("ODZmYjJiOGItZGE4YS00NjQ5LWE4MmMtZGI5NzZiOTM0YzY0", "sumit");
  
5.The above code will render an iframe within the ic_widgetcontainer div.

6.The same SDK can also be used for programmatically making outbound calls from outside the iframe. An example is shown below.

7.Call the below method for making an outbound call

  softphone.MakeCall(phone);

