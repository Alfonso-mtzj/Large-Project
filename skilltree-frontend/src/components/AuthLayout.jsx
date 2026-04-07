import React from "react";
import "./authLayout.css";
import forestBg from "../assets/auth/Login-register.png";

// ADDED: overlayClassName prop so Register can use authOverlayRegister
export default function AuthLayout({ frameSrc, children, overlayClassName = "authOverlay" }) {
  return (
    <div
      className="authBg"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.70)), url(${forestBg})`,
      }}
    >
      <div className="authFrameWrap">
        <img className="authFrame" src={frameSrc} alt="" />

        {/* CHANGED: use overlayClassName instead of hardcoding authOverlay */}
        <div className={overlayClassName}>
          {children}
        </div>
      </div>
    </div>
  );
}
