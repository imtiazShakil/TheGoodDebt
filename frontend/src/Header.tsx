import { HandCoins, PaintBrush } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

function Header() {
  const { t, i18n } = useTranslation();

  const links = [
    { name: t("nav.contacts"), href: "/" },
    { name: t("nav.vaults"), href: "/vaults" },
    { name: t("nav.lendingContracts"), href: "/lending-contracts" },
    { name: t("nav.borrowingContracts"), href: "/borrowing-contracts" },
    { name: t("nav.transactions"), href: "/transactions" },
  ];

  return (
    <div className="navbar bg-primary text-primary-content shadow-accent-content mx-2 mt-2 mb-6 w-auto rounded-xl shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-secondary text-secondary-content rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {links.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end
                  className={({ isActive }) => (isActive ? "ring-1" : "")}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <a className="btn btn-ghost gap-2">
          <HandCoins size={28} weight="duotone" />
          <span className="text-base font-bold">The Good Debt</span>
        </a>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                end
                className={({ isActive }) => (isActive ? "ring-1" : "")}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end">
        <div className="mr-2 flex items-center gap-1">
          <button
            className={`btn btn-sm ${i18n.language === "bn" ? "btn-active" : "btn-ghost"}`}
            onClick={() => {
              void i18n.changeLanguage("bn");
            }}
          >
            বাংলা
          </button>
          <button
            className={`btn btn-sm ${i18n.language === "en" ? "btn-active" : "btn-ghost"}`}
            onClick={() => {
              void i18n.changeLanguage("en");
            }}
          >
            EN
          </button>
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-sm m-2">
            <PaintBrush size={18} weight="duotone" />
            {t("header.theme")}
          </div>
          <div
            tabIndex={0}
            className="dropdown-content bg-base-100 text-base-content rounded-box shadow-accent z-2 max-h-95 min-w-max overflow-y-auto p-1 shadow-2xl"
          >
            <ul className="menu w-40">
              {THEMES.map((theme) => (
                <li key={theme} className="mt-1">
                  <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-sm btn-wide hover:bg-primary hover:text-primary-content justify-start"
                    aria-label={theme}
                    value={theme}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
