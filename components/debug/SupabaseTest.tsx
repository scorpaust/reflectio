"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SupabaseTest() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const testConnection = async () => {
    setLoading(true);
    setResult("Testing...");

    try {
      // Test 1: Basic connection
      setResult("1. Testing basic connection...");
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        setResult(`Auth Error: ${authError.message}`);
        return;
      }

      setResult(`2. Auth OK. User: ${authData.user?.email || "No user"}`);

      // Test 2: Check if posts table exists
      setResult((prev) => prev + "\n3. Testing posts table...");
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id")
        .limit(1);

      if (postsError) {
        setResult((prev) => prev + `\nPosts Error: ${postsError.message}`);
        return;
      }

      setResult(
        (prev) =>
          prev + `\n4. Posts table OK. Found ${postsData?.length || 0} records`
      );

      // Test 3: Try a simple insert (if user exists)
      if (authData.user) {
        setResult((prev) => prev + "\n5. Testing insert...");

        const { data: insertData, error: insertError } = await supabase
          .from("posts")
          .insert({
            author_id: authData.user.id,
            title: "Test Post",
            content: "Test content",
            type: "thought",
            status: "published",
          })
          .select()
          .single();

        if (insertError) {
          setResult((prev) => prev + `\nInsert Error: ${insertError.message}`);
        } else {
          setResult(
            (prev) => prev + `\n6. Insert OK! Post ID: ${insertData?.id}`
          );

          // Clean up test post
          await supabase.from("posts").delete().eq("id", insertData.id);
          setResult((prev) => prev + "\n7. Test post cleaned up");
        }
      }
    } catch (error: any) {
      setResult((prev) => prev + `\nUnexpected Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-4">Supabase Connection Test</h3>

      <Button onClick={testConnection} disabled={loading} className="mb-4">
        {loading ? "Testing..." : "Run Test"}
      </Button>

      {result && (
        <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
