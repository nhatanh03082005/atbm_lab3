import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PageContainer from "./PageContainer";
import { ROUTES, clearAuthentication } from "../../lib/routes";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthentication();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  function handleSecuritySettings() {
    window.alert("Security settings are not connected yet.");
  }

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onSecuritySettings={handleSecuritySettings}
      />
      <div className="app-main">
        <Header onMenuClick={() => setSidebarOpen((value) => !value)} />
        <PageContainer>
          <Outlet />
        </PageContainer>
      </div>
    </div>
  );
}
