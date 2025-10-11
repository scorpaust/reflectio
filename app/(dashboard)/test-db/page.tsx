"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestDBPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check session
      const { data: session } = await supabase.auth.getSession();
      testResults.session = {
        authenticated: !!session?.session,
        userId: session?.session?.user?.id,
      };

      // Test 2: Count posts
      const { count: postsCount, error: postsCountError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });
      testResults.postsCount = { count: postsCount, error: postsCountError?.message };

      // Test 3: Fetch posts without join
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .limit(3);
      testResults.posts = { count: posts?.length, error: postsError?.message, data: posts };

      // Test 4: Count profiles
      const { count: profilesCount, error: profilesCountError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      testResults.profilesCount = { count: profilesCount, error: profilesCountError?.message };

      // Test 5: Fetch posts with join
      const { data: postsWithAuthor, error: joinError } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles(id, full_name, username, avatar_url, current_level)
        `)
        .limit(3);
      testResults.postsWithAuthor = {
        count: postsWithAuthor?.length,
        error: joinError?.message,
        data: postsWithAuthor
      };

    } catch (error: any) {
      testResults.exception = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Test Page</h1>

      <button
        onClick={runTests}
        disabled={loading}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 mb-6"
      >
        {loading ? "Testing..." : "Run Tests"}
      </button>

      {results && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-2">Session:</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(results.session, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-2">Posts Count:</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(results.postsCount, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-2">Posts (without join):</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(results.posts, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-2">Profiles Count:</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(results.profilesCount, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-2">Posts with Author (with join):</h2>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(results.postsWithAuthor, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
