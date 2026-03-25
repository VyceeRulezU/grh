
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadCover() {
  const filePath = path.resolve('c:/Users/USER/Downloads/grh/src/assets/book-cover.jpg');
  const fileBuffer = fs.readFileSync(filePath);
  
  const fileName = `course-covers/book-cover-${Date.now()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error('Error uploading:', error);
    return;
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  console.log('Public URL:', publicUrl);

  const { error: updateError } = await supabase
    .from('courses')
    .update({ thumbnail: publicUrl, cover_image: publicUrl })
    .eq('id', 17);

  if (updateError) {
    console.error('Error updating course:', updateError);
  } else {
    console.log('Course updated successfully');
  }
}

uploadCover();
