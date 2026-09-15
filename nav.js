const body = document.querySelector("body");
const mobileNavBtn = document.querySelector(".hamburger");
const navMenu = document.querySelector(".blurred-background");
const navLinks = document.querySelectorAll(".nav-link");

mobileNavBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  mobileNavBtn.classList.toggle("active");
  // body.classList.toggle("no-scroll");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    mobileNavBtn.classList.toggle("active");
  });
});