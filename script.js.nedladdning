const gifElement = document.getElementById("loadingGif");
gifElement.src =
  "./assets/images/animation-loading.gif?cacheBuster=" + new Date().getTime();

document.addEventListener("DOMContentLoaded", function () {
  const stars = 800;

  const starsContainer = document.querySelector(".stars");
  const r = 800;

  for (let i = 0; i < stars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    starsContainer.appendChild(star);
  }

  const starElements = document.querySelectorAll(".star");
  starElements.forEach(function (star) {
    const s = 0.2 + Math.random() * 2;
    const curR = r + Math.random() * 200;

    star.style.transformOrigin = `0 0 ${curR}px`;
    star.style.transform = `translate3d(0,0,-${curR}px) rotateY(${
      Math.random() * 360
    }deg) rotateX(${Math.random() * -50}deg) scale(${s}, ${s})`;
  });

  starElements.forEach(function (star) {
    star.addEventListener("mouseover", function () {
      star.classList.add("blink");
    });
  });
});

function showFinanceAnimation(element) {
  element.style.visibility = 'visible';
}