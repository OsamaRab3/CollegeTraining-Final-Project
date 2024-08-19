// formValidation.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const titleInput = document.getElementById('title');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
  
    form.addEventListener('submit', function(event) {
      let isValid = true;
      let errorMessage = '';
  
      // Clear previous error messages
      document.querySelectorAll('.error').forEach(function(el) {
        el.remove();
      });
  
      // Validate Title
      if (titleInput.value.trim() === '') {
        isValid = false;
        errorMessage = 'Title must not be empty.';
        showError(titleInput, errorMessage);
      } else if (titleInput.value.length > 10) {
        isValid = false;
        errorMessage = 'Title must be less than or equal to 10 characters.';
        showError(titleInput, errorMessage);
      }
  
      // Validate Email
      if (emailInput.value.trim() === '') {
        isValid = false;
        errorMessage = 'Email must not be empty.';
        showError(emailInput, errorMessage);
      } else if (!isValidEmail(emailInput.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
        showError(emailInput, errorMessage);
      }
  
      // Validate Message
      if (messageInput.value.trim() === '') {
        isValid = false;
        errorMessage = 'Message must not be empty.';
        showError(messageInput, errorMessage);
      } else if (messageInput.value.length > 100) {
        isValid = false;
        errorMessage = 'Message must be less than or equal to 100 characters.';
        showError(messageInput, errorMessage);
      }
  
      // If the form is not valid, prevent submission
      if (!isValid) {
        event.preventDefault();
      }
    });
  
    function showError(inputElement, message) {
      const errorElement = document.createElement('div');
      errorElement.className = 'error';
      errorElement.style.color = 'red';
      errorElement.textContent = message;
      inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
  
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  });
  