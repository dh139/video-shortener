document.getElementById('processButton').addEventListener('click', () => {
    const youtubeLink = document.getElementById('youtubeLink').value;
    if (!youtubeLink) {
      alert('Please enter a YouTube link first.');
      return;
    }
  
    fetch('/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ youtubeLink })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayShorts(data.shorts);
      } else {
        alert('Failed to process video: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  
  function displayShorts(shorts) {
    const result = document.getElementById('result');
    result.innerHTML = '';
    shorts.forEach(short => {
      const videoElement = document.createElement('video');
      videoElement.src = `/uploads/${short}`;
      videoElement.controls = true;
      result.appendChild(videoElement);
    });
  }
  