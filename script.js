// JavaScript
// Add this in your script.js file
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('nav a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove the 'active' class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add the 'active' class to the clicked tab and corresponding tab content
            tab.classList.add('active');
            const targetId = tab.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
});

// Define the createChart function
function createChart(chartId, cryptoName, balance) {
    const ctx = document.getElementById(chartId).getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [cryptoName],
            datasets: [{
                label: `${cryptoName} Balance`,
                data: [balance],
                backgroundColor: ["rgba(75, 192, 192, 0.6)"]
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function fetchAllData() {
    try {
        // Fetch cryptocurrency prices
        const prices = await fetchCryptoPrices();

        // Fetch balances for EOS, WAX, and Telos
        const eosTotal = await fetchBalance("EOS", "eosio.token", "EOS", "eos-balance", "https://eos.greymass.com/v1/chain/get_currency_balance", "eos-chart", prices);
        const waxTotal = await fetchBalance("WAX", "eosio.token", "WAX", "wax-balance", "https://wax.greymass.com/v1/chain/get_currency_balance", "wax-chart", prices);
        const telosTotal = await fetchBalance("Telos", "eosio.token", "TLOS", "telos-balance", "https://telos.caleos.io/v1/chain/get_currency_balance", "telos-chart", prices);

        // Calculate the total USD value of all cryptocurrencies deposited
        const totalUSDValue = eosTotal + waxTotal + telosTotal;

        // Create a new chart comparing the cryptocurrencies in USD
        createUSDComparisonChart("usd-comparison-chart", eosTotal, waxTotal, telosTotal);

        // Compare deposited values and update the most deposited cryptocurrency
        const mostDepositedCrypto = compareDeposits(eosTotal, waxTotal, telosTotal);
        document.getElementById("most-deposited").textContent = `Most Deposited: ${mostDepositedCrypto}`;

        // Update the total USD value text
        document.getElementById("total-usd-value").textContent = `Total USD Value: $${totalUSDValue.toFixed(2)}`;

        // Update the total USD value in the "Total Deposits" section
        document.getElementById("total-usd-amount").textContent = totalUSDValue.toFixed(2);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}



// Call the fetchAllData function when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    fetchAllData();
});

async function fetchBalance(cryptoName, tokenCode, tokenSymbol, elementId, rpcEndpoint, chartId, prices) {
    const accountName = "koynetworksw";

    const requestData = {
        code: tokenCode,
        account: accountName,
        symbol: tokenSymbol
    };

    try {
        const response = await fetch(rpcEndpoint, {
            method: "POST",
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        const balance = data.length > 0 ? parseFloat(data[0].split(" ")[0]) : 0;
        const cryptoPrice = prices[cryptoName.toLowerCase()].usd;
        const usdValue = balance * cryptoPrice;

        // Create a chart
        createChart(chartId, cryptoName, balance);

        // Update the balance text with both cryptocurrency amount and USD value
        document.getElementById(elementId).textContent = `${cryptoName} Balance: ${balance.toFixed(2)} ${tokenSymbol} (USD: $${usdValue.toFixed(2)})`;

        return usdValue;
    } catch (error) {
        console.error(`Error fetching ${cryptoName} balance: ${error}`);
        document.getElementById(elementId).textContent = `${cryptoName} Balance: Error`;
        return 0;
    }
    
}

function createUSDComparisonChart(chartId, eosTotal, waxTotal, telosTotal) {
    const ctx = document.getElementById(chartId).getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["EOS", "WAX", "TLOS"],
            datasets: [{
                label: "USD Deposits",
                data: [eosTotal, waxTotal, telosTotal],
                backgroundColor: ["rgba(175, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)"]
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function compareDeposits(eosTotal, waxTotal, telosTotal) {
    if (eosTotal >= waxTotal && eosTotal >= telosTotal) {
        return "EOS";
    } else if (waxTotal >= eosTotal && waxTotal >= telosTotal) {
        return "WAX";
    } else {
        return "TELOS";
    }
}
function sumDeposits(eosTotal, waxTotal, telosTotal) {
    const totalUSD = eosTotal + waxTotal + telosTotal;
    return `USD Total: $${totalUSD.toFixed(2)}`;
}


async function fetchCryptoPrices() {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=eos,wax,telos&vs_currencies=usd`;

    try {
        const response = await fetch(url);
        const prices = await response.json();
        return {
            eos: prices.eos,
            wax: prices.wax,
            telos: prices.telos
        };
    } catch (error) {
        console.error("Error fetching cryptocurrency prices:", error);
        return {};
    }
}
// Get a reference to the "most deposited" tab link
const mostDepositedTabLink = document.querySelector('a[href="#most-deposited-tab"]');

// Get a reference to the "most deposited" tab section
const mostDepositedTabSection = document.querySelector('#most-deposited-tab');

// Add a class to the tab link to make it active
mostDepositedTabLink.classList.add('active');

// Display the "most deposited" tab section
mostDepositedTabSection.style.display = 'block';

// Add an event listener to handle tab switching when a link is clicked
document.querySelectorAll('nav ul li a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    // Remove the "active" class from all tab links
    document.querySelectorAll('nav ul li a').forEach((item) => {
      item.classList.remove('active');
    });

    // Hide all tab sections
    document.querySelectorAll('.tab-content').forEach((section) => {
      section.style.display = 'none';
    });

    // Add the "active" class to the clicked tab link
    e.target.classList.add('active');

    // Display the corresponding tab section
    const targetId = e.target.getAttribute('href').substring(1);
    document.getElementById(targetId).style.display = 'block';
  });
});
