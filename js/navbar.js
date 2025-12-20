/*
========================================
  NAVIGATION MENU TOGGLE FUNCTIONALITY
========================================
*/

document.addEventListener("DOMContentLoaded", function () {
  // =================================================
  // Dynamically add arrow icons to dropdown toggles
  // =================================================
  // Configuration: Define the Font Awesome icon to use
  const dropdownArrowIcon =
    '<i class="fa-solid fa-angle-down site-nav-dropdown-arrow"></i>';

  // Select all dropdown/mega menu toggle links
  const dropdownToggles = document.querySelectorAll(
    ".site-nav-dropdown-toggle"
  );

  // Add arrow icon to each toggle link
  dropdownToggles.forEach((toggle) => {
    toggle.insertAdjacentHTML("beforeend", dropdownArrowIcon);
  });

  // ============================================
  // Select all nav items
  // ============================================
  const navItems = document.querySelectorAll(".site-nav-item");

  // ============================================
  // Toggle menu on click
  // ============================================
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const parentItem = this.closest(".site-nav-item");
      const isCurrentlyOpen = parentItem.classList.contains("is-open");

      // Close all other open menus first
      closeAllMenus();

      // Toggle current menu (open if it was closed, stay closed if it was open)
      if (!isCurrentlyOpen) {
        parentItem.classList.add("is-open");
      }
    });
  });

  // ============================================
  // Close menus when clicking on regular nav links or CTA button
  // ============================================
  const regularLinks = document.querySelectorAll(
    ".site-nav-link:not(.site-nav-dropdown-toggle)"
  );
  const ctaButton = document.querySelectorAll(".site-nav-partner-button");

  const allClosingLinks = [...regularLinks, ...ctaButton];

  allClosingLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeAllMenus();
    });
  });

  // ============================================
  // Close menus when clicking outside
  // ============================================
  document.addEventListener("click", function (event) {
    const isClickInsideNav = event.target.closest(".site-nav-item");

    if (!isClickInsideNav) {
      closeAllMenus();
    }
  });

  // ============================================
  // Helper function to close all open menus
  // ============================================
  function closeAllMenus() {
    navItems.forEach((item) => {
      item.classList.remove("is-open");
    });
  }

  // ============================================
  // Close menus when clicking links inside menus
  // ============================================
  const megaMenuLinks = document.querySelectorAll(
    ".site-nav-mega-menu a, .site-nav-dropdown-menu a"
  );
  megaMenuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeAllMenus();
    });
  });
});

// Toggle hamburger menu animation and mobile menu visibility
document.getElementById("siteNavToggle").addEventListener("click", function () {
  this.classList.toggle("is-active");

  // Toggle mobile menu visibility
  const navLinks = document.getElementById("siteNavLinks");
  navLinks.classList.toggle("is-active");
});

// Close mobile menu when window is resized above mobile breakpoint
window.addEventListener("resize", function () {
  if (window.innerWidth > 1100) {
    const navLinks = document.getElementById("siteNavLinks");
    const hamburger = document.getElementById("siteNavToggle");

    navLinks.classList.remove("is-active");
    hamburger.classList.remove("is-active");
  }
});

// Close mobile menu when clicking outside the nav
document.addEventListener("click", function (event) {
  const isClickInsideNav = event.target.closest(".site-nav");
  const navLinks = document.getElementById("siteNavLinks");
  const hamburger = document.getElementById("siteNavToggle");

  if (!isClickInsideNav && navLinks.classList.contains("is-active")) {
    navLinks.classList.remove("is-active");
    hamburger.classList.remove("is-active");
  }
});

// Close mobile menu when ESC key is pressed
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const navLinks = document.getElementById("siteNavLinks");
    const hamburger = document.getElementById("siteNavToggle");

    navLinks.classList.remove("is-active");
    hamburger.classList.remove("is-active");
  }
});
