// Simple test to check Supabase connection
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://taewcmmzroxtkuaenirk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZXdjbW16cm94dGt1YWVuaXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjc1MDAsImV4cCI6MjA3NTYwMzUwMH0.HMan2sYI7F-RAw0XRcyKNyt_j-2QzxO0z1q4BIOrch0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase.from("posts").select("*").limit(1);

    if (error) {
      console.error("Connection test failed:", error);
      console.log("This likely means the posts table does not exist yet.");
      console.log("Please run the migration in your Supabase dashboard.");
    } else {
      console.log("Connection successful!", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

testConnection();
