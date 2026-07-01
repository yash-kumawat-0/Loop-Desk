import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthGuard } from "lemma-sdk/react";
import client, { clientReady } from "./api/client";
import SubmitTicket from './pages/SubmitTicket';
import Confirmation from './pages/Confirmation';
import TrackTicket from './pages/TrackTicket';
import Processing from './pages/Processing';
import Sidebar from './components/Sidebar';

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
    <AuthGuard client={client} appName="LoopDesk Support">
      <BrowserRouter>
        {/* Background gradient */}
        <div className="app-bg" />
        
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pl-[260px] relative">
            <Routes>
              <Route path="/" element={<SubmitTicket />} />
              <Route path="/submit" element={<SubmitTicket />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/track" element={<TrackTicket />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthGuard>
  );
}
