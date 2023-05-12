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
    }
  },
  async created() {
    await this.getAll(this.baseUrl);
  },

  methods: {
    updateBaseUrl(){
      const encodedCountry = encodeURIComponent(this.country);
      const encodedCity = encodeURIComponent(this.city);
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
      const top = this.showTop(day.hours.find(hour => hour.datetime === this.time).temp);
      day.appropriateTop = top;
    },
    showAppropriateBottom(day) {
      this.selectedDay = day;
      const bottom = this.showBottom(day.hours.find(hour => hour.datetime === this.time).temp);
      day.appropriateBottom = bottom;
    },
    showAppropriateDrink(day) {
      this.selectedDay = day;
      const Drink = this.showDrink(day.hours.find(hour => hour.datetime === this.time).temp);
      day.appropriateDrink = Drink;
    },
    showAppropriateAccecories(day) {
      this.selectedDay = day;
      const Accecories = this.showAccecories(day.hours.find(hour => hour.datetime === this.time).temp);
      day.appropriateAccecories = Accecories;
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
      if (temp < 0) {
        return "Winter Jacket";
      } else if (temp >= 5 && temp < 10) {
        return "Coat or normal jacket. ";
      } else if (temp >= 10 && temp <= 15) {
        return "Hoodie";
      } else {
        return "T-Shirt";
      }
    },

    showBottom(temp) {
      if (temp < 0) {
        return "Ski-Pants";
      } else if (temp >= 5 && temp <= 15) {
        return "Pants";
      } else {
        return "Shorts";
      }
    },
    showDrink(temp) {
      if (temp < 5) {
        return "Bring hot drink";
      } else if (temp >= 5 && temp < 15) {
        return "No drink required";
      } else {
        return "Bring cold drinks";
      }
    },
    showAccecories(temp) {
      if (temp < 10) {
        return "Placeholder under 10 grader";
      } else if (temp >= 10 && temp < 15) {
        return "Placeholder under 15 grader";
      } else if (temp >= 15 && temp <= 20) {
        return "Placeholder under 20 grader";
      } else {
        return "Placeholder over 20 grader";
      }
    },
    autocomplete(){
      let availablekeyword = [
        'Paris',
        'England',
  
      ];
      const resultbox =document.querySelector(".result-box");
      const countryInput=document.getElementById("countryInput");
      countryinput.onkeyup=function(){
        let result =[];
        let input =countryInput.value;
        if(input.lenght){
          result =availablekeywords.filter((keyword)=>{
           return keyword.toLowerCase().includes(input.toLowerCase());
          });
          console.log(result)
        }
        display(result);
      }
      function display(result){
        const content = result.map((list)=>{
          return "<li>"+ list +"</li>";
        })
  
        resultbox.innerHTML = "<ul>"+ content.join('') +"</ul>";
      }
    }
  },
  watch: {
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
    console.log("Mounted hook called");
    console.log("this.weather:", this.weather);
  },
 
}).mount("#app");