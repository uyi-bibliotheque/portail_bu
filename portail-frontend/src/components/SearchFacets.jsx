// components/SearchFacets.jsx - Nouveau composant
import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export default function SearchFacets({ facets, onFacetChange, activeFacets }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFacetClick = (facetKey, value) => {
    onFacetChange(facetKey, value);
  };

  const removeFacet = (facetKey) => {
    onFacetChange(facetKey, null);
  };

  if (!facets || Object.keys(facets).length === 0) {
    return null;
  }

  const facetLabels = {
    faculty: 'Faculté',
    type: 'Type de document',
    language: 'Langue',
    availability: 'Disponibilité',
    year: 'Année'
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ fontWeight: 700, fontSize: 14 }}>Filtres</h4>
        {Object.keys(activeFacets).length > 0 && (
          <button
            onClick={() => onFacetChange('all', null)}
            style={{ fontSize: 12, color: 'var(--or)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Active facets */}
      {Object.entries(activeFacets).map(([key, value]) => value && (
        <div key={key} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'rgba(27,20,100,0.06)',
          borderRadius: 50,
          margin: '0 4px 8px 0',
          fontSize: 12
        }}>
          <span>{facetLabels[key] || key}: {value}</span>
          <button
            onClick={() => removeFacet(key)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={12} color="var(--texte-muted)" />
          </button>
        </div>
      ))}

      {Object.entries(facets).map(([key, values]) => {
        if (!values || values.length === 0) return null;
        const isExpanded = expanded[key] !== false;

        return (
          <div key={key} style={{ marginBottom: 12 }}>
            <button
              onClick={() => toggleExpand(key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--texte)'
              }}
            >
              {facetLabels[key] || key}
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {values.slice(0, 10).map((item) => (
                  <label
                    key={item.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13,
                      background: activeFacets[key] === item.value ? 'rgba(27,20,100,0.05)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (activeFacets[key] !== item.value) {
                        e.currentTarget.style.background = 'var(--beige)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (activeFacets[key] !== item.value) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activeFacets[key] === item.value}
                      onChange={() => handleFacetClick(key, item.value)}
                      style={{ accentColor: 'var(--or)' }}
                    />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--texte-muted)' }}>({item.count})</span>
                  </label>
                ))}
                {values.length > 10 && (
                  <div style={{ fontSize: 12, color: 'var(--texte-muted)', padding: '4px 8px' }}>
                    +{values.length - 10} autres
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}