"use client"
import React, { useState } from 'react';

function AIPage() {
    const [loading, setLoading] = useState(false);

    const buttonText = "Click Me"
    return (
    <div>
      <h1>AI Page</h1>
      <button>{buttonText}</button>
    </div>
    );
  }
  
  export default AIPage;
  
    