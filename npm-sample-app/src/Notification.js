import React from "react";
import './Notification.css';

export default function Notification({notificationMessage, type='info'}) {
  return (
    <>
      {
        <div
          className={`notification ${type}`}
          dangerouslySetInnerHTML={{ __html: notificationMessage }}
        ></div>
      }
    </>
  );
}