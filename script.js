// Warning Modal Logic
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('warningModal');
  const acknowledgeBtn = document.getElementById('acknowledgeBtn');

  // Hide modal when user acknowledges
  acknowledgeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Prevent closing modal by clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      // Do nothing - force user to click the button
      return;
    }
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

// Easter egg: console message
console.log('%c🚀 PUMPCOIN 🚀', 'color: #ff6b35; font-size: 24px; font-weight: bold;');
console.log('%cThis is a SATIRICAL project.', 'color: #ff3366; font-size: 16px;');
console.log('%cNever invest in something you don\'t understand!', 'color: #00d9ff; font-size: 14px;');
console.log('%cAlways research before investing in any cryptocurrency.', 'color: #a0a0a0; font-size: 12px;');
