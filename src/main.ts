import './style.css';

const buttons = document.querySelectorAll<HTMLButtonElement>('.nav');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.classList.contains('next') ? 'Next' : 'Previous';
    console.log(`${target} image selected`);
  });
});
