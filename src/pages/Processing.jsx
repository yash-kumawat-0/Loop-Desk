import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useFunctionRun } from "lemma-sdk/react";
import client from "../api/client";
import ResponseCard from '../components/ResponseCard';

export default function Processing() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('new');
  const [responseMsg, setResponseMsg] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const { start: fetchTickets } = useFunctionRun({ client, functionName: "customer_panel_list_tickets" });

  useEffect(() => {
    if (!ticketId) {
      navigate('/');
      return;
    }

    let interval;
    let timerInterval;

    const pollStatus = async () => {
      try {
        const res = await fetchTickets({ ticket_id: ticketId });
        const tickets = res?.output_data?.tickets || [];
        if (tickets.length > 0) {
          const t = tickets[0];
          setStatus(t.status || 'new');
          if (t.response) {
            setResponseMsg(t.response);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 3.5s
    interval = setInterval(pollStatus, 3500);

    // Track elapsed time
    timerInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [ticketId, fetchTickets, navigate]);

  // Determine current step index (0-3) based on status
  // new -> 0
  // triaged -> 1
  // drafted -> 2
  // resolved -> 3
  const getStepIndex = () => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 3;
      case 'drafted': return 2;
      case 'triaged': return 1;
      case 'new': 
      default: return 0;
    }
  };

  const currentIndex = getStepIndex();
  const isTakingLong = timeElapsed > 90;

  const steps = [
    { title: 'Ticket Received', desc: 'Securely logged in our system' },
    { title: 'Understanding Issue', desc: 'AI is analyzing category and priority' },
    { title: 'Searching Knowledge Base', desc: 'Finding relevant documentation' },
    { title: 'Preparing Response', desc: 'Drafting the best solution' }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full animate-fade-in">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3 text-text-primary">Agent Working...</h1>
        <p className="text-text-secondary">
          LoopDesk AI is processing ticket <span className="font-mono text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded">{ticketId}</span>
        </p>
      </div>

      <div className="glass-card p-8 w-full max-w-md shadow-xl border-white/5 relative overflow-hidden">
        
        <div className="space-y-0">
          {steps.map((step, idx) => {
            const isComplete = currentIndex > idx || status === 'resolved';
            const isActive = currentIndex === idx && status !== 'resolved';
            
            let stateClass = 'step-pending';
            if (isActive) stateClass = 'step-active';
            if (isComplete) stateClass = 'step-complete';

            return (
              <div key={idx} className={`step-item ${stateClass}`}>
                <div className="step-line" />
                <div className="step-icon-container flex-shrink-0">
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </div>
                <div className="pt-1 pb-4">
                  <h4 className={`text-sm font-semibold mb-1 ${isActive || isComplete ? 'text-text-primary' : 'text-text-muted'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs ${isActive ? 'text-accent-violet' : 'text-text-muted/60'}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resolved State Overlay / Inline content */}
        {status === 'resolved' && (
          <div className="mt-8 pt-6 border-t border-glass-border animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4 text-accent-emerald">
              <div className="w-8 h-8 rounded-full bg-accent-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Resolution Ready</h3>
            </div>
            
            {responseMsg && (
              <div className="mb-6">
                <ResponseCard response={responseMsg} />
              </div>
            )}

            <Link to={`/track?id=${encodeURIComponent(ticketId)}`} className="btn-primary w-full">
              View Full Ticket Details
            </Link>
          </div>
        )}

      </div>

      {isTakingLong && status !== 'resolved' && (
        <div className="mt-8 max-w-sm text-center animate-fade-in">
          <p className="text-sm text-text-muted bg-white/5 border border-white/10 rounded-lg p-4">
            This is taking a little longer than usual. You can safely leave this page; your ticket will still be processed. 
            <br/><br/>
            Track it anytime from the sidebar using your ticket ID.
          </p>
        </div>
      )}

    </div>
  );
}
