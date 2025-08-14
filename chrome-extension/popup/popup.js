// popup.js
// 處理彈出視窗的邏輯

document.getElementById('sendData').addEventListener('click', () => {
  console.log('Send Data button clicked');
});

document.getElementById('openMainPage').addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'main.html';
  iframe.style.width = '100%';
  iframe.style.height = '500px';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);
});
