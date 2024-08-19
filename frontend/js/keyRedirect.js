
document.addEventListener('keydown', function(event) {

    if (event.altKey && event.key === 'h') {
      window.location.href = 'home.html';
    }
    

    if (event.altKey && event.key === 'b') {
      window.location.href = 'submit_message.html';
    }
    

    if (event.altKey && event.key === 'v') {
      window.location.href = 'view_messages.html';
    }
    
  });
  