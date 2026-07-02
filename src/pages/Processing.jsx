import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useFunctionRun } from "lemma-sdk/react";
import client from "../api/client";
import ResponseCard from '../components/ResponseCard';

export default function Processing() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const navigate = useNavigate();
  
  // Polling state
  const [status, setStatus] = useState('new');
  const [responseMsg, setResponseMsg] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Failure/Stall state
  const [isFailed, setIsFailed] = useState(false);
  const [failReason, setFailReason] = useState('');
  const lastStatusChangeTime = useRef(Date.now());
  const previousStatus = useRef('new');

  // Retry state
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  
  // Copy state for failure screen
  const [copied, setCopied] = useState(false);

  const { start: fetchTickets } = useFunctionRun({ client, functionName: "customer_panel_list_tickets" });
  const { start: retryTicketCall } = useFunctionRun({ client, functionName: "customer_panel_retry_ticket" });

  const isPolling = useRef(false);

  useEffect(() => {
    if (!ticketId) {
      navigate('/');
      return;
    }

    let interval;
    let timerInterval;

    const pollStatus = async () => {
      // Guard against concurrent requests
      if (isPolling.current) return;
      isPolling.current = true;

      try {
        const res = await fetchTickets({ ticket_id: ticketId });
        const tickets = res?.output_data?.tickets || [];
        
        if (tickets.length > 0) {
          const t = tickets[0];
          const newStatus = t.status?.toLowerCase() || 'new';
          
          // Check for explicit failure
          if (newStatus === 'failed' || t.error_message || res?.output_data?.success === false) {
            setFailReason('The agent encountered an error processing your request.');
            setIsFailed(true);
            return;
          }

          if (newStatus !== previousStatus.current) {
            previousStatus.current = newStatus;
            lastStatusChangeTime.current = Date.now();
            setStatus(newStatus);
          }
          
          if (t.response) {
            setResponseMsg(t.response);
          }

          // Stall detection: Same status for > 45s (and not resolved)
          const timeSinceLastChange = (Date.now() - lastStatusChangeTime.current) / 1000;
          if (newStatus !== 'resolved' && timeSinceLastChange > 45) {
            setFailReason(getFailReasonForStep(newStatus));
            setIsFailed(true);
            return;
          }
          
          // Stop polling if resolved
          if (newStatus === 'resolved') {
            clearInterval(interval);
            clearInterval(timerInterval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        isPolling.current = false;
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 4s
    interval = setInterval(pollStatus, 4000);

    // Track elapsed time & global timeout (120s)
    timerInterval = setInterval(() => {
      setTimeElapsed(prev => {
        const next = prev + 1;
        if (next > 120 && previousStatus.current !== 'resolved') {
          setFailReason('The request timed out before it could finish.');
          setIsFailed(true);
          clearInterval(interval);
          clearInterval(timerInterval);
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [ticketId]); // minimal dependency array: only run on mount or when ticketId changes

  // Determine current step index (0-3) based on status
  const getStepIndex = () => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 3;
      case 'drafted': return 2;
      case 'triaged': return 1;
      case 'new': 
      default: return 0;
    }
  };

  const getFailReasonForStep = (currentStatus) => {
    switch(currentStatus) {
      case 'drafted': return "Something went wrong while drafting the final response.";
      case 'triaged': return "Something went wrong while searching our knowledge base.";
      case 'new': return "Something went wrong while analyzing the category and priority.";
      default: return "An unexpected error interrupted the workflow.";
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError('');
    
    try {
      const res = await retryTicketCall({ ticket_id: ticketId, internal_call: true });
      const data = res?.output_data || {};
      
      if (data.success === false) {
        setRetryError(data.error_message || data.error || 'Retry failed. Please try again later.');
        setIsRetrying(false);
        return;
      }
      
      if (data.workflow_status === 'SKIPPED_RESOLVED') {
        setStatus('resolved');
        setIsFailed(false);
        setIsRetrying(false);
        return;
      }
      
      // Success: Reset state and resume polling
      setIsFailed(false);
      setTimeElapsed(0);
      lastStatusChangeTime.current = Date.now();
      previousStatus.current = status;
      setIsRetrying(false);

    } catch (err) {
      console.error('Retry API error:', err);
      setRetryError('Network error. Please try again.');
      setIsRetrying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIndex = getStepIndex();
  const steps = [
    { title: 'Ticket Received', desc: 'Securely logged in our system' },
    { title: 'Understanding Issue', desc: 'AI is analyzing category and priority' },
    { title: 'Searching Knowledge Base', desc: 'Finding relevant documentation' },
    { title: 'Preparing Response', desc: 'Drafting the best solution' }
  ];

  if (isFailed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-10 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">Processing Stalled</h1>
          <p className="text-amber-500 text-sm font-medium mb-3">{failReason}</p>
          <p className="text-text-secondary text-sm">
            Don't worry — your ticket was saved and nothing is lost. You can try again or check back later.
          </p>
        </div>

        <div className="glass-card p-8 w-full max-w-md shadow-xl border-white/5 relative">
          {/* Ticket ID display */}
          <div className="bg-surface-800/50 rounded-xl border border-glass-border p-4 mb-8 flex items-center justify-between text-left">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Your Ticket ID</p>
              <p className="text-lg font-mono font-bold text-accent-violet select-all">{ticketId}</p>
            </div>
            <button 
              onClick={handleCopy}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-glass-border text-text-secondary hover:text-white flex-shrink-0 ml-4"
              title="Copy ID"
            >
              {copied ? (
                <svg className="w-5 h-5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="text-center">
              <button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="btn-primary w-full py-3"
              >
                {isRetrying ? (
                  <><div className="spinner" /> Retrying...</>
                ) : (
                  'Try Again'
                )}
              </button>
              {retryError && (
                <p className="text-accent-rose text-xs mt-3 animate-fade-in font-medium">{retryError}</p>
              )}
            </div>

            <Link to={`/track?id=${encodeURIComponent(ticketId)}`} className="btn-secondary w-full block py-3">
              Check status later
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

            <Link to={`/track?id=${encodeURIComponent(ticketId)}`} className="btn-primary w-full block py-3.5 text-base">
              View Full Ticket Details
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}
