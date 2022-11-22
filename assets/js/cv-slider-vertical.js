// Constant speed scroll slider vertical that maintains a constant speed even if the number of elements changes (supports drag operation and scroll interlocking)
const scrollSlider = document.querySelectorAll('.js-scroll-slider');
if (scrollSlider.length > 0) {
  scrollSlider.forEach((slider) => {
    //Scroll speed setting
    const speed = slider.dataset.autoSpeedRatio
      ? Number(slider.dataset.autoSpeedRatio)
      : 0.5;

    // Get slide element
    const children = slider.children;
    const childLength = children.length;

    // Get a set of slide elements as a string (for duplication)
    let baseChildren = '';
    for (let i = 0; i < children.length; i++) {
      baseChildren += children[i].outerHTML;
    }

    // Get width of slide element
    const firstChild = slider.firstElementChild;

    // Display area of ​​the slider
    const area = document.querySelector(
      slider.getAttribute('data-scroll-area')
    );

    // Slider definition function
    let sliderHeight, areaHeight;
    let countHeight = 0;
    let addCount = 1;
    const initializeSlider = (countHeight, addCount) => {
      // Get height of display area
      areaHeight = area.clientHeight;
      // Get height of entire slider
      const styles = getComputedStyle(firstChild);
      const height = parseFloat(styles.height);
      const marginBottom = parseFloat(styles.marginBottom);
      sliderHeight = (height + marginBottom) * childLength;

      // Duplicate elements to ensure off-screen display
      const checkHeight = areaHeight * 3;
      countHeight = sliderHeight * addCount;
      while (countHeight < checkHeight) {
        slider.insertAdjacentHTML('beforeend', baseChildren);
        ++addCount;
        countHeight = sliderHeight * addCount;
      }

      // Initial value setting of the slider
      slider.style.marginTop = '-' + sliderHeight + 'px';
    };
    initializeSlider(countHeight, addCount);

    /*
			animation settings
		*/
    let requestID;
    let y = 0;

    // Get window height
    let winHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      winHeight = window.innerHeight;
    });

    // Easing (linear interpolation)
    const lerp = (x, y, p) => {
      return x + (y - x) * p;
    };
    // Scroll link variable
    let startScrollY = 0;
    let easingScrollY = 0;
    let diffScrollY = 0;
    const baseAmount = 1;

    // Reversal processing determination
    const isReverse = slider.classList.contains('is-reverse');

    // Scroll event function
    const scrollRatio = slider.dataset.scrollRatio
      ? Number(slider.dataset.scrollRatio)
      : 0.05;

    // Display area position
    let areaPosi = area.getBoundingClientRect().top;

    // Scroll function
    const scrollAnime = () => {
      // Scroll amount from scroll start position
      startScrollY = winHeight - areaPosi;
      // Scroll amount with easing (linear interpolation) applied. Follow with a slight delay from startScrollY
      easingScrollY = lerp(easingScrollY, startScrollY, scrollRatio);
      //startScrollY When easingScrollY difference. Will approach zero when scrolling stops
      diffScrollY = startScrollY - easingScrollY;

      // Increment amount to increase or decrease by scrolling
      const scrollAmount = Math.abs(diffScrollY) / 10;
      const getY = (baseAmount + scrollAmount) * speed;

      // Set value
      if (isReverse) {
        y += getY;
      } else {
        y -= getY;
      }

      // If past the end point of the slider, return the position
      if (
        (!isReverse && y <= -sliderHeight) ||
        (isReverse && y >= sliderHeight)
      ) {
        y = 0;
      }
      slider.style.transform = 'translateY(' + y + 'px)';

      // Recursive processing only when within the screen
      if (isIntersecting) {
        requestID = requestAnimationFrame(scrollAnime);
      }
    };

    /*
			Drag compatible
		*/
    // Get slider style
    const sliderStyles = getComputedStyle(slider);

    // Detect whether it is clicked or touched
    let isDown = false;
    // Determining whether to move down by dragging
    let isBottomMove = false;
    // Save click start position
    let startY;
    // Save slider position
    let sliderY;
    // Determine if it exists on the screen
    let isIntersecting = false;

    // Mouse down, touch start (move start)
    const startFunc = (e) => {
      e.preventDefault();
      slider.style.transition = '';
      // Get y position on screen
      startY = e.pageY;

      // Add class to slider
      slider.classList.add('is-drag');
      isDown = true;

      // Change mouse pointer
      slider.style.cursor = 'grabbing';

      // Auto scroll stop
      cancelAnimationFrame(requestID);

      // Get slider position
      sliderY = parseFloat(new DOMMatrix(sliderStyles.transform).m42);
    };

    // Mouse move, touch move (during movement)
    const moveFunc = (e) => {
      // Process only when mouse down or touch start
      if (!isDown) {
        return;
      }
      e.preventDefault();
      // Get distance traveled
      let moveY = startY - e.pageY;
      // Determine if moving up or down
      if (moveY < 0) {
        isBottomMove = true;
      } else {
        isBottomMove = false;
      }
      // Move the slider
      requestID = requestAnimationFrame(() => {
        y = sliderY - moveY;
        slider.style.transform = 'translateY(' + y + 'px)';
      });
    };

    // Mouse up, touch end (move end)
    const endFunc = (e) => {
      e.preventDefault();
      // Reset settings
      slider.classList.remove('is-drag');
      isDown = false;

      // Change mouse pointer
      slider.style.cursor = 'grab';

      // If past the end point of the slider, return the position
      if (!isBottomMove && y * -1 >= sliderHeight) {
        y = sliderHeight - y * -1;
        slider.style.transform = 'translateY(' + y + 'px)';
      } else if (isBottomMove && y >= 0) {
        y = -(sliderHeight - y);
        slider.style.transform = 'translateY(' + y + 'px)';
      }

      // Reset the animation and start automatic scrolling if in the screen
      cancelAnimationFrame(requestID);
      if (isIntersecting) {
        requestID = requestAnimationFrame(scrollAnime);
      }
    };

    // Supports mouse drag
    slider.addEventListener('mouseenter', () => {
      // Change mouse pointer
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousedown', startFunc);
    slider.addEventListener('mousemove', moveFunc);
    slider.addEventListener('mouseup', endFunc);
    slider.addEventListener('mouseleave', endFunc);

    // Scrolling
    const listener = {
      handleEvent: () => {
        // Update the position of the display area (because it causes a layout shift, it is processed outside requestAnimationFrame only when a change occurs)
        areaPosi = area.getBoundingClientRect().top;
      },
    };

    /*
			Processing starts when an element enters the screen
		*/
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Auto scroll start
          areaPosi = area.getBoundingClientRect().top;
          cancelAnimationFrame(requestID);
          requestID = requestAnimationFrame(scrollAnime);

          // Add only elements visible on the screen to scroll events
          window.addEventListener('scroll', listener, { passive: true });

          // In-screen judgment flag
          isIntersecting = true;
        } else {
          // Auto unscroll
          cancelAnimationFrame(requestID);

          // Delete scroll event when out of screen
          window.removeEventListener('scroll', listener, { passive: true });

          // In-screen judgment flag
          isIntersecting = false;
        }
      });
    });

    // Observer monitoring start
    observer.observe(area);

    /*
			Responsive
		*/
    // Display area resize monitor ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      // Check whether the slider is interrupted (add if there are not enough off-screen elements)
      initializeSlider(countHeight, addCount);

      // Slider redefinition
      cancelAnimationFrame(requestID);
      requestID = requestAnimationFrame(scrollAnime);
    });

    // Start resize monitoring (fires when the first element inside the slider changes, not the slider itself)
    resizeObserver.observe(firstChild);
  });
}
