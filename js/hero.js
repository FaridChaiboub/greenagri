let currentSlide = 0;
let slideTimeout = null;
let progressRaf = null;
let startTime = 0;
const slideDuration = 5000;
const totalSlides = 3;
let isPaused = false;
let visibilityTimer = null;

function updateWrapperHeight() {
  const slides = document.querySelectorAll(".site-hero-slide");
  const wrapper = document.querySelector(".site-hero-slides-wrapper");
  const activeSlide = slides[currentSlide];

  const isMobile = window.innerWidth <= 1100;
  if (isMobile) {
    wrapper.style.height = activeSlide.offsetHeight + "px";
  } else {
    wrapper.style.height = "";
  }
}

function initSlider() {
  const slides = document.querySelectorAll(".site-hero-slide");
  const progressItems = document.querySelectorAll(".site-hero-progress-item");

  slides.forEach((slide, index) => {
    if (index === 0) slide.classList.add("active");
  });

  progressItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      goToSlide(index);
    });
  });

  // ensure CSS animations won't fight with JS—remove any running animation
  document.querySelectorAll(".site-hero-progress-fill").forEach((f) => {
    f.style.animation = "none";
    // ensure no leftover transition styles override JS control
    f.style.transition = "width 0.06s linear";
  });

  updateWrapperHeight();
  window.addEventListener("resize", updateWrapperHeight);

  startSlideTimer();
  setupHeroVisibilityObserver();
}

/* ---- Timer & progress ---- */

function clearTimersAndRaf() {
  if (slideTimeout) {
    clearTimeout(slideTimeout);
    slideTimeout = null;
  }
  if (progressRaf) {
    cancelAnimationFrame(progressRaf);
    progressRaf = null;
  }
}

function startSlideTimer() {
  // ensure nothing leftover
  clearTimersAndRaf();

  // reset start time so progress starts from 0
  startTime = performance.now();

  // immediately set UI to 0 for current slide, 100 for previous ones
  syncProgressUIBeforeStart();

  // progress loop via RAF
  function progressLoop(ts) {
    if (isPaused) return; // stop if paused
    const elapsed = ts - startTime;
    const progress = Math.min((elapsed / slideDuration) * 100, 100);

    updateProgressBar(progress);

    if (elapsed >= slideDuration) {
      // allow nextSlide via timeout to keep behavior consistent
      return;
    }
    progressRaf = requestAnimationFrame(progressLoop);
  }
  progressRaf = requestAnimationFrame(progressLoop);

  // schedule slide change guarded by a timeout so it's consistent with RAF
  slideTimeout = setTimeout(() => {
    nextSlide();
  }, slideDuration);
}

function updateProgressBar(progressPercent) {
  const items = document.querySelectorAll(".site-hero-progress-item");
  items.forEach((item, idx) => {
    const fill = item.querySelector(".site-hero-progress-fill");
    // ensure CSS animation property is disabled so JS control is authoritative
    fill.style.animation = "none";

    if (idx === currentSlide) {
      fill.style.width = `${progressPercent}%`;
      item.classList.add("active");
    } else if (idx < currentSlide) {
      fill.style.width = "100%";
      item.classList.remove("active");
    } else {
      fill.style.width = "0%";
      item.classList.remove("active");
    }
  });
}

function syncProgressUIBeforeStart() {
  const items = document.querySelectorAll(".site-hero-progress-item");
  items.forEach((item, idx) => {
    const fill = item.querySelector(".site-hero-progress-fill");
    fill.style.animation = "none";
    if (idx === currentSlide) {
      fill.style.width = "0%";
      item.classList.add("active");
    } else if (idx < currentSlide) {
      fill.style.width = "100%";
      item.classList.remove("active");
    } else {
      fill.style.width = "0%";
      item.classList.remove("active");
    }
  });
}

/* ---- Slide navigation ---- */

function goToSlide(index) {
  if (index === currentSlide) return;

  // stop any running timers/raf, reset progress for new slide
  clearTimersAndRaf();

  const slides = document.querySelectorAll(".site-hero-slide");
  const currentEl = slides[currentSlide];
  const nextEl = slides[index];

  if (currentEl) {
    currentEl.classList.add("exiting");
    currentEl.classList.remove("active");
  }
  if (nextEl) nextEl.classList.add("active");

  // remove exiting after animation duration to keep DOM clean
  setTimeout(() => {
    if (currentEl) currentEl.classList.remove("exiting");
  }, 800);

  currentSlide = index;
  updateWrapperHeight();

  if (!isPaused) {
    // restart from 0 immediately
    startSlideTimer();
  } else {
    // keep paused but ensure UI shows the current slide at 0%
    syncProgressUIBeforeStart();
  }
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % totalSlides;
  goToSlide(nextIndex);
}

/* ---- Pause & Resume ---- */

function pauseSlides() {
  if (isPaused) return;
  isPaused = true;

  // debounce: clear any pending visibility timers
  if (visibilityTimer) {
    clearTimeout(visibilityTimer);
    visibilityTimer = null;
  }

  // stop timers & RAF immediately
  clearTimersAndRaf();

  // reset current slide progress so resume always starts at 0
  const items = document.querySelectorAll(".site-hero-progress-item");
  items.forEach((item, idx) => {
    const fill = item.querySelector(".site-hero-progress-fill");
    fill.style.animation = "none";
    if (idx === currentSlide) {
      fill.style.width = "0%";
      item.classList.add("active");
    } else if (idx < currentSlide) {
      fill.style.width = "100%";
      item.classList.remove("active");
    } else {
      fill.style.width = "0%";
      item.classList.remove("active");
    }
  });
}

function resumeSlides() {
  if (!isPaused) return;
  // clear any pending visibility timer
  if (visibilityTimer) {
    clearTimeout(visibilityTimer);
    visibilityTimer = null;
  }

  isPaused = false;

  // ensure slide DOM classes are correct
  const slides = document.querySelectorAll(".site-hero-slide");
  slides.forEach((s, i) => s.classList.toggle("active", i === currentSlide));

  // restart timer from 0
  startSlideTimer();
}

/* ---- IntersectionObserver with debounce ---- */

function setupHeroVisibilityObserver() {
  const hero = document.getElementById("hero");
  const nav = document.querySelector(".site-nav");
  if (!hero || !nav) return;

  const navHeight = nav.offsetHeight || 0;
  const observerOptions = {
    root: null,
    threshold: 0,
    rootMargin: `-${navHeight}px 0px 0px 0px`,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // clear existing timer to debounce rapid enter/exit
      if (visibilityTimer) {
        clearTimeout(visibilityTimer);
        visibilityTimer = null;
      }

      if (!entry.isIntersecting) {
        // when hero left the viewport (past the nav): pause after short delay
        visibilityTimer = setTimeout(() => {
          pauseSlides();
          visibilityTimer = null;
        }, 40); // small delay to avoid quick flicker
      } else {
        // when hero becomes visible: resume but wait a tad to ensure stable state
        visibilityTimer = setTimeout(() => {
          resumeSlides();
          visibilityTimer = null;
        }, 120);
      }
    });
  }, observerOptions);

  observer.observe(hero);
}

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
});
