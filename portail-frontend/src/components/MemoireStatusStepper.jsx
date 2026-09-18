// components/MemoireStatusStepper.jsx
import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'incomplet', label: 'Dépôt initié', icon: <FileText size={16} /> },
  { key: 'en_attente', label: 'En validation', icon: <Clock size={16} /> },
  { key: 'valide', label: 'Validé', icon: <CheckCircle size={16} /> },
  { key: 'quitus_genere', label: 'Quitus généré', icon: <FileText size={16} /> },
  { key: 'quitus_signe', label: 'Quitus signé', icon: <CheckCircle size={16} /> },
];

const STATUS_COLORS = {
  incomplet: '#94a3b8',
  en_attente: '#F59E0B',
  valide: '#10B981',
  quitus_genere: '#3b82f6',
  quitus_signe: '#10B981',
  rejete: '#ef4444',
};

const STATUS_LABELS = {
  incomplet: 'Incomplet',
  en_attente: 'En attente de validation',
  valide: 'Validé',
  quitus_genere: 'Quitus généré',
  quitus_signe: 'Quitus signé',
  rejete: 'Rejeté',
};

export default function MemoireStatusStepper({ status, rejectionReason }) {
  if (status === 'rejete') {
    return (
      <div style={{
        padding: '16px 20px',
        background: 'var(--red-bg)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <XCircle size={20} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: 14 }}>Dossier rejeté</div>
          {rejectionReason && (
            <div style={{ fontSize: 13, color: '#b91c1c', marginTop: 4 }}>{rejectionReason}</div>
          )}
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === status);
  const isComplete = status === 'quitus_signe';

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0 8px'
      }}>
        {/* Ligne de progression */}
        <div style={{
          position: 'absolute',
          top: 18,
          left: 30,
          right: 30,
          height: 2,
          background: '#e2e8f0',
          zIndex: 0
        }}>
          <div style={{
            width: `${isComplete ? 100 : (currentStepIndex / (STEPS.length - 1)) * 100}%`,
            height: '100%',
            background: 'var(--or)',
            transition: 'width 0.5s ease'
          }} />
        </div>

        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const color = isActive ? 'var(--or)' : '#94a3b8';

          return (
            <div key={step.key} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isActive ? 'var(--or)' : 'white',
                border: `2px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'white' : '#94a3b8',
                transition: 'all 0.3s'
              }}>
                {isActive && index < currentStepIndex ? <CheckCircle size={16} /> : step.icon}
              </div>
              <div style={{
                fontSize: 10,
                color: isActive ? 'var(--texte)' : 'var(--texte-light)',
                fontWeight: isActive ? 600 : 400,
                marginTop: 8,
                textAlign: 'center',
                maxWidth: 80
              }}>
                {step.label}
              </div>
              {isCurrent && (
                <div style={{
                  marginTop: 4,
                  fontSize: 10,
                  color: 'var(--or)',
                  fontWeight: 600
                }}>
                  En cours
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 20,
        padding: '12px 16px',
        background: 'var(--beige)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <span style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
          Statut actuel : <strong style={{ color: STATUS_COLORS[status] }}>
            {STATUS_LABELS[status]}
          </strong>
        </span>
        {isComplete && (
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
            ✅ Processus terminé
          </span>
        )}
      </div>
    </div>
  );
}