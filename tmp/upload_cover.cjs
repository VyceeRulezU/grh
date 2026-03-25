
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://vedvxjugpwisjshanmyk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHZ4anVncHdpc2pzaGFubXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDc5MDUsImV4cCI6MjA4ODAyMzkwNX0.M6JrX56uBkDQfdazGItqWGwfsKOgbTWamp2vVprr0i0";

async function uploadCover() {
  const filePath = "c:/Users/USER/Downloads/grh/src/assets/book-cover.jpg";
  const fileBuffer = fs.readFileSync(filePath);
  
  const fileName = `course-covers/book-cover-${Date.now()}.jpg`;
  
  // Use Fetch API to upload
  const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${fileName}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "image/jpeg",
      "x-upsert": "true"
    },
    body: fileBuffer
  });

  const uploadResult = await response.json();
  if (!response.ok) {
    console.error('Upload failed:', uploadResult);
    return;
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
  console.log('Public URL:', publicUrl);

  // Update DB
  const updateUrl = `${supabaseUrl}/rest/v1/courses?id=eq.17`;
  const updateResponse = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({
      thumbnail: publicUrl,
      cover_image: publicUrl
    })
  });

  if (updateResponse.ok) {
    console.log('Course updated successfully');
  } else {
    const err = await updateResponse.json();
    console.error('Update failed:', err);
  }
}

uploadCover();
