document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.closest(".faq-item");
    const shouldOpen = !item.classList.contains("is-open");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("is-open");
      faq.querySelector(".faq-question").setAttribute("aria-expanded", "false");
    });

    if (shouldOpen) {
      item.classList.add("is-open");
      question.setAttribute("aria-expanded", "true");
    }
  });
});
