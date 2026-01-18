import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';
import { spacing } from '../theme';

// Helper to draw lines between two points using simple Views
const ConnectionLine = ({ start, end, color = 'rgba(255,255,255,0.1)' }: any) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Midpoint to center the rotated line
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;

    return (
        <View
            style={{
                position: 'absolute',
                backgroundColor: color,
                height: 1,
                width: length,
                left: cx - length / 2, // Center the line horizontally on the midpoint
                top: cy, // Center vertically
                transform: [{ rotate: `${angle}deg` }],
            }}
        />
    );
};

interface KnowledgeGraphVisualizerScreenProps {
    onBack: () => void;
    onToggleList: () => void;
}

export const KnowledgeGraphVisualizerScreen: React.FC<KnowledgeGraphVisualizerScreenProps> = ({ onBack, onToggleList }) => {
  const { colors, isDark } = useTheme();
  
  // Real Data State
  const [nodes, setNodes] = useState<any[]>([]);
  const [graphConnections, setGraphConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Animation
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
          Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
          ])
      ).start();
      
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    try {
        const user = await getCurrentUser();
        if(!user) return;
        
        const data = await api.get(`/knowledge/graph?userId=${user.id}`);
        
        if (data.nodes) {
            processGraphData(data.nodes);
        } else {
            // Fallback empty
            processGraphData([]);
        }
    } catch (e) {
        console.error("Failed to fetch graph", e);
    } finally {
        setLoading(false);
    }
  };

  const processGraphData = (apiNodes: any[]) => {
      // 1. Create Layout: Center Node (You)
      // Hardcoded center based on approximate screen
      const centerX = 180; 
      const centerY = 300;
      
      const visualNodes = [
          { id: 'core_you', label: 'YOU', type: 'core', x: centerX, y: centerY, description: 'Digital Twin Center' }
      ];

      // 2. Distribute others in a circle
      // If we have many nodes, we might need multiple rings, but single ring is fine for MVP
      const radius = 130;
      const angleStep = apiNodes.length > 0 ? (2 * Math.PI) / apiNodes.length : 0;

      apiNodes.forEach((node, index) => {
          const angle = index * angleStep;
          visualNodes.push({
              id: node.id || `node_${index}`,
              label: node.label,
              type: node.type || 'pattern', 
              description: node.description,
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle)
          });
      });

      // 3. Create Connections: Star topology (Everyone connects to YOU)
      // We could also parse 'connections' from API if they exist
      const visualConnections = apiNodes.map((node, index) => ({
           from: 'core_you',
           to: node.id || `node_${index}`
      }));

      setNodes(visualNodes);
      setGraphConnections(visualConnections);
  };

  const renderNode = (node: any) => {
      const getNodeColor = (type: string) => {
          switch(type) {
              case 'core': return '#FFFFFF';
              case 'pattern': return '#60A5FA'; // Blue
              case 'preference': return '#34D399'; // Green
              case 'habit': return '#FBBF24'; // Yellow
              case 'ritual': return '#F472B6'; // Pink
              default: return colors.textSecondary;
          }
      };
      
      const color = getNodeColor(node.type);
      const isSelected = selectedNode?.id === node.id;
      
      // Determine if connected to selection
      const isConnected = selectedNode 
        ? graphConnections.some(c => (c.from === selectedNode.id && c.to === node.id) || (c.from === node.id && c.to === selectedNode.id)) 
        : false;

      // Opacity Logic
      const opacity = selectedNode === null || isSelected || isConnected || node.id === selectedNode?.id ? 1 : 0.2;
      const scale = isSelected ? 1.3 : 1;

      return (
          <TouchableOpacity 
            key={node.id}
            activeOpacity={0.9}
            onPress={() => setSelectedNode(node.id === selectedNode?.id ? null : node)}
            style={{
                position: 'absolute',
                left: node.x - 50, // Center based on width=100
                top: node.y - 30, // Center based on height=60
                width: 100,
                height: 60,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isSelected ? 20 : 10 
            }}
          >
              <Animated.View 
                style={{
                    width: isSelected ? 24 : 16,
                    height: isSelected ? 24 : 16,
                    borderRadius: 12,
                    backgroundColor: color,
                    marginBottom: 8,
                    opacity: opacity,
                    transform: [{ scale: scale }],
                    shadowColor: color,
                    shadowOpacity: pulseAnim, 
                    shadowRadius: 10
                }} 
               />
              <Text style={{
                  color: '#FFF',
                  fontSize: 11,
                  fontWeight: '600',
                  textAlign: 'center',
                  opacity: opacity,
                  textShadowColor: 'rgba(0,0,0,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
              }}>{node.label}</Text>
          </TouchableOpacity>
      );
  };

  const renderConnections = () => {
      return graphConnections.map((conn, idx) => {
          const start = nodes.find(n => n.id === conn.from);
          const end = nodes.find(n => n.id === conn.to);
          if (!start || !end) return null;

          // Highlight logic
          const isHighlighted = selectedNode?.id === conn.from || selectedNode?.id === conn.to;
          const lineColor = isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)';

          return (
              <ConnectionLine 
                key={`conn-${idx}`} 
                start={start} 
                end={end} 
                color={lineColor}
              />
          );
      });
  };

  const styles = getStyles(colors, true); // Force dark theme for graph

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.navigationRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={'#FFF'} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Knowledge Graph</Text>
        <Text style={styles.subtitle}>
            {loading ? 'Analyzing Digital Footprint...' : `${nodes.length - 1} insight nodes detected`}
        </Text>
      </View>

      <View style={styles.graphContainer}>
          {/* Render Connections */}
          {!loading && renderConnections()}

          {/* Render Nodes */}
          {loading ? (
              <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 200 }} />
          ) : (
              nodes.map(renderNode)
          )}
      </View>
      
      {/* Information Overlay */}
      {selectedNode && (
      <View style={styles.overlay}>
          <View style={styles.overlayHeader}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.overlayTitle}>
                {selectedNode.type === 'core' ? 'DIGITAL TWIN' : selectedNode.label.toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => setSelectedNode(null)}>
                <Ionicons name="close" size={20} color={'#FFF'} />
            </TouchableOpacity>
          </View>

          <View style={styles.nodeDetailContainer}>
                 <Text style={[styles.detailText, { fontWeight: '700', marginBottom: 4, color: colors.primary[500] }]}>
                     TYPE: {selectedNode.type?.toUpperCase()}
                 </Text>
                 <Text style={styles.detailText}>
                     {selectedNode.description || "No analysis available."}
                 </Text>
          </View>
      </View>
      )}

    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', 
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: '300',
      color: '#FFFFFF',
      letterSpacing: 1,
  },
  subtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  graphContainer: {
      flex: 1,
      position: 'relative',
  },
  overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#111',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: spacing[6],
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10, 
  },
  overlayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
  },
  overlayTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFF',
      letterSpacing: 1,
      marginLeft: 8,
      flex: 1,
  },
  nodeDetailContainer: {
      gap: 4,
  },
  detailText: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      lineHeight: 22,
  }
});
