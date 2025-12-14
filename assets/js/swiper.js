const indicators = document.querySelectorAll('.indicator');
const slides = document.getElementById('slides');
let current = 0;
let interval = null;
let startX = 0;
let isDragging = false;
let deltaX = 0;

function goToSlide(index) {
  clearTimeout(interval);
  indicators.forEach((ind, i) => {
    ind.classList.toggle('active', i === index);
    const progress = ind.querySelector('.progress');
    progress.style.transition = 'none';
    progress.style.width = '0%';
    void progress.offsetWidth;
    if (i === index) {
      progress.style.transition = 'width 3s linear';
      setTimeout(() => progress.style.width = '100%', 50);
    }
  });

  slides.style.transition = 'transform 0.5s ease-in-out';
  slides.style.transform = `translateX(-${index * 100}%)`;
  current = index;

  interval = setTimeout(() => {
    goToSlide((current + 1) % indicators.length);
  }, 10000);
}

indicators.forEach((indicator, index) => {
  indicator.addEventListener('click', () => goToSlide(index));
});

// Swipe para celular e PC
slides.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX;
  slides.style.transition = 'none';
});

slides.addEventListener('touchstart', (e) => {
  isDragging = true;
  startX = e.touches[0].clientX;
  slides.style.transition = 'none';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  deltaX = e.pageX - startX;
  slides.style.transform = `translateX(${-current * 100 + (deltaX / slides.clientWidth) * 100}%)`;
});

window.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  deltaX = e.touches[0].clientX - startX;
  slides.style.transform = `translateX(${-current * 100 + (deltaX / slides.clientWidth) * 100}%)`;
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  if (deltaX > 50) {
    goToSlide((current - 1 + indicators.length) % indicators.length);
  } else if (deltaX < -50) {
    goToSlide((current + 1) % indicators.length);
  } else {
    goToSlide(current);
  }
  deltaX = 0;
});

window.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  if (deltaX > 50) {
    goToSlide((current - 1 + indicators.length) % indicators.length);
  } else if (deltaX < -50) {
    goToSlide((current + 1) % indicators.length);
  } else {
    goToSlide(current);
  }
  deltaX = 0;
});

goToSlide(0);