let counter = 11; // Start the counter from 5 seconds
let intervalId; // Variable to hold the interval ID
let counterRunning = true; // Flag to track if counter is running

const counterElement = document.getElementById("sayac");

function updateCounter() {
  counter--;
  counterElement.innerHTML = "Yenilenmeye Kalan Süre: " + counter;

  if (counter === 0) {
    location.reload(); // Reload the page when counter reaches 0
  }
}

// Call the function initially to display the counter
updateCounter();

intervalId = setInterval(function() {
  if (counterRunning) {
    updateCounter();
  }
}, 1000); // Update the counter every second

function toggleCounter() {
  counterRunning = !counterRunning; // Toggle the counterRunning flag
  
  // Change button text based on counterRunning flag
  const button = document.querySelector("button");
  button.textContent = counterRunning ? "Durdur" : "Devam";

  if (counterRunning) {
    intervalId = setInterval(updateCounter, 1000); // Restart the counter
  } else {
    clearInterval(intervalId); // Stop the counter
  }
}