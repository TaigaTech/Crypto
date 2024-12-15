document.addEventListener('DOMContentLoaded', function () {
  const priceChartCanvas = document.getElementById('priceChart').getContext('2d');
  let selectedCurrency = 'usd';
  let priceAlerts = [];

  // Fetch live data from CoinGecko API every second
  function fetchCryptoData() {
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedCurrency}&order=market_cap_desc&per_page=50&page=1&sparkline=true`)
      .then(response => response.json())
      .then(data => {
        updateCryptoTable(data);
        updatePriceChart(data);
        updateTrendingCryptos(data);
        checkPriceAlerts(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  // Update crypto table with new data
  function updateCryptoTable(data) {
    const cryptoTableBody = document.getElementById('crypto-table-body');
    cryptoTableBody.innerHTML = '';

    data.forEach(crypto => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${crypto.image}" alt="${crypto.name}" width="25" height="25"> ${crypto.name}</td>
        <td>$${crypto.current_price.toFixed(2)}</td>
        <td style="color: ${crypto.price_change_percentage_24h > 0 ? 'green' : 'red'};">
          ${crypto.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${crypto.total_volume.toLocaleString()}</td>
        <td>$${crypto.market_cap.toLocaleString()}</td>
      `;
      cryptoTableBody.appendChild(row);
    });
  }

  // Update price chart with new data
  function updatePriceChart(data) {
    const coin = data[0]; // For simplicity, track the first coin (e.g., Bitcoin)
    const prices = coin.sparkline_in_7d.price;
    const times = Array.from({ length: prices.length }, (_, index) => index);

    new Chart(priceChartCanvas, {
      type: 'line',
      data: {
        labels: times,
        datasets: [{
          label: `${coin.name} Price`,
          data: prices,
          borderColor: '#007BFF',
          fill: false,
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: { display: false },
          y: {
            beginAtZero: false,
            ticks: { callback: function(value) { return '$' + value.toLocaleString(); } },
          },
        },
      },
    });
  }

  // Update Trending Cryptos
  function updateTrendingCryptos(data) {
    const trendingList = document.getElementById('trending-cryptos');
    trendingList.innerHTML = '';
    
    data.forEach(crypto => {
      const listItem = document.createElement('li');
      listItem.textContent = crypto.name;
      trendingList.appendChild(listItem);
    });
  }

  // Handle price alert submission
  document.getElementById('price-alert-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const cryptoName = document.getElementById('alert-crypto').value.trim();
    const alertPrice = parseFloat(document.getElementById('alert-price').value);

    if (cryptoName && alertPrice) {
      priceAlerts.push({ cryptoName, alertPrice });
      alert(`Price alert set for ${cryptoName} at $${alertPrice.toFixed(2)}`);
    }
  });

  // Check if price alerts need to be triggered
  function checkPriceAlerts(data) {
    priceAlerts.forEach(alert => {
      const crypto = data.find(crypto => crypto.name.toLowerCase() === alert.cryptoName.toLowerCase());
      if (crypto && crypto.current_price >= alert.alertPrice) {
        alert(`Price Alert: ${alert.cryptoName} has reached your set price of $${alert.alertPrice.toFixed(2)}!`);
      }
    });
  }

  // Fetch Market News from NewsAPI
  function fetchMarketNews() {
    fetch('https://newsapi.org/v2/everything?q=cryptocurrency&apiKey=206120555ced46fd8ed0e8a7997834b9')
      .then(response => response.json())
      .then(data => {
        updateMarketNews(data.articles);
      })
      .catch(error => console.error('Error fetching news:', error));
  }

  // Update Market News Section
  function updateMarketNews(articles) {
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = '';

    articles.forEach(article => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
      newsList.appendChild(listItem);
    });
  }

  // Handle currency selection change
  document.getElementById('currency-select').addEventListener('change', (event) => {
    selectedCurrency = event.target.value;
    fetchCryptoData(); // Re-fetch data in the selected currency
  });

  // Handle search functionality
  document.getElementById('crypto-search').addEventListener('input', function(event) {
    const searchQuery = event.target.value.toLowerCase();
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedCurrency}&order=market_cap_desc&per_page=50&page=1&sparkline=true`)
      .then(response => response.json())
      .then(data => {
        const filteredData = data.filter(crypto => crypto.name.toLowerCase().includes(searchQuery));
        updateCryptoTable(filteredData);
        updateTrendingCryptos(filteredData);
      })
      .catch(error => console.error('Error fetching data:', error));
  });

  // Dark/Light Mode Toggle
  document.getElementById('theme-toggle-checkbox').addEventListener('change', (event) => {
    if (event.target.checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  });

  // Initialize data fetching every second
  setInterval(fetchCryptoData, 1000); // Update every second
  fetchCryptoData(); // Initial data fetch
  fetchMarketNews(); // Fetch news initially
});