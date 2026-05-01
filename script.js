document.querySelectorAll(".faq-01__question").forEach((question) => {
  question.addEventListener("click", () => {
    const isOpen = question.classList.contains("state-active");
    document.querySelectorAll(".faq-01__question").forEach((item) => {
      item.classList.remove("state-active");
      item.setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      question.classList.add("state-active");
      question.setAttribute("aria-expanded", "true");
    }
  });
});
