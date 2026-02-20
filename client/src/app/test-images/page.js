// Test page to debug Supabase image loading
// Place this at: client/src/app/test-images/page.js

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TestImagesPage() {
  const [doctors, setDoctors] = useState([]);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Fetch doctors to see their image URLs
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.doctors);
          testImageUrls(data.doctors);
        }
      });
  }, []);

  const testImageUrls = async (doctors) => {
    const results = [];
    for (const doctor of doctors.slice(0, 5)) { // Test first 5
      try {
        const response = await fetch(doctor.avatar_url, { method: 'HEAD' });
        results.push({
          name: doctor.full_name,
          url: doctor.avatar_url,
          status: response.status,
          accessible: response.ok
        });
      } catch (error) {
        results.push({
          name: doctor.full_name,
          url: doctor.avatar_url,
          status: 'ERROR',
          accessible: false,
          error: error.message
        });
      }
    }
    setTestResults(results);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Image URL Debug Page</h1>
      
      <h2>Environment Variables:</h2>
      <pre style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
      </pre>

      <h2>Expected Image URL Format:</h2>
      <pre style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
        ✅ https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/avatar.jpg
      </pre>

      <h2>Accessibility Test Results:</h2>
      {testResults.map((result, idx) => (
        <div key={idx} style={{ 
          background: result.accessible ? '#e8f5e9' : '#ffebee', 
          padding: '15px', 
          marginBottom: '10px',
          borderRadius: '8px'
        }}>
          <strong>{result.name}</strong>
          <br />
          Status: <code>{result.status}</code> {result.accessible ? '✅' : '❌'}
          <br />
          URL: <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{result.url}</code>
          {result.error && <div style={{ color: 'red' }}>Error: {result.error}</div>}
        </div>
      ))}

      <h2>Database URLs:</h2>
      {doctors.slice(0, 5).map((doctor, idx) => (
        <div key={idx} style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>{doctor.full_name}</h3>
          <p><strong>Avatar URL:</strong> <code>{doctor.avatar_url || 'NULL'}</code></p>
          <p><strong>URL Type:</strong> {
            !doctor.avatar_url ? '❌ No URL' :
            doctor.avatar_url.startsWith('https://') ? '✅ Full URL' :
            doctor.avatar_url.startsWith('/') ? '⚠️ Relative path' :
            '⚠️ Unknown format'
          }</p>
          
          <h4>Test Next.js Image Component:</h4>
          {doctor.avatar_url && (
            <div>
              <Image 
                src={doctor.avatar_url}
                alt={doctor.full_name}
                width={100}
                height={100}
                onError={(e) => console.error('Image failed:', doctor.avatar_url)}
                onLoad={() => console.log('Image loaded:', doctor.avatar_url)}
              />
            </div>
          )}
          
          <h4>Test Direct IMG Tag:</h4>
          {doctor.avatar_url && (
            <img 
              src={doctor.avatar_url}
              alt={doctor.full_name}
              width={100}
              height={100}
              onError={(e) => console.error('Direct img failed:', doctor.avatar_url)}
              onLoad={() => console.log('Direct img loaded:', doctor.avatar_url)}
            />
          )}
        </div>
      ))}

      <h2>Manual Test Links:</h2>
      <p>Open these in a new incognito tab:</p>
      <ul>
        <li><a href="https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/" target="_blank">Browse doctors bucket</a></li>
        <li><a href="https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/services/" target="_blank">Browse services bucket</a></li>
      </ul>
    </div>
  );
}
