import { useState, useEffect, useRef, useCallback } from 'react';
import { useFunctionRun } from "lemma-sdk/react";
import client from "../api/client";

/**
 * SearchBar — debounced knowledge base search with inline results.
 * Queries the doc search endpoint as the user types (400ms debounce).
 */
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  
  const { start: searchDocs } = useFunctionRun({ client, functionName: "customer_panel_search_docs" });

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await searchDocs({ query: searchQuery });
      console.log('Search raw output_data:', response?.output_data);
      
      const docsArray = response?.output_data?.snippets 
        || response?.output_data?.results 
        || response?.output_data?.docs 
        || [];
        
      setResults(docsArray);
      setIsOpen(docsArray.length > 0);
    } catch (err) {
      console.error('Doc search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => performSearch(query), 400);
    return () => clearTimeout(timerRef.current);
  }, [query, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full mb-8">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search our knowledge base before submitting..."
          className="form-input pl-12 pr-12"
          id="search-docs"
        />

        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="spinner" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass-card p-2 max-h-80 overflow-y-auto animate-fade-in">
          <p className="px-3 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
            Found {results.length} result{results.length !== 1 ? 's' : ''} — check if your question is answered:
          </p>
          <div className="space-y-1 mt-1">
            {results.map((result, index) => (
              <a
                key={result.id || index}
                href={result.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <h4 className="text-sm font-medium text-text-primary group-hover:text-accent-violet transition-colors">
                  {result.title || result.name || 'Untitled'}
                </h4>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                  {result.snippet || result.description || result.content || ''}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
