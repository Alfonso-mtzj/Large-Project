import React from "react";
import "./authLayout.css";
import forestBg from "../assets/auth/forest-bg.jpg";

export default function AuthLayout({ frameSrc, children }) {
  return (
    <div
      className="authBg"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.70)), url(${forestBg})`,
      }}
    >
      <div className="authFrameWrap">
        <img className="authFrame" src={frameSrc} alt="" />
        <div className="authOverlay">
          {children}
        </div>
      </div>
    </div>
  );
}
