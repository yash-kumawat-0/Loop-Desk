import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthGuard } from "lemma-sdk/react";
import client, { clientReady } from "./api/client";
import SubmitTicket from './pages/SubmitTicket';
import Confirmation from './pages/Confirmation';
import TrackTicket from './pages/TrackTicket';

export default function App() {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    clientReady.then(() => setReady(true));
  }, []);
  
  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthGuard client={client} appName="Customer Support Panel">
      <BrowserRouter>
        {/* Background gradient */}
        <div className="app-bg" />

        <Routes>
          <Route path="/" element={<SubmitTicket />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/track" element={<TrackTicket />} />
        </Routes>
      </BrowserRouter>
    </AuthGuard>
  );
}
