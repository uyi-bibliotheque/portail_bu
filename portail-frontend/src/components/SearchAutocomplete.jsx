// components/SearchAutocomplete.jsx - Nouveau composant
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import { getSearchSuggestions } from '../services/endpoints';

export default function SearchAutocomplete({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Rechercher...",
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getSearchSuggestions(value);
        if (response.data?.suggestions) {
          setSuggestions(response.data.suggestions);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Erreur suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        const selected = suggestions[highlightedIndex];
        onChange(selected.title);
        onSearch(selected.title);
        setIsOpen(false);
      } else {
        onSearch(value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.title);
    onSearch(suggestion.title);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`search-autocomplete ${className}`} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Search size={18} color="var(--texte-muted)" style={{ position: 'absolute', left: 12, zIndex: 1 }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 16px 10px 40px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: 14,
            background: 'white',
            transition: 'all 0.2s'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--or)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        {loading && (
          <Loader2 size={16} className="spin" style={{ position: 'absolute', right: 12 }} />
        )}
        {value && !loading && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--texte-muted)',
              padding: 4
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: 300,
          overflowY: 'auto',
          zIndex: 100
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: highlightedIndex === index ? 'var(--beige)' : 'transparent',
                transition: 'background 0.15s',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none'
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div style={{ fontWeight: 500 }}>{suggestion.title}</div>
              <div style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
                {suggestion.authors?.join(', ') || 'Auteur inconnu'}
                {suggestion.doc_type && (
                  <span style={{ marginLeft: 8, padding: '2px 8px', background: 'var(--beige)', borderRadius: 4, fontSize: 10 }}>
                    {suggestion.doc_type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .search-autocomplete {
          width: 100%;
        }
        .search-autocomplete .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}