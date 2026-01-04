/*
=======================================
  NAVIGATION MENU TOGGLE FUNCTIONALITY
=======================================
*/

"use strict";

// =============
// DOM ELEMENTS
// =============
const siteNavToggle = document.getElementById("siteNavToggle");
const siteNavLinks = document.getElementById("siteNavLinks");
const navbar = document.querySelector(".site-nav");
const heroSection = document.getElementById("hero");

// =================
// HELPER FUNCTIONS
// =================
function closeAllMenus() {
  const navItems = document.querySelectorAll(".site-nav-item");
  navItems.forEach((item) => {
    item.classList.remove("is-open");
  });
  updateNavbarBackground();
}

function closeMobileMenu() {
  if (!siteNavLinks || !siteNavToggle) return;
  siteNavLinks.classList.remove("is-active");
  siteNavToggle.classList.remove("is-active");
  updateNavbarBackground();
}

function updateNavbarBackground() {
  if (!navbar) return;
  const isAnyMenuOpen = !!document.querySelector(".site-nav-item.is-open");
  const isMobileMenuOpen = !!(
    siteNavLinks && siteNavLinks.classList.contains("is-active")
  );
  const isInHero = !!(
    heroSection && heroSection.getBoundingClientRect().bottom >= 0
  );

  if ((isAnyMenuOpen || isMobileMenuOpen) && isInHero) {
    navbar.classList.add("site-nav--menu-open");
  } else {
    navbar.classList.remove("site-nav--menu-open");
  }
}

// -----------------------------
// Centralised scroll/position check
// -----------------------------
function handleScrollState() {
  if (!navbar || !heroSection) return;

  // Add/remove the scrolled class depending on hero position
  if (heroSection.getBoundingClientRect().bottom < 0) {
    navbar.classList.add("site-nav--scrolled");
  } else {
    navbar.classList.remove("site-nav--scrolled");
  }

  // Update menu background state to keep classes consistent
  updateNavbarBackground();
}

// ========================================
// INITIALIZATION - Runs when DOM is ready
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  initializeDesktopDropdowns();

  // initial quick check (may run before browser restores scroll position)
  handleScrollState();

  // safe-guard: attach click handlers only if elements exist
  if (siteNavToggle && siteNavLinks) {
    siteNavToggle.addEventListener("click", function (ev) {
      ev.stopPropagation();
      this.classList.toggle("is-active");
      siteNavLinks.classList.toggle("is-active");
      updateNavbarBackground();
    });
  }
});

// Ensure correct state after browser restores scroll position and all resources loaded
window.addEventListener("load", function () {
  // Do not force-close menus on load — only normalise scrolled/menu classes
  handleScrollState();
});

// ============================
// DESKTOP DROPDOWN MENU LOGIC
// ============================
function initializeDesktopDropdowns() {
  const dropdownArrowIcon =
    '<i class="fa-solid fa-angle-down site-nav-dropdown-arrow"></i>';
  const dropdownToggles = document.querySelectorAll(
    ".site-nav-dropdown-toggle"
  );

  dropdownToggles.forEach((toggle) => {
    // guard against duplicate inserts
    if (!toggle.querySelector(".site-nav-dropdown-arrow")) {
      toggle.insertAdjacentHTML("beforeend", dropdownArrowIcon);
    }
  });

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const parentItem = this.closest(".site-nav-item");
      if (!parentItem) return;

      const isCurrentlyOpen = parentItem.classList.contains("is-open");

      // close all then open this one if it wasn't open
      closeAllMenus();

      if (!isCurrentlyOpen) {
        parentItem.classList.add("is-open");
      }

      updateNavbarBackground();
    });
  });

  // Close menus when clicking regular nav links or CTA button
  const regularLinks = document.querySelectorAll(
    ".site-nav-link:not(.site-nav-dropdown-toggle)"
  );
  const ctaButton = document.querySelectorAll(".site-nav-partner-button");
  const allClosingLinks = [...regularLinks, ...ctaButton];

  allClosingLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeAllMenus();
      updateNavbarBackground();
    });
  });

  // Close menus when clicking links inside dropdown/mega menus
  const megaMenuLinks = document.querySelectorAll(
    ".site-nav-mega-menu a, .site-nav-dropdown-menu a"
  );
  megaMenuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeAllMenus();
      updateNavbarBackground();
    });
  });

  // Close menus when clicking outside the nav (desktop dropdowns)
  document.addEventListener("click", function (event) {
    const isClickInsideNavItem = !!event.target.closest(".site-nav-item");
    if (!isClickInsideNavItem) {
      closeAllMenus();
      updateNavbarBackground();
    }
  });
}

// ============================
// GLOBAL CLICK / KEY HANDLERS
// ============================

// Close mobile menu when clicking outside the nav (only if open)
document.addEventListener("click", function (event) {
  const isClickInsideNav = !!event.target.closest(".site-nav");
  if (
    !isClickInsideNav &&
    siteNavLinks &&
    siteNavLinks.classList.contains("is-active")
  ) {
    closeMobileMenu();
  }
});

// Close mobile menu when ESC key is pressed
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

// ============================
// RESIZE HANDLING (debounced)
// ============================
let resizeTimer;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    // On larger viewports ensure mobile menu closed
    if (window.innerWidth > 1100) {
      closeMobileMenu();
    }
    // Recompute hero position and navbar classes
    handleScrollState();
  }, 120);
});

// =======================
// SCROLL DETECTION LOGIC
// =======================

window.addEventListener("scroll", function () {
  // keep previous behaviour on actual scroll
  closeAllMenus();
  closeMobileMenu();
  handleScrollState();
});
