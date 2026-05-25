import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const navLinks = [
    { label: "Free Board", path: "/free" },
    { label: "Content", path: "/content" },
    { label: "Premium", path: "/premium" },
    { label: "Account", path: "/account" },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: "blur(18px)",
          background: "rgba(0,0,0,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              color: "white",
            }}
          >
            <img
              src="/assets/ngm-logo-square.png"
              alt="NGM"
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.src = "/assets/ngm-logo-square.jpeg";
              }}
            />

            <span
              style={{
                fontWeight: 900,
                letterSpacing: "-0.04em",
                fontSize: 20,
              }}
            >
              NGM
            </span>
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              className="desktop-nav"
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.82)",
                    fontWeight: 700,
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              onClick={handleLogout}
              style={{
                border: "none",
                background: "white",
                color: "black",
                borderRadius: 999,
                padding: "10px 18px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Logout
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: 999,
                padding: "10px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Menu
            </button>
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.94)",
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
              gap: 16,
            }}
          >
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMenuOpen(false);
                }}
                style={{
                  height: 62,
                  borderRadius: 22,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => setMenuOpen(false)}
              style={{
                height: 58,
                borderRadius: 999,
                border: "none",
                background: "white",
                color: "black",
                fontWeight: 900,
                fontSize: 16,
                cursor: "pointer",
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
