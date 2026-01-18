import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { KnowledgeGraphConsentScreen } from '../screens/KnowledgeGraphConsentScreen';
import { KnowledgeGraphViewerScreen } from '../screens/KnowledgeGraphViewerScreen';
import { KnowledgeGraphVisualizerScreen } from '../screens/KnowledgeGraphVisualizerScreen';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';
import type { KnowledgeGraphNode } from '../types';

// Corrected duplicate code removed
export default function KnowledgeGraphRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  
  // State
  const [hasConsented, setHasConsented] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     if (hasConsented) {
         fetchGraph();
     }
  }, [hasConsented]);

  const fetchGraph = async () => {
     try {
         setLoading(true);
         const user = await getCurrentUser();
         if (user) {
             const data = await api.get(`/knowledge/graph?userId=${user.id}`);
             if (data.nodes) {
                 // Ensure dates are parsed
                 const parsedNodes = data.nodes.map((n: any) => ({
                     ...n,
                     createdAt: new Date(n.createdAt),
                     expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined 
                 }));
                 setNodes(parsedNodes);
             }
         }
     } catch (e: any) {
         console.error("Failed to fetch graph", e);
         Alert.alert("Graph Error", "Failed to generate your knowledge graph. Please try again later.\n" + (e.message || ""));
     } finally {
         setLoading(false);
     }
  };

  const handleConsent = () => {
    // In a real app, save this to AsyncStorage/Backend
    setHasConsented(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

  const handleClearAll = () => {
    setNodes([]);
  };

  if(!hasConsented) {
      return (
        <View style={styles.container}>
            <KnowledgeGraphConsentScreen
                onAccept={handleConsent}
                onDecline={() => router.back()}
                onBack={() => router.back()}
            />
        </View>
      );
  }

  if (loading) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center'}]}>
             <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      );
  }

  return (
    <View style={styles.container}>
      {showVisualizer ? (
        <KnowledgeGraphVisualizerScreen 
          onBack={() => setShowVisualizer(false)}
          onToggleList={() => setShowVisualizer(false)}
        />
      ) : (
        <KnowledgeGraphViewerScreen
          nodes={nodes}
          onDeleteNode={handleDeleteNode}
          onClearAll={handleClearAll}
          onBack={() => router.back()}
          onVisualize={() => setShowVisualizer(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});