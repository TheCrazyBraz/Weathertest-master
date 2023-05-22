Vue.createApp({
  data() {
    return {
      baseUrl: "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Denmark%2C%20Roskilde?unitGroup=metric&key=9T8ZW3HTFGMM98NXPAPTV2VS9&contentType=json",
      weather: null,
      temperature: null,
      time: "10:00:00",
      selectedDay: null,
      day: 0,
      hours: [
        "00:00:00", "01:00:00", "02:00:00", "03:00:00", "04:00:00", "05:00:00", "06:00:00", "07:00:00",
        "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00",
        "16:00:00", "17:00:00", "18:00:00", "19:00:00", "20:00:00", "21:00:00", "22:00:00", "23:00:00"
      ],
      weatherData: [], // Placeholder for weather data
      currentIndex: 0,
      country: "Denmark",
      city: "Roskilde",
      age: '',
      gender: 'Male',
      easilyCold: false,
      users: [{age: '52', gender: 'male', easilyCold: false}, 
              {age: '13', gender: 'female', easilyCold: true}],
      selectedUser: null,
      availableKeywords: [
      'Paris',
      'England',
      'Italy',
      'Spain',
      'Germany'
      ],
      inputValue: '',
      modifiedWeather: null,
      showDropdown: false
    }
  },
  created: async function() {
    await this.getAll(this.baseUrl);
  },
  
    computed:{
    filteredKeywords() {
      return this.availableKeywords.filter(keyword =>
        keyword.toLowerCase().includes(this.inputValue.toLowerCase())
      );
    },
  },
  
  methods: {
    async fetchWeatherData() {
      const apiUrl = `${this.baseUrl}`; // Adjust the endpoint path as per your API
    
      try {
        console.log("Fetching weather data")
        const response = await fetch(apiUrl);
        this.weather = await response.json();
    
        // Create a copy of the weather object
        this.modifiedWeather = JSON.parse(JSON.stringify(this.weather));
    
        // Call the updateUserData method to apply user-specific modifications
        this.updateUserData();
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    },
    updateUserData() {
      console.log('Updating user data...');
      console.log('Selected user:', this.selectedUser);
    
      if (this.selectedUser !== null) {
        console.log('Inside selected user if block');
    
        const selectedUser = this.users[this.selectedUser];
    
        this.modifiedWeather.days.forEach(day => {
          day.hours.forEach(hour => {
            const matchingHour = this.weather.days[0].hours.find(defaultHour => defaultHour.datetime === hour.datetime);
            console.log('matchingHour:', matchingHour);
            console.log('hour.datetime:', hour.datetime);
    
            if (matchingHour) {
              console.log('Inside matchingHour if block');
              console.log('matchingHour.temp:', matchingHour.temp);
    
              let localTemp = matchingHour.temp; // Initialize localTemp for each hour
              console.log('Updated localTemp:', localTemp);
    
              if (selectedUser.easilyCold && hour.temp !== matchingHour.temp) {
                localTemp -= 25;
                console.log('Modified localTemp:', localTemp);
              } else if (!selectedUser.easilyCold && hour.temp !== matchingHour.temp) {
                localTemp = matchingHour.temp;
              }
    
              hour.temp = localTemp; // Update the temperature value for the hour
            }
          });
        });
      }
    
      this.showAppropriateTop(this.modifiedWeather.days[this.day]);
      this.showAppropriateBottom(this.modifiedWeather.days[this.day]);
      this.showAppropriateDrink(this.modifiedWeather.days[this.day]);
      this.showAppropriateAccecories(this.modifiedWeather.days[this.day]);
      this.renderChart();

      this.weather.days = this.modifiedWeather.days;
    },
    
        handleInput() {
      this.showDropdown = this.inputValue.length > 0;
    },
    selectInput(keyword) {
      
      this.inputValue = keyword;
      this.showDropdown = false;

      this.updateUserData();
      
      this.showAppropriateTop(this.selectedDay);
      this.showAppropriateBottom(this.selectedDay);
      this.showAppropriateDrink(this.selectedDay);
      this.showAppropriateAccecories(this.selectedDay);
      
      this.renderChart();
    },
    
    createUser() {
      console.log("Creating user")
      const user = {
        age: this.age,
        gender: this.gender,
        easilyCold: this.easilyCold
      };
      console.log(user);
      this.users.push(user);
      this.age = '';
      this.gender = '';
      this.easilyCold = false;
    },
    updateBaseUrl(){
      const encodedCountry = encodeURIComponent(this.country.trim());
      const encodedCity = encodeURIComponent(this.city.trim());
      this.baseUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodedCountry}%2C%20${encodedCity}?unitGroup=metric&key=9T8ZW3HTFGMM98NXPAPTV2VS9&contentType=json`
      this.getAll(this.baseUrl);
    },
    async getAll(url) {
      try {
        const response = await axios.get(url);
        this.weather = response.data;

        if (this.weather && this.weather.days && this.weather.days.length > 0) {
          const firstDay = this.weather.days[0];
          const hour = firstDay.hours.find(hour => hour.datetime.includes(this.time));
          if (hour) {
            this.temperature = hour.temp;

            console.log(`Temperature at ${this.time} on the first day: ${this.temperature}°C`);
          } else {
            console.log(`No temperature data found for ${this.time} on the first day`);
          }
          this.showAppropriateTop(firstDay);
          this.showAppropriateBottom(firstDay);
          this.showAppropriateDrink(firstDay);
          this.showAppropriateAccecories(firstDay);
        }
      } catch (ex) {
        alert(ex.message);
      }
    },
    nextDay() {
      this.day = (this.day + 1) % this.weather.days.length;
      this.currentIndex = this.day;
      this.renderChart();
      console.log("New chart loading");
      this.showAppropriateTop(this.weather.days[this.day]);
      this.showAppropriateBottom(this.weather.days[this.day]);
      this.showAppropriateDrink(this.weather.days[this.day]); 
      this.showAppropriateAccecories(this.weather.days[this.day]);
    },
    
    previousDay() {
      this.day = (this.day - 1 + this.weather.days.length) % this.weather.days.length;
      this.currentIndex = this.day;
      this.renderChart();
      console.log("New chart loading");
      this.showAppropriateTop(this.weather.days[this.day]);
      this.showAppropriateBottom(this.weather.days[this.day]);
      this.showAppropriateDrink(this.weather.days[this.day]); 
      this.showAppropriateAccecories(this.weather.days[this.day]);
    },
    showAppropriateTop(day) {
      this.selectedDay = day;
      const hour = day.hours.find(hour => hour.datetime === this.time);
      const temp = hour ? hour.temp : null; // Update the temperature value
    
      const top = this.showTop(temp);
      day.appropriateTop = top;
    },
    
    showAppropriateBottom(day) {
      this.selectedDay = day;
      const hour = day.hours.find(hour => hour.datetime === this.time);
      const temp = hour ? hour.temp : null; // Update the temperature value
    
      const bottom = this.showBottom(temp);
      day.appropriateBottom = bottom;
    },
    
    showAppropriateDrink(day) {
      this.selectedDay = day;
      const hour = day.hours.find(hour => hour.datetime === this.time);
      const temp = hour ? hour.temp : null; // Update the temperature value
    
      const drink = this.showDrink(temp);
      day.appropriateDrink = drink;
    },
    getMatchingHour(day) {
      // Logic to find and return the matching hour based on selectedDay
    },
    showAppropriateAccecories(day) {
        let localTemp = this.hour && this.hour.temp;
      
        if (day) {
          const matchingHour = this.getMatchingHour(day);
      
          if (matchingHour && matchingHour.temp !== undefined) {
            localTemp = matchingHour.temp;
            console.log('Updated localTemp:', localTemp);
          }
        }
        this.selectedDay = day;
        const hour = day.hours.find(hour => hour.datetime === this.time);
        const temp = hour ? hour.temp : null; // Update the temperature value

        const accecories = this.showAccecories(temp);
        day.appropriateAccecories = accecories;
    },
    renderChart() { //Weather Chart til WeatherForecast feltet
      const hours = this.weather.days[this.currentIndex].hours;
      const datetime = hours.map((hour) => hour.datetime);
      const temperature = hours.map((hour) => hour.temp);
    
      const ctx = document.getElementById("weatherChart").getContext("2d");
    
      if (this.chartInstance) {
        this.chartInstance.destroy(); // Destroy the existing chart instance
      }
    
      this.chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: datetime,
          datasets: [
            {
              label: "Temperature",
              data: temperature,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Temperature (°C)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Time",
              },
            },
          },
        },
      });
    },
    
    showTop(temp) {
      const localTemp = this.selectedUser !== null ? this.users[this.selectedUser].easilyCold ? temp - 5 : temp : temp;

      if(this.selectedUser !== null &&this.users[this.selectedUser].gender === 'female'){
        if (localTemp < 0) {
          return "Winter Jacket";
        } else if (localTemp >= 5 && localTemp < 10) {
          return "Coat or normal jacket. ";
        } else if (localTemp >= 10 && localTemp <= 15) {
          return "Hoodie";
        } else {
          return "Dress";
        }
      } else{
        if (localTemp < 0) {
          return "Winter Jacket";
        } else if (localTemp >= 5 && localTemp < 10) {
          return "Coat or normal jacket. ";
        } else if (localTemp >= 10 && localTemp <= 15) {
          return "Hoodie";
        } else {
          return "T-Shirt";
      }}
    },

    showBottom(temp) {
      const localTemp = this.selectedUser !== null ? this.users[this.selectedUser].easilyCold ? temp - 5 : temp : temp;

      if (this.selectedUser !== null && this.users[this.selectedUser].gender === 'female'){
        if (localTemp < 0) {
          return "Ski-Pants";
        } else if (localTemp >= 5 && localTemp <= 15) {
          return "leggings";
        } else {
          return "Whatever you want under the dress";
        }
      } else {
        if (localTemp < 0) {
          return "Ski-Pants";
        } else if (localTemp >= 5 && localTemp <= 15) {
          return "Pants";
        } else {
          return "Shorts";
        }
      }
    },
    showDrink(temp) {
      const localTemp = this.selectedUser !== null ? this.users[this.selectedUser].easilyCold ? temp - 5 : temp : temp;

      if (localTemp < 5) {
        return "Bring hot drink";
      } else if (localTemp >= 5 && localTemp < 15) {
        return "No drink required";
      } else {
        return "Bring cold drinks";
      }
    },
    showAccecories(temp) {
      const localTemp = this.selectedUser !== null ? this.users[this.selectedUser].easilyCold ? temp - 5 : temp : temp;
      if(this.selectedUser !== null && this.users[this.selectedUser].age > 50){
        if (localTemp < 10) {
          return "Placeholder under 10 grader (50+)";
        } else if (localTemp >= 10 && localTemp < 15) {
          return "Placeholder under 15 grader (50+)";
        } else if (localTemp >= 15 && localTemp <= 20) {
          return "Placeholder under 20 grader (50+)";
        } else {
          return "Placeholder over 20 grader (50+)";
        }
      } else {
        if (localTemp < 10) {
          return "Placeholder under 10 grader";
        } else if (localTemp >= 10 && localTemp < 15) {
          return "Placeholder under 15 grader";
        } else if (localTemp >= 15 && localTemp <= 20) {
          return "Placeholder under 20 grader";
        } else {
          return "Placeholder over 20 grader";
        }
      }
    }
  },
  watch: {
    selectedUser(newVal) {
      this.updateUserData();
      console.log("Initializing UpdateUserData (Watch)")
      console.log("Selected user:", this.users[newVal]);

    },
    weather: {
      immediate: true,
      handler(newVal) {
        if (newVal !== null) {
          this.renderChart();
          console.log("Chart Rendered");
        }
      }
    }
  },
  mounted() {
    this.fetchWeatherData();
    console.log("Mounted hook called");
    console.log("this.weather:", this.weather);
  },
 
}).mount("#app");
