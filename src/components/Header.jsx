import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { name: "Main", path: "/" },
    { name: "Free Board", path: "/free" },
    { name: "Sign Up", path: "/signup" },
    { name: "Login", path: "/login" },
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <img
          src="/assets/ngm-logo-square.png"
          alt="NGM"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
          }}
        />

        <button
          onClick={() => setOpen(true)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            padding: "12px 18px",
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          Menu
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  setOpen(false);
                  navigate(link.path);
                }}
                style={{
                  height: 64,
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {link.name}
              </button>
            ))}

            <button
              onClick={() => setOpen(false)}
              style={{
                height: 64,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "white",
                color: "black",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </>
  );
}
