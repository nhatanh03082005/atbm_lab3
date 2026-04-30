import Button from "../ui/Button";
import { getCurrentUserName } from "../../lib/routes";
import { getInitials } from "../../lib/helpers";

export default function Header({ onMenuClick }) {
  const currentUserName = getCurrentUserName() || "Admin";
  const avatarInitials = getInitials(currentUserName) || "AD";

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <Button
          variant="ghost"
          className="btn--icon app-header__mobile-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined">menu</span>
        </Button>
        <span>Student Management</span>
      </div>

      <div className="app-header__actions">
        <Button
          variant="ghost"
          className="btn--icon"
          aria-label="Notifications"
        ></Button>
        <Button variant="ghost" className="btn--icon" aria-label="Security">
          <span className="material-symbols-outlined">shield</span>
        </Button>
        <div className="app-header__avatar" aria-label={currentUserName}>
          {avatarInitials}
        </div>
      </div>
    </header>
  );
}
