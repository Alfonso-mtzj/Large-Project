import { useEffect } from 'react';
import "./authLayout.css";
import forestBg from "../assets/auth/Login-register.png";

export default function AuthLayout({
  frameSrc,
  children,
  overlayClassName = "authOverlay",
  frameWrapClassName = "authFrameWrapLogin",
}) {

  useEffect(() => {
    const container = document.querySelector('.authBg');
    if (!container) return;
    const flies = [];

    for (let i = 0; i < 30; i++) {
      const ff = document.createElement('div');
      ff.className = 'firefly';
      ff.style.left = Math.random() * 95 + '%';
      ff.style.top  = Math.random() * 90 + '%';
      ff.style.setProperty('--dx1', (Math.random()*120-60) + 'px');
      ff.style.setProperty('--dy1', (Math.random()*80-40)  + 'px');
      ff.style.setProperty('--dx2', (Math.random()*160-80) + 'px');
      ff.style.setProperty('--dy2', (Math.random()*120-60) + 'px');
      ff.style.animationDuration = `${Math.random()*6+4}s, ${Math.random()*2+1.5}s`;
      ff.style.animationDelay    = `${Math.random()*8}s, ${Math.random()*8}s`;
      container.appendChild(ff);
      flies.push(ff);
    }

    return () => flies.forEach(f => f.remove());
  }, []);

  return (
    <div
      className="authBg"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.70)), url(${forestBg})`,
      }}
    >
      <div className={frameWrapClassName}>
        {/* PNG frame — pointer-events none so clicks reach inputs */}
        <img className="authFrame" src={frameSrc} alt="" />

        {/* Overlay fills frame; form inside uses position:absolute inset:0 */}
        <div className={overlayClassName}>
          {children}
        </div>
      </div>
    </div>
  );
}
