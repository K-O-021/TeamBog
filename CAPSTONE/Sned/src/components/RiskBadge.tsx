import React from 'react';

const riskStyles = {
  Low: 'status-low',
  Moderate: 'status-moderate',
  High: 'status-high',
};

const RiskBadge: React.FC<{ level: 'Low' | 'Moderate' | 'High' }> = ({ level }) => (
  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${riskStyles[level]}`}>
    {level}
  </span>
);

export default RiskBadge;
