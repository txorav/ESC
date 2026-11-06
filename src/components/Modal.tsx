import React from 'react';
import type { ModalContent } from '../types';

interface ModalProps {
  content: ModalContent | null;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{content.title}</h3>
          <p>{content.subtitle}</p>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div
          className="modal-body"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  );
};
