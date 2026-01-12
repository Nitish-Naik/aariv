import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

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
  // Force dark mode styles for this specific screen as it was designed for dark mode
  const styles = getStyles(colors, true);
  
  // Animation for "breathing"
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
      Animated.loop(
          Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
          ])
      ).start();
  }, []);

  // Mock Graph Data with connections
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const nodes = [
      { id: 1, label: 'YOU', type: 'core', x: 180, y: 300 },
      { id: 2, label: 'Product Launch', type: 'project', x: 280, y: 150 },
      { id: 3, label: 'Samika', type: 'person', x: 60, y: 200 },
      { id: 4, label: 'Design Team', type: 'group', x: 100, y: 80 },
      { id: 5, label: 'Q1 Goals', type: 'project', x: 320, y: 380 },
      { id: 6, label: 'Deep Work', type: 'habit', x: 60, y: 400 },
      { id: 7, label: 'Q2 Strategy', type: 'project', x: 200, y: 500 }, // New Node
  ];

  const connections = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 5 },
      { from: 1, to: 6 },
      { from: 1, to: 7 },
      { from: 3, to: 2 }, // Samika works on Launch
      { from: 3, to: 4 }, // Samika in Design Team
      { from: 2, to: 4 }, // Launch needs Design
      { from: 5, to: 7 }, // Goals lead to Strategy
  ];

  const renderNode = (node: any) => {
      const getNodeColor = (type: string) => {
          switch(type) {
              case 'core': return '#FFF';
              case 'project': return colors.semantic.info; // Blue
              case 'person': return colors.semantic.success; // Green
              case 'habit': return colors.semantic.warning; // Orange
              case 'group': return '#A855F7'; // Purple
              default: return colors.textSecondary;
          }
      };
      
      const color = getNodeColor(node.type);
      const isSelected = selectedNode === node.id;
      const isConnected = selectedNode 
        ? connections.some(c => (c.from === selectedNode && c.to === node.id) || (c.from === node.id && c.to === selectedNode)) 
        : false;

      // Opacity Logic: If something is selected, dim others unless they are the node or connected
      const opacity = selectedNode === null || isSelected || isConnected || node.id === selectedNode ? 1 : 0.2;
      const scale = isSelected ? 1.2 : 1;

      return (
          <TouchableOpacity 
            key={node.id}
            activeOpacity={0.8}
            onPress={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
            style={[styles.node, { left: node.x - 50, top: node.y - 20, zIndex: 10 }]} // Centering adjustment
          >
              <Animated.View 
                style={[
                    styles.nodeDot, 
                    { 
                        backgroundColor: color, 
                        opacity: opacity,
                        transform: [{ scale: scale }],
                        // Add subtle breathing to all nodes
                        shadowColor: color,
                        shadowOpacity: pulseAnim, 
                        shadowRadius: 10
                    }
                ]} 
               />
              <Text style={[styles.nodeLabel, { opacity }]}>{node.label}</Text>
          </TouchableOpacity>
      );
  };

  const renderConnections = () => {
      return connections.map((conn, idx) => {
          const start = nodes.find(n => n.id === conn.from);
          const end = nodes.find(n => n.id === conn.to);
          if (!start || !end) return null;

          // Highlight logic
          const isHighlighted = selectedNode === conn.from || selectedNode === conn.to;
          const lineColor = isHighlighted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)';
          const lineThickness = isHighlighted ? 2 : 1;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.navigationRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={'#FFF'} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleList} style={styles.listButton}>
                 <Ionicons name="list" size={24} color={'#FFF'} />
            </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Knowledge Graph</Text>
      </View>

      <View style={styles.graphContainer}>
          {/* <Text style={styles.backgroundText}>CONTEXT LAYER</Text> */}
          
          {/* Render Lines First (Behind nodes) */}
          {renderConnections()}

          {/* Render Nodes */}
          {nodes.map(renderNode)}
      </View>
      
      {/* Information Overlay */}
      <View style={styles.overlay}>
          <View style={styles.overlayHeader}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.overlayTitle}>
                {selectedNode ? `NODE DETAILS: ${nodes.find(n => n.id === selectedNode)?.label}` : 'ACTIVE CONTEXTS'}
            </Text>
          </View>

          {selectedNode ? (
             <View style={styles.nodeDetailContainer}>
                 <Text style={styles.detailText}>
                     Connections: {connections.filter(c => c.from === selectedNode || c.to === selectedNode).length}
                 </Text>
                 <Text style={styles.detailText}>
                     Confidence: 98%
                 </Text>
             </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <View style={[styles.chip, { borderColor: colors.semantic.info }]}>
                    <Text style={[styles.chipText, { color: colors.semantic.info }]}>Project: Launch</Text>
                </View>
                <View style={[styles.chip, { borderColor: colors.semantic.success }]}>
                    <Text style={[styles.chipText, { color: colors.semantic.success }]}>Person: Samika</Text>
                </View>
                <View style={[styles.chip, { borderColor: colors.semantic.warning }]}>
                    <Text style={[styles.chipText, { color: colors.semantic.warning }]}>Mode: Focus</Text>
                </View>
            </ScrollView>
          )}
      </View>

    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Enforce pure black for graph
  },
  header: {
    padding: spacing[4],
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitle: {
      ...typography.textStyles.h2,
      color: '#FFF',
      marginBottom: spacing[2],
  },
  listButton: {
      padding: spacing[1],
  },
  backButton: {
      padding: spacing[2],
  },
  listButton: {
      padding: spacing[2],
  },
  graphContainer: {
      flex: 1,
      position: 'relative',
  },
  backgroundText: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      fontSize: 48,
      fontWeight: '900',
      color: 'rgba(255,255,255,0.03)',
  },
  node: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: 100, // Touch target
      height: 60,
  },
  nodeDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginBottom: 6,
      borderWidth: 2,
      borderColor: '#000', // Stroke for contrast against lines
  },
  nodeLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  overlay: {
      padding: spacing[6],
      backgroundColor: 'rgba(10,10,10,0.95)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
      height: 120,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  overlayTitle: {
      color: '#FFF',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontWeight: '700',
  },
  chipScroll: {
      flexDirection: 'row',
  },
  chip: {
      borderWidth: 1,
      borderRadius: 4, // More technical square look
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginRight: spacing[3],
  },
  chipText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  nodeDetailContainer: {
      flexDirection: 'row',
      gap: spacing[6],
  },
  detailText: {
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Technical font
      fontSize: 12,
  }
});