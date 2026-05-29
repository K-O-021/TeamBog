import React from 'react';

const typeStyles = {
  Positive: 'status-positive',
  'Attention Needed': 'status-attention',
  Concerning: 'status-concerning',
};

interface BehaviorBadgeProps {
  type: 'Positive' | 'Attention Needed' | 'Concerning';
  confidence?: number;
}

const BehaviorBadge: React.FC<BehaviorBadgeProps> = ({ type, confidence }) => {
  const isHighConfidence = confidence !== undefined && confidence > 0.95;

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-500 ${typeStyles[type]} ${
      isHighConfidence ? 'animate-pulse shadow-[0_0_8px_currentColor] ring-1 ring-current ring-opacity-20' : ''
    }`}>
      {type}
    </span>
  );
};

export default BehaviorBadge;
