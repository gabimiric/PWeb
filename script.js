// Warning Modal Logic
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('warningModal');
  const acknowledgeBtn = document.getElementById('acknowledgeBtn');

  // Open modal using native dialog API
  modal.showModal();

  // Close modal when user acknowledges
  acknowledgeBtn.addEventListener('click', function() {
    modal.close();
  });

  // Mobile: slide-to-confirm — closes modal when dragged to end, snaps back otherwise
  var acknowledgeSlider = document.getElementById('acknowledgeSlider');

  acknowledgeSlider.addEventListener('input', function() {
    if (parseInt(this.value) >= 95) {
      modal.close();
    }
  });

  acknowledgeSlider.addEventListener('change', function() {
    if (parseInt(this.value) < 95) {
      this.value = 0;
    }
  });

  // Prevent closing modal via Escape key
  modal.addEventListener('cancel', function(e) {
    e.preventDefault();
  });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    // Close other items
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
      }
    });

    // Toggle current item
    item.classList.toggle('active');
  });
});

// Add some fun animations when scrolling
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// Hamburger nav toggle (mobile only)
document.addEventListener('DOMContentLoaded', function() {
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var navLinks = document.querySelector('.nav-links');

  hamburgerBtn.addEventListener('click', function() {
    navLinks.classList.toggle('nav-open');
  });

  // Close menu when any nav link is clicked
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('nav-open');
    });
  });
});

// Pumpy Mascot Logic - Image-based with interactions
document.addEventListener('DOMContentLoaded', function() {
  const pumpy = document.getElementById('pumpy');
  const pumpyIdle = document.getElementById('pumpy-idle');
  const pumpyOpen = document.getElementById('pumpy-open');
  const pumpyWave1 = document.getElementById('pumpy-wave-1');
  const pumpyWave2 = document.getElementById('pumpy-wave-2');
  const pumpyBubble = pumpy.querySelector('.pumpy-bubble');

  // Trigger Pumpy 3 seconds after the pricing/invest section enters the viewport
  const pricingSection = document.getElementById('pricing');
  let pumpyTriggered = false;

  const pumpyObserver = new IntersectionObserver(function(entries) {
    if (pumpyTriggered) return;
    if (entries[0].isIntersecting) {
      pumpyTriggered = true;
      pumpyObserver.disconnect();

      setTimeout(function() {
        pumpy.style.pointerEvents = 'auto';

        // Fly down from off-screen top using Web Animations API — fully JS-driven
        var flyDown = pumpy.animate(
          [
            { transform: 'translateY(-120vh)', opacity: 1 },
            { transform: 'translateY(0)',      opacity: 1 }
          ],
          { duration: 1600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
        );

        // Cancel fly-in, lock opacity, then start float as a separate WAAPI animation
        flyDown.onfinish = function() {
          pumpy.style.opacity = '1';
          flyDown.cancel();

          floatAnim = pumpy.animate(
            [
              { transform: 'translateY(0)' },
              { transform: 'translateY(-15px)' },
              { transform: 'translateY(0)' }
            ],
            { duration: 4000, easing: 'ease-in-out', iterations: Infinity }
          );
        };

        // After fly-in finishes (1.6s), run the wave sequence
        setTimeout(function() {
          let waveTime = 0;
          const waveDuration = 2000;
          const frameInterval = 400;

          const waveInterval = setInterval(() => {
            if (waveTime >= waveDuration) {
              clearInterval(waveInterval);
              setActive(pumpyIdle);
            } else {
              if (Math.floor(waveTime / frameInterval) % 2 === 0) {
                setActive(pumpyWave1);
              } else {
                setActive(pumpyWave2);
              }
              waveTime += frameInterval;
            }
          }, frameInterval);
        }, 1600);
      }, 3000);
    }
  }, { threshold: 0.1 });

  pumpyObserver.observe(pricingSection);

  // Talking and bounce state
  var talkInterval = null;
  var isBouncing = false;
  var isHovering = false;
  var floatAnim = null;

  function startTalking() {
    var talkFrame = false;
    setActive(pumpyOpen);
    talkInterval = setInterval(function() {
      talkFrame = !talkFrame;
      setActive(talkFrame ? pumpyIdle : pumpyOpen);
    }, 400);
  }

  function stopTalking() {
    if (talkInterval) {
      clearInterval(talkInterval);
      talkInterval = null;
    }
    setActive(pumpyIdle);
  }

  // Hover interactions — mouse only (filter out touch to avoid false hover after tap)
  pumpy.addEventListener('pointerenter', function(e) {
    if (e.pointerType !== 'mouse') return;
    isHovering = true;
    // Clear any explicit hide so CSS :hover can show the message on desktop
    var msgDiv = pumpy.querySelector('.pumpy-message');
    msgDiv.style.opacity = '';
    msgDiv.style.pointerEvents = '';
    if (isBouncing) return;
    startTalking();
  });

  pumpy.addEventListener('pointerleave', function(e) {
    if (e.pointerType !== 'mouse') return;
    isHovering = false;
    if (isBouncing) return;
    stopTalking();
  });

  // Click interaction - bounce and show contextual message
  pumpy.addEventListener('click', function() {
    var activeImage = pumpy.querySelector('.pumpy-image.pumpy-active');
    if (!activeImage) return;

    stopTalking();
    isBouncing = true;
    if (floatAnim) floatAnim.pause();
    activeImage.classList.add('pumpy-bouncing');

    setTimeout(function() {
      activeImage.classList.remove('pumpy-bouncing');
      isBouncing = false;
      if (floatAnim) floatAnim.play();
      if (isHovering) {
        startTalking();
      } else {
        setActive(pumpyIdle);
      }
    }, 800);

    showContextualMessage();
  });

  // Helper function to switch active image
  function setActive(imageElement) {
    // Remove active class from all images
    document.querySelectorAll('.pumpy-image').forEach(img => {
      img.classList.remove('pumpy-active');
    });
    // Add active class to selected image
    imageElement.classList.add('pumpy-active');
  }

  // Determine and show contextual message based on scroll position
  function showContextualMessage() {
    const heroSection = document.getElementById('hero');
    const socialSection = document.getElementById('social-proof');
    const pricingSection = document.getElementById('pricing');
    const teamSection = document.getElementById('team');
    const faqSection = document.getElementById('faq');

    const heroRect = heroSection.getBoundingClientRect();
    const socialRect = socialSection.getBoundingClientRect();
    const pricingRect = pricingSection.getBoundingClientRect();
    const teamRect = teamSection.getBoundingClientRect();
    const faqRect = faqSection.getBoundingClientRect();

    let message = "Pumpy is excited!";

    // Determine which section is most visible
    if (heroRect.top < window.innerHeight / 2 && heroRect.bottom > window.innerHeight / 2) {
      message = "Check out our amazing features!";
    } else if (socialRect.top < window.innerHeight / 2 && socialRect.bottom > window.innerHeight / 2) {
      message = "See what our investors say!";
    } else if (pricingRect.top < window.innerHeight / 2 && pricingRect.bottom > window.innerHeight / 2) {
      message = "Ready to pump your money? 📈";
    } else if (teamRect.top < window.innerHeight / 2 && teamRect.bottom > window.innerHeight / 2) {
      message = "Meet our expert team!";
    } else if (faqRect.top < window.innerHeight / 2 && faqRect.bottom > window.innerHeight / 2) {
      message = "Got questions? We got you!";
    }

    // Update and show bubble briefly
    pumpyBubble.textContent = message;
    const messageDiv = pumpy.querySelector('.pumpy-message');
    messageDiv.style.opacity = '1';
    messageDiv.style.pointerEvents = 'auto';

    // Hide after 3s. On mobile CSS :hover persists after tap — explicitly
    // set opacity:0 when not truly hovering so the rule can't re-show it.
    setTimeout(function() {
      pumpyBubble.textContent = "Hey! I'm Pumpy! 🚀 Ready to go to the moon?";
      if (isHovering) {
        messageDiv.style.opacity = '';
        messageDiv.style.pointerEvents = '';
      } else {
        messageDiv.style.opacity = '0';
        messageDiv.style.pointerEvents = 'none';
      }
    }, 3000);
  }
});

// Easter egg: console message
console.log('%c🚀 PUMPCOIN 🚀', 'color: #ff6b35; font-size: 24px; font-weight: bold;');
console.log('%cThis is a SATIRICAL project.', 'color: #ff3366; font-size: 16px;');
console.log('%cNever invest in something you don\'t understand!', 'color: #00d9ff; font-size: 14px;');
console.log('%cAlways research before investing in any cryptocurrency.', 'color: #a0a0a0; font-size: 12px;');
