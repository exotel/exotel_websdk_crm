import "./App.css";
import React, { useEffect, useState } from "react";
import ExotelCRMWebSDK from "exotel-ip-calling-crm-websdk";
import Notification from "./Notification";

const accessToken = "<accessToken>";
const userId = "<userId>";

function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("info");
  const [notificationMessage, setNotificationMessage] = useState(
    "Dialling +918878367443"
  );
  const [webPhone, setWebPhone] = useState(null);

  const HandleCallEvents = (eventType, ...args) => {
    console.log("HandleCallEvents", eventType,{ args });
    switch (eventType) {
      case "incoming":
        setIsIncomingCall(true);
        break;
      case "connected":
        setCallActive(true);
        break;
      case "callEnded":
        setCallActive(false);
        setIsIncomingCall(false);
        break;
      case "holdtoggle":
        handleToggleOnHold();
        break;
      case "mutetoggle":
        handleToggleMute();
        break;
      // eslint-disable-next-line no-fallthrough
      default:
        break;
    }
  };

  const RegisterationEvent = (status) => {
    if (status === "registered") {
      setShowNotification(true);
      setNotificationType("info");
      setNotificationMessage(`Device is online`);
      setTimeout((_) => {
        setShowNotification(false);
      }, 3000);

    }
  };

  useEffect(() => {
    return async () => {
      if (webPhone) {
        return;
      }
      const crmWebSDK = new ExotelCRMWebSDK(accessToken, userId, true);
      const crmWebPhone = await crmWebSDK.Initialize(
        HandleCallEvents,
        RegisterationEvent
      );
      console.log({crmWebPhone});
      setWebPhone(crmWebPhone);
    };
  });

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const dialCallback = (status, data) => {
    console.log("Inside dialCallback", status, data);
    // if (status === "success") {
    //   // webPhone?.AcceptCall();
    //   setCallActive(true);
    //   return;
    // }
    // setCallActive(false);
  }

  const dial = () => {
    if (/^\+?[0-9]{10,14}$/.test(phoneNumber)) {
      setCallActive(true);
      setIsIncomingCall(false);
      showDiallingNotification(phoneNumber);
      webPhone?.MakeCall(phoneNumber, dialCallback);
    } else {
      showDiallingErrorNotification();
    }
  };

  const showDiallingNotification = (phoneNumber) => {
    setShowNotification(true);
    setNotificationType("info");
    setNotificationMessage(`Dialling <b>${phoneNumber}</b>`);
    setTimeout((_) => {
      setShowNotification(false);
    }, 3000);
  };

  const showDiallingErrorNotification = () => {
    setShowNotification(true);
    setNotificationType("danger");
    setNotificationMessage(
      "Please enter a valid phone number (10-14 digits, optional +)."
    );
    setTimeout((_) => {
      setShowNotification(false);
    }, 3000);
  };

  const acceptCall = () => {
    webPhone?.AcceptCall();
  };

  const hangup = () => {
    webPhone?.HangupCall();
    setCallActive(false);
    showCallEndedNotification();
  };

  const showCallEndedNotification = () => {
    setShowNotification(true);
    setNotificationType("info");
    setNotificationMessage("Call Disconnected");

    setTimeout((_) => {
      setShowNotification(false);
    }, 3000);
  };

  const onClickToggleMute = () => {
    webPhone?.ToggleMute();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    setShowNotification(true);
    setNotificationType("info");
    if (!isMuted) {
      setNotificationMessage("Call Muted");
    } else {
      setNotificationMessage("Call Un-muted");
    }
    setTimeout((_) => {
      setShowNotification(false);
    }, 3000);
  };

  const handleToggleOnHold = () => {
    if (isOnHold) {
      setIsOnHold(false);
      return;
    }
    setIsOnHold(true);
  };

  const onClickToggleHold = () => {
    webPhone?.ToggleHold();
  };

  return (
    <div className="App">
      <h2>Exotel Web Phone Sample Interface</h2>
      {showNotification && notificationMessage && (
        <Notification
          notificationMessage={notificationMessage}
          type={notificationType}
        />
      )}
      <input
        className="phoneNumberInput"
        type="text"
        id="phoneNumber"
        placeholder="Enter phone number"
        pattern="^\+?[0-9]{10,14}$"
        title="Please enter a valid phone number (10-14 digits, optional +)."
        onChange={handlePhoneNumberChange}
      ></input>
      <div className="PhoneControls">
            {!callActive && (<button className="dial" onClick={dial}>
              Dial
            </button>)}
            {callActive && (<button className="accept" onClick={acceptCall}>
              Accept
            </button>)}
        <button className="hangup" onClick={hangup} disabled={!callActive}>
          Hangup
        </button>
        {callActive && (
          <>
            <button
              className="mute-unmute"
              onClick={onClickToggleMute}
              disabled={!callActive}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              className={isOnHold ? "UnHold" : "Hold"}
              onClick={onClickToggleHold}
              disabled={!callActive}
            >
              {isOnHold ? "Unhold" : "Hold"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
