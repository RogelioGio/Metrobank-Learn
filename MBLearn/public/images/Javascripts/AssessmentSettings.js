
const cards = document.querySelectorAll('.elementCard');

cards.forEach(card => {
  card.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('selected'));

    card.classList.add('selected');
  });
});
