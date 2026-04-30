/**
 * Navigation utilities
 */

/**
 * Get navigation configuration
 */
function getNavigationItems() {
  return [
    {
      label: "Dashboard",
      icon: "dashboard",
      path: "dashboard.html",
      page: "dashboard",
    },
    {
      label: "Classes",
      icon: "school",
      path: "manageclassroom.html",
      page: "manageclassroom",
    },
    {
      label: "Students",
      icon: "group",
      path: "managestudent.html",
      page: "managestudent",
    },
    {
      label: "Grades",
      icon: "grade",
      path: "enterscore.html",
      page: "enterscore",
    },
    {
      label: "Profile",
      icon: "account_circle",
      path: "infoemployee.html",
      page: "infoemployee",
    },
  ];
}

/**
 * Get footer navigation items
 */
function getFooterNavigationItems() {
  return [
    {
      label: "Security Settings",
      icon: "lock_open",
      path: "#",
      action: "openSecuritySettings",
    },
    {
      label: "Logout",
      icon: "logout",
      path: "login.html",
      action: "logout",
    },
  ];
}

/**
 * Navigate to a page
 */
function navigateTo(path) {
  if (path === "#") {
    return; // Prevent navigation for placeholder links
  }
  window.location.href = path;
}

/**
 * Check if the current page is active
 */
function isPageActive(pageName) {
  const currentPage = window.SecureAdmin.getCurrentPage();
  return currentPage.includes(pageName);
}

/**
 * Handle logout
 */
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    navigateTo("login.html");
  }
}

/**
 * Handle security settings
 */
function openSecuritySettings() {
  alert("Security Settings page coming soon");
}

// Export navigation utilities
window.Navigation = {
  getNavigationItems,
  getFooterNavigationItems,
  navigateTo,
  isPageActive,
  handleLogout,
  openSecuritySettings,
};
