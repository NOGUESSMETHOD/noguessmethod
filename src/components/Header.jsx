import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">
          <img src="/assets/ngm-logo-square.png" alt="NGM" className="logo-square" />
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(true)}>
          Menu
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="menu-container">
            <button onClick={() => goTo("/")}>Main</button>
            <button onClick={() => goTo("/free")}>Free Board</button>
            <button onClick={() => goTo("/signup")}>Sign Up</button>
            <button onClick={() => goTo("/login")}>Login</button>
            <button onClick={() => setMenuOpen(false)}>Back</button>
          </div>
        </div>
      )}
    </>
  );
}
