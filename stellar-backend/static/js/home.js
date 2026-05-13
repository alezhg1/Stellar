document.addEventListener('DOMContentLoaded', function() {
  // Анимация печатной машинки
  const subtitleElement = document.getElementById('typed-subtitle');
  const texts = [
    "Платформа для успеха каждого ученика",
    "Инструмент для эффективного обучения",
    "Цифровое портфолио достижений",
    "Сообщество целеустремленных"
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeWriter() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      subtitleElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      subtitleElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    if (!isDeleting && charIndex === currentText.length) {
      isDeleting = true;
      setTimeout(typeWriter, 2000);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      setTimeout(typeWriter, 500);
    } else {
      setTimeout(typeWriter, isDeleting ? 50 : 100);
    }
  }

  setTimeout(typeWriter, 1000);
  setupFloatingImages();
});

function setupFloatingImages() {
  const floatingImages = document.querySelectorAll('.floating-img');
  const imageAnimations = [
    { duration: 6000, delay: 0, enterAnimation: 'slideInLeft', enterDelay: 500 },
    { duration: 7000, delay: 1000, enterAnimation: 'slideInRight', enterDelay: 700 },
    { duration: 8000, delay: 2000, enterAnimation: 'fadeInUp', enterDelay: 900 },
    { duration: 5000, delay: 500, enterAnimation: 'fadeInUp', enterDelay: 1100 },
    { duration: 9000, delay: 1500, enterAnimation: 'fadeInUp', enterDelay: 1300 },
    { duration: 6500, delay: 2500, enterAnimation: 'fadeInUp', enterDelay: 1500 }
  ];

  floatingImages.forEach((image, index) => {
    const animation = imageAnimations[index] || imageAnimations[0];

    setTimeout(() => {
      image.style.opacity = '1';
      if (animation.enterAnimation === 'slideInLeft') {
        image.style.transform = 'translateX(0) translateY(0px)';
      } else if (animation.enterAnimation === 'slideInRight') {
        image.style.transform = 'translateX(0) translateY(0px)';
      } else {
        image.style.transform = 'translateY(0px)';
      }
    }, animation.enterDelay);

    startFloatingAnimation(image, animation.duration, animation.delay);

    image.addEventListener('click', function(e) {
      if (e.button === 0) {
        makeImageFall(this);
      }
    });
  });
}

function startFloatingAnimation(image, duration, delay) {
  setTimeout(() => {
    let startTime = null;
    let isFloating = true;

    function float(timestamp) {
      if (!startTime) startTime = timestamp;
      if (!isFloating) return;

      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      const yOffset = Math.sin(progress * Math.PI * 2) * 15;
      const rotation = Math.sin(progress * Math.PI * 2) * 2;

      const currentTransform = image.style.transform;
      const baseTransform = currentTransform.replace(/translateY\([^)]*\)/g, '').replace(/rotate\([^)]*\)/g, '').trim();
      image.style.transform = `${baseTransform} translateY(${yOffset}px) rotate(${rotation}deg)`;

      if (isFloating) {
        requestAnimationFrame(float);
      }
    }

    image.stopFloating = function() {
      isFloating = false;
    };

    requestAnimationFrame(float);
  }, delay);
}

function makeImageFall(imageElement) {
  if (imageElement.stopFloating) {
    imageElement.stopFloating();
  }

  const rect = imageElement.getBoundingClientRect();
  imageElement.style.position = 'fixed';
  imageElement.style.top = rect.top + 'px';
  imageElement.style.left = rect.left + 'px';
  imageElement.style.zIndex = '1000';
  imageElement.style.transition = 'none';

  requestAnimationFrame(() => {
    imageElement.style.transition = 'transform 1.5s ease-in, opacity 1.5s ease-in';
    imageElement.style.transform = 'translateY(100vh) rotate(360deg)';
    imageElement.style.opacity = '0';

    setTimeout(() => {
      imageElement.remove();
    }, 1500);
  });
}