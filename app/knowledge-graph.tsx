import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KnowledgeGraphConsentScreen } from '../screens/KnowledgeGraphConsentScreen';
import { KnowledgeGraphViewerScreen } from '../screens/KnowledgeGraphViewerScreen';
import { KnowledgeGraphVisualizerScreen } from '../screens/KnowledgeGraphVisualizerScreen';
import type { KnowledgeGraphNode } from '../types';

// Mock Data for the Knowledge Graph
const MOCK_NODES: KnowledgeGraphNode[] = [
  {
    id: '1',
    type: 'pattern',
    label: 'Morning Deep Work',
    description: 'User consistently blocks 9am-11am for focused work without meetings.',
    createdAt: new Date('2025-12-01'),
    expiresAt: new Date('2026-03-01'),
    connections: ['2', '4'],
  },
  {
    id: '2',
    type: 'preference',
    label: 'No Friday Meetings',
    description: 'User rejects meeting invites scheduled for Friday afternoons.',
    createdAt: new Date('2025-11-15'),
    expiresAt: new Date('2026-05-15'),
    connections: ['1'],
  },
  {
    id: '3',
    type: 'ritual',
    label: 'Weekly Team Sync',
    description: 'Recurring Standup every Monday at 10am.',
    createdAt: new Date('2025-10-01'),
    expiresAt: new Date('2026-10-01'),
    connections: [],
  },
  {
    id: '4',
    type: 'cadence',
    label: 'Quick Response Time',
    description: 'User typically replies to emails within 5 minutes during working hours.',
    createdAt: new Date('2026-01-05'),
    expiresAt: new Date('2026-02-05'),
    connections: ['1', '3'],
  },
  {
    id: '5',
    type: 'preference',
    label: 'Zoom over Meet',
    description: 'User prefers Zoom links for external client calls.',
    createdAt: new Date('2026-01-10'),
    expiresAt: new Date('2026-07-10'),
    connections: [],
  },
];

export default function KnowledgeGraphRoute() {
  const router = useRouter();
  
  // State to manage consent and nodes
  // In a real app, 'hasConsented' would be stored in AsyncStorage or backend
  const [hasConsented, setHasConsented] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>(MOCK_NODES);

  const handleAccept = () => {
    setHasConsented(true);
  };

  const handleDecline = () => {
    router.back();
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

  const handleClearAll = () => {
    setNodes([]);
  };

  if (!hasConsented) {
    return (
      <KnowledgeGraphConsentScreen
        onAccept={handleAccept}
        onDecline={handleDecline}
        onBack={() => router.back()}
      />
    );
  }

  if (viewMode === 'graph') {
      return (
          <KnowledgeGraphVisualizerScreen 
            onBack={() => setViewMode('list')}
            onToggleList={() => setViewMode('list')}
          />
      );
  }

  return (
    <KnowledgeGraphViewerScreen
      nodes={nodes}
      onDeleteNode={handleDeleteNode}
      onClearAll={handleClearAll}
      onBack={() => router.back()}
      onVisualize={() => setViewMode('graph')}
    />
  );
}
