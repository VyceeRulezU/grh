
const url = "https://vedvxjugpwisjshanmyk.supabase.co/rest/v1/courses?title=ilike.*Guide%20to%20Enhance%20Citizen*&select=id,title,thumbnail,cover_image";
const options = {
  headers: {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHZ4anVncHdpc2pzaGFubXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDc5MDUsImV4cCI6MjA4ODAyMzkwNX0.M6JrX56uBkDQfdazGItqWGwfsKOgbTWamp2vVprr0i0",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHZ4anVncHdpc2pzaGFubXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDc5MDUsImV4cCI6MjA4ODAyMzkwNX0.M6JrX56uBkDQfdazGItqWGwfsKOgbTWamp2vVprr0i0"
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
