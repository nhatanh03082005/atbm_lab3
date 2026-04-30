/**
 * SecureAdmin Frontend Application
 * Main initialization and global utilities
 */

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeNavigation();
  initializeUI();
  initializeEventListeners();
});

/**
 * Initialize navigation
 * Set active navigation items based on current page
 */
function initializeNavigation() {
  const currentPage = getCurrentPage();
  const navLinks = document.querySelectorAll(".sidebar-menu-item, .nav-link");

  navLinks.forEach((link) => {
    // Remove active class from all links
    link.classList.remove("active");

    // Add active class to matching link
    const href = link.getAttribute("href");
    if (href && href.includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

/**
 * Get current page filename
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf("/") + 1) || "dashboard.html";
  return page;
}

/**
 * Initialize UI components
 */
function initializeUI() {
  initializePasswordToggle();
  initializeSearchFilter();
  initializeMobileMenu();
}

/**
 * Initialize password visibility toggle
 */
function initializePasswordToggle() {
  const toggleButtons = document.querySelectorAll("[data-toggle-password]");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.closest(".password-input-group").querySelector(
        "input",
      );
      if (input.type === "password") {
        input.type = "text";
        this.textContent = "visibility_off";
      } else {
        input.type = "password";
        this.textContent = "visibility";
      }
    });
  });
}

/**
 * Initialize search/filter functionality
 */
function initializeSearchFilter() {
  const searchInputs = document.querySelectorAll("[data-search-table]");
  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const tableId = this.getAttribute("data-search-table");
      const table = document.getElementById(tableId);
      if (table) {
        filterTable(table, this.value);
      }
    });
  });
}

/**
 * Filter table rows based on search input
 */
function filterTable(table, searchValue) {
  const rows = table.querySelectorAll("tbody tr");
  const searchLower = searchValue.toLowerCase();

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchLower)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

/**
 * Initialize mobile menu toggle
 */
function initializeMobileMenu() {
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const sidebar = document.querySelector(".app-sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("mobile-open");
    });

    // Close menu when clicking on a link
    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        sidebar.classList.remove("mobile-open");
      });
    });
  }
}

/**
 * Initialize event listeners for forms and buttons
 */
function initializeEventListeners() {
  // Save button handlers
  const saveButtons = document.querySelectorAll("[data-save]");
  saveButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      handleSave(this);
    });
  });

  // Form submit handlers
  const forms = document.querySelectorAll("form[data-form-handler]");
  forms.forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
  e.preventDefault();
  const formType = this.getAttribute("data-form-handler");

  // Show feedback
  showNotification(`Form submitted: ${formType}`, "success");
}

/**
 * Handle save action
 */
function handleSave(btn) {
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="material-symbols-outlined">check</span> Saved';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    showNotification("Data saved successfully", "success");
  }, 1500);
}

/**
 * Show notification message
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Utility: Format date
 */
function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Utility: Format currency
 */
function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Export functions for use in modules
window.SecureAdmin = {
  initializeNavigation,
  getCurrentPage,
  filterTable,
  handleSave,
  showNotification,
  formatDate,
  formatCurrency,
};
