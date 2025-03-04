document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "84371e9b506cb6fa4cc921511fef0599";
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
    const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
    const geoUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat={lat}&lon={lon}&appid=" + apiKey;

    const searchBox = document.getElementById("search-box");
    const searchBtn = document.getElementById("search-btn");
    const geoBtn = document.getElementById("geo-btn");
    const weatherIcon = document.getElementById("weather-icon");

    const weatherIcons = {
        "clear": "clear.png",
        "clouds": "clouds.png",
        "drizzle": "drizzle.png",
        "mist": "mist.png",
        "rain": "rain.png",
        "smoke": "smoke.png",
        "snow": "snow.png",
        "thunderstorm": "thunderstorm.png"
    };

    // Загружаем погоду при запуске страницы
    if (localStorage.getItem("lastCity")) {
        checkWeather(localStorage.getItem("lastCity"));
    } else {
       
        getLocation();
    }

    // ✅ Функция загрузки погоды
    async function checkWeather(city) {
        if (!city.trim()) {
            alert("Введите название города!");
            return;
        }
    
        try {
            const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
            if (!response.ok) throw new Error("Город не найден!");
    
            const data = await response.json();
            console.log("Текущая погода:", data);
    
            // Сохраняем последний введенный город в localStorage
            localStorage.setItem("lastCity", city);
    
            document.getElementById("city-name").textContent = data.name;
            document.getElementById("temperature").textContent = Math.round(data.main.temp) + "°C";
            document.getElementById("description").textContent = data.weather[0].description;
            document.getElementById("details").textContent = `Ветер: ${data.wind.speed} м/с | Влажность: ${data.main.humidity}%`;
            document.getElementById("feels-like").textContent = `Ощущается как: ${Math.round(data.main.feels_like)}°C`;
    
            const weatherCondition = data.weather[0].main.toLowerCase();
            weatherIcon.src = `./images/${weatherIcons[weatherCondition] || "clear.png"}`;
            weatherIcon.style.display = "block";
    
            document.querySelector(".weather").style.display = "block";
            document.querySelector(".error").style.display = "none";
    
            // Загружаем прогноз после обновления текущей погоды
            getForecast(city);
        } catch (error) {
            console.error("Ошибка при загрузке погоды:", error);
            document.querySelector(".weather").style.display = "none";
            document.querySelector(".error").style.display = "block";
        }
    }
    

    // ✅ Функция загрузки прогноза + ГРАФИК
    async function getForecast(city) {
        try {
            const response = await fetch(`${forecastUrl}${city}&appid=${apiKey}`);
            if (!response.ok) throw new Error("Ошибка загрузки прогноза!");
    
            const data = await response.json();
            console.log("Прогноз погоды:", data);
    
            const forecastContainer = document.querySelector(".forecast");
            forecastContainer.innerHTML = ""; // Очищаем старый прогноз
    
            const labels = [];
            const temperatures = [];
    
            data.list.forEach(item => {
                const date = item.dt_txt.split(" ")[0];
                if (!labels.includes(date)) {
                    labels.push(date);
                    temperatures.push(Math.round(item.main.temp));
    
                    const forecastElement = document.createElement("div");
                    forecastElement.classList.add("forecast-item");
                    forecastElement.innerHTML = `
                        <p><strong>${date}</strong></p>
                        <img src="./images/${weatherIcons[item.weather[0].main.toLowerCase()] || "clear.png"}">
                        <p>${Math.round(item.main.temp)}°C</p>
                        <p>${item.weather[0].description}</p>
                    `;
                    forecastContainer.appendChild(forecastElement);
                }
            });
    
            console.log("Данные для графика:", labels, temperatures);
            updateChart(labels, temperatures);
        } catch (error) {
            console.error("Ошибка прогноза:", error);
        }
    }
    

    // ✅ Функция обновления графика
    let temperatureChart = null;
    function updateChart(labels, temperatures) {
        const ctx = document.getElementById("temperatureChart").getContext("2d");

        if (temperatureChart) {
            temperatureChart.destroy();
        }
        if (window.myChart) {
            window.myChart.destroy();
        }
        
        temperatureChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Температура (°C)",
                    data: temperatures,
                    borderColor: "#f39c12",
                    backgroundColor: "rgba(243, 156, 18, 0.2)",
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }

    // ✅ Геолокация
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => checkWeatherByCoords(position.coords.latitude, position.coords.longitude),
                () => alert("Не удалось получить местоположение.")
            );
        }
    }
    
    async function checkWeatherByCoords(lat, lon) {
        const url = geoUrl.replace("{lat}", lat).replace("{lon}", lon);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error();
            const data = await response.json();
            checkWeather(data.name);
        } catch {
            alert("Не удалось определить погоду.");
        }
    }
    

    async function checkWeatherByCoords(lat, lon) {
        const url = geoUrl.replace("{lat}", lat).replace("{lon}", lon);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error();
            const data = await response.json();
            checkWeather(data.name);
        } catch {
            alert("Не удалось определить погоду.");
        }
    }

    // ✅ Темная и светлая темы
    const themeToggle = document.getElementById("theme-toggle");

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        themeToggle.textContent = document.body.classList.contains("light-theme") ? "🌞" : "🌙";
        
        // Меняем цвет кнопок при смене темы
        const buttons = document.querySelectorAll("button");
        buttons.forEach(button => {
            button.style.transition = "all 0.3s ease-in-out";
        });
    });
    


    searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
    searchBox.addEventListener("keypress", e => e.key === "Enter" && checkWeather(searchBox.value));
    geoBtn.addEventListener("click", getLocation);
    function renderTemperatureChart(temperatureData, labels) {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
    
        // Если график уже существует — сначала его уничтожаем
        if (window.myChart) {
            window.myChart.destroy();
        }
    
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Температура (°C)',
                    data: temperatureData,
                    borderColor: 'rgba(255, 193, 7, 1)',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
    
    function getForecast(city) {
        fetch(`${forecastUrl}${city}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const forecastContainer = document.querySelector(".forecast");
                forecastContainer.innerHTML = "";
    
                const temperatureData = [];
                const labels = [];
    
                data.list.forEach((item, index) => {
                    if (index % 8 === 0) { // Берём прогноз раз в 24 часа
                        const date = item.dt_txt.split(" ")[0];
                        labels.push(date);
                        temperatureData.push(Math.round(item.main.temp));
    
                        const weatherCondition = item.weather[0].main.toLowerCase();
                        const iconSrc = `./images/${weatherIcons[weatherCondition] || "clear.png"}`;
    
                        const forecastElement = document.createElement("div");
                        forecastElement.classList.add("forecast-item");
                        forecastElement.innerHTML = `
                            <p><strong>${date}</strong></p>
                            <img src="${iconSrc}" alt="${item.weather[0].description}">
                            <p>${Math.round(item.main.temp)}°C</p>
                            <p>${item.weather[0].description}</p>
                        `;
                        forecastContainer.appendChild(forecastElement);
                    }
                });
    
                // Отображаем график температуры
                renderTemperatureChart(temperatureData, labels);
                console.log("Создаём график", labels, temperatureData);

            })
            .catch(error => console.error("Ошибка загрузки прогноза:", error));
    }
    });

    let temperatureChart = null;
function updateChart(labels, temperatures) {
    const ctx = document.getElementById("temperatureChart").getContext("2d");

    if (temperatureChart) {
        temperatureChart.destroy();
    }

    temperatureChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Температура (°C)",
                data: temperatures,
                borderColor: "#f39c12",
                backgroundColor: "rgba(243, 156, 18, 0.2)",
                borderWidth: 2,
                pointRadius: 4,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

// Функция смены фона
function changeBackground(weather) {
    console.log("Изменяем фон для:", weather);  // Проверяем, какая погода приходит
    const body = document.body;
    
    let backgroundStyle = "";
    
    if (weather.includes("clear")) {
        backgroundStyle = "linear-gradient(to bottom, #87CEFA, #FFD700)";
    } else if (weather.includes("few clouds")) {
        backgroundStyle = "linear-gradient(to bottom, #B0E0E6, #87CEFA)";
    } else if (weather.includes("clouds")) {
        backgroundStyle = "linear-gradient(to bottom, #778899, #B0C4DE)";
    } else if (weather.includes("rain") || weather.includes("drizzle")) {
        backgroundStyle = "linear-gradient(to bottom, #2F4F4F, #708090)";
    } else if (weather.includes("thunderstorm")) {
        backgroundStyle = "linear-gradient(to bottom, #000000, #696969)";
    } else if (weather.includes("snow")) {
        backgroundStyle = "linear-gradient(to bottom, #F0F8FF, #E0FFFF)";
    } else if (weather.includes("mist") || weather.includes("fog")) {
        backgroundStyle = "linear-gradient(to bottom, #D3D3D3, #A9A9A9)";
    }

    console.log("Применяем стиль:", backgroundStyle); // Проверяем, что фон меняется

    body.style.background = backgroundStyle;
}


// Вставляем вызов функции в checkWeather()
async function checkWeather(city) {
    try {
        const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
        if (!response.ok) throw new Error("Город не найден!");

        const data = await response.json();
        console.log("Текущая погода:", data);

        document.getElementById("city-name").textContent = data.name;
        document.getElementById("temperature").textContent = Math.round(data.main.temp) + "°C";
        document.getElementById("description").textContent = data.weather[0].description;
        
        const weatherCondition = data.weather[0].main.toLowerCase();
        changeBackground(weatherCondition); // Меняем фон!

    } catch (error) {
        console.error("Ошибка загрузки погоды:", error);
    }
}

function startRainAnimation() {
    document.getElementById("rainCanvas").style.display = "block";
}

function startSnowAnimation() {
    document.getElementById("snowCanvas").style.display = "block";
}


