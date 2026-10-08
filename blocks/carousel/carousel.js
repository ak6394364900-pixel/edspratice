function moveInstrumentation(source, target) {
  if (!source || !target) return;

  [...source.attributes].forEach(({ name, value }) => {
    if ((name.startsWith('data-') || name === 'id') && !target.hasAttribute(name)) {
      target.setAttribute(name, value);
    }
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  const carousel = document.createElement('div');
  carousel.className = 'carousel-container';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  rows.forEach((row, index) => {
    const cells = [...row.children];

    const slide = document.createElement('article');
    slide.className = 'carousel-slide';

    if (index === 0) {
      slide.classList.add('active');
    }

    const content = document.createElement('div');
    content.className = 'carousel-content';

    if (cells.length === 1) {
      const cell = cells[0];
      const image = cell.querySelector('img, picture img');

      if (image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'carousel-image';
        imageWrapper.append(image.cloneNode(true));
        slide.append(imageWrapper);
      }

      const titleNode = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (titleNode) {
        const title = document.createElement('h2');
        title.className = 'carousel-title';
        title.innerHTML = titleNode.innerHTML;
        content.append(title);
      }

      const description = cell.cloneNode(true);
      description.querySelectorAll('h1, h2, h3, h4, h5, h6, a, picture, img, figure').forEach((el) => el.remove());

      if (description.textContent.trim()) {
        const descriptionWrap = document.createElement('div');
        descriptionWrap.className = 'carousel-description';
        descriptionWrap.innerHTML = description.innerHTML.trim();
        content.append(descriptionWrap);
      }

      const cta = cell.querySelector('a');
      if (cta) {
        const link = cta.cloneNode(true);
        link.classList.add('carousel-cta');
        content.append(link);
      }

      slide.append(content);
      rows[index] && moveInstrumentation(rows[index], slide);
      track.append(slide);
      return;
    }

    // Expected columns:
    // 0 = Image
    // 1 = Title
    // 2 = Description
    // 3 = CTA

    // Image
    if (cells[0]) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'carousel-image';

      const image = cells[0].querySelector('img');

      if (image) {
        imageWrapper.append(image);
      }

      slide.append(imageWrapper);
    }

    // Title
    if (cells[1]) {
      const title = document.createElement('h2');
      title.className = 'carousel-title';
      title.innerHTML = cells[1].innerHTML;
      content.append(title);
    }

    // Description
    if (cells[2]) {
      const description = document.createElement('div');
      description.className = 'carousel-description';
      description.innerHTML = cells[2].innerHTML;
      content.append(description);
    }

    // CTA
    if (cells[3]) {
      const cta = cells[3].querySelector('a');

      if (cta) {
        cta.classList.add('carousel-cta');
        content.append(cta);
      } else if (cells[3].textContent.trim()) {
        const link = document.createElement('a');
        link.className = 'carousel-cta';
        link.href = '#';
        link.textContent = cells[3].textContent.trim();
        content.append(link);
      }
    }

    slide.append(content);

    // Preserve EDS instrumentation.
    rows[index] && moveInstrumentation(rows[index], slide);

    track.append(slide);
  });

  // Controls
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  const previousButton = document.createElement('button');
  previousButton.className = 'carousel-button carousel-prev';
  previousButton.type = 'button';
  previousButton.setAttribute('aria-label', 'Previous slide');
  previousButton.innerHTML = '&#10094;';

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-button carousel-next';
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '&#10095;';

  controls.append(previousButton, nextButton);

  // Dots
  const dots = document.createElement('div');
  dots.className = 'carousel-dots';

  rows.forEach((_, index) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.className = 'carousel-dot';

    if (index === 0) {
      dot.classList.add('active');
    }

    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);

    dot.addEventListener('click', () => {
      goToSlide(index);
    });

    dots.append(dot);
  });

  carousel.append(track, controls, dots);

  block.textContent = '';
  block.append(carousel);

  let currentIndex = 0;

  function goToSlide(index) {
    const slides = [...track.children];
    const carouselDots = [...dots.children];

    if (!slides.length) return;

    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    carouselDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  previousButton.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
  });
}