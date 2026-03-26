
const url = "https://vedvxjugpwisjshanmyk.supabase.co/rest/v1/library_resources?limit=1";
const options = {
  headers: {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHZ4anVncHdpc2pzaGFubXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDc5MDUsImV4cCI6MjA4ODAyMzkwNX0.M6JrX56uBkDQfdazGItqWGwfsKOgbTWamp2vVprr0i0",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHZ4anVncHdpc2pzaGFubXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDc5MDUsImV4cCI6MjA4ODAyMzkwNX0.M6JrX56uBkDQfdazGItqWGwfsKOgbTWamp2vVprr0i0"
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(data => {
    if (data && data.length > 0) {
      console.log(JSON.stringify(Object.keys(data[0]), null, 2));
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log("No data found");
    }
  })
  .catch(err => console.error(err));
