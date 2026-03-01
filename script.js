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

        // Lock final position in inline styles once animation completes
        flyDown.onfinish = function() {
          pumpy.style.transform = 'translateY(0)';
          pumpy.style.opacity = '1';
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

  // Hover interactions
  pumpy.addEventListener('mouseenter', function() {
    const activeImage = pumpy.querySelector('.pumpy-image.pumpy-active');
    setActive(pumpyOpen);
  });

  pumpy.addEventListener('mouseleave', function() {
    setActive(pumpyIdle);
  });

  // Click interaction - bounce twice and show contextual message
  pumpy.addEventListener('click', function() {
    const activeImage = pumpy.querySelector('.pumpy-image.pumpy-active');

    // Add bounce animation
    activeImage.classList.add('pumpy-bouncing');

    // Remove bounce class after animation ends
    setTimeout(function() {
      activeImage.classList.remove('pumpy-bouncing');
    }, 800);

    // Show contextual message based on visible section
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
      message = "See what investors say!";
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

    // Hide bubble after 3 seconds
    setTimeout(function() {
      messageDiv.style.opacity = '0';
      messageDiv.style.pointerEvents = 'none';
      // Reset bubble text for next hover
      pumpyBubble.textContent = "Hey! I'm Pumpy! 🚀 Ready to go to the moon?";
    }, 3000);
  }
});

// Easter egg: console message
console.log('%c🚀 PUMPCOIN 🚀', 'color: #ff6b35; font-size: 24px; font-weight: bold;');
console.log('%cThis is a SATIRICAL project.', 'color: #ff3366; font-size: 16px;');
console.log('%cNever invest in something you don\'t understand!', 'color: #00d9ff; font-size: 14px;');
console.log('%cAlways research before investing in any cryptocurrency.', 'color: #a0a0a0; font-size: 12px;');
