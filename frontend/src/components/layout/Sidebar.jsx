import { NavLink } from "react-router-dom";
import { APP_NAME, FOOTER_ITEMS, getNavItems } from "../../lib/constants";
import { getCurrentUserRole } from "../../lib/routes";
import { cx } from "../../lib/helpers";

function navClass({ isActive }) {
  return cx("sidebar-menu-item", isActive && "active");
}

export default function Sidebar({
  open,
  onClose,
  onLogout,
  onSecuritySettings,
}) {
  const role = getCurrentUserRole();
  const navItems = getNavItems(role);

  return (
    <>
      <aside className={cx("app-sidebar", open && "is-open")}>
        <nav className="app-sidebar__nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={navClass}
              onClick={onClose}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          {FOOTER_ITEMS.map((item) => {
            if (item.action === "logout") {
              return (
                <button
                  key={item.action}
                  type="button"
                  className="sidebar-menu-item"
                  onClick={onLogout}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.action}
                type="button"
                className="sidebar-menu-item"
                onClick={onSecuritySettings}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
      {open ? (
        <button
          aria-label={`Close ${APP_NAME} navigation`}
          className="mobile-overlay"
          onClick={onClose}
          type="button"
        />
      ) : null}
    </>
  );
}
