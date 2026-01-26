// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
//   FlatList
// } from 'react-native';
// import { Card } from "../../components/Card"
// import { PlatformIcon } from "../../components/PlatformIcon"
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useTheme } from '../../context/ThemeContext';
// import { deleteAccount, getCurrentUser, signOut } from '../../services/auth';
// import { borderRadius, spacing, typography } from '../../theme';
// import type { User } from '../../types';
// import { format } from 'date-fns';

// interface TeamUpdate {
//   id: string;
//   platform: string;
//   type: 'message' | 'task' | 'update' | 'mention';
//   title: string;
//   description: string;
//   author: string;
//   timestamp: Date;  
//   unread: boolean;
// }

// const MOCK_UPDATES: TeamUpdate[] = [
//   {
//     id: '1',
//     platform: 'slack',
//     type: 'message' as const,
//     title: 'New message in #engineering',
//     description: 'Sarah: "Just pushed the new calendar feature to staging. Can someone review?"',
//     author: 'Sarah Johnson',
//     timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
//     unread: true,
//   },
//   {
//     id: '2',
//     platform: 'gmail',
//     type: 'mention' as const,
//     title: 'You were mentioned in "Q4 Planning"',
//     description: 'John mentioned you in the quarterly planning email thread',
//     author: 'John Smith',
//     timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
//     unread: true,
//   },
//   {
//     id: '3',
//     platform: 'slack',
//     type: 'task' as const,
//     title: 'New task assigned: Update documentation',
//     description: 'Please update the API documentation for the new endpoints',
//     author: 'Project Manager',
//     timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//     unread: false,
//   },
//   {
//     id: '4',
//     platform: 'google-calendar',
//     type: 'update' as const,
//     title: 'Meeting rescheduled: Sprint Review',
//     description: 'Sprint review has been moved from 2pm to 4pm tomorrow',
//     author: 'Calendar Bot',
//     timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
//     unread: false,
//   },
//   {
//     id: '5',
//     platform: 'github',
//     type: 'message' as const,
//     title: 'New message in #design',
//     description: 'Mike: "Check out the new mockups I just posted!"',
//     author: 'Mike Chen',
//     timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
//     unread: false,
//   },
// ];

// const TeamHubView = ({ onBack }: { onBack: () => void }) => {
//   const [filter, setFilter] = useState<'all' | TeamUpdate['type']>('all');
//   const { colors, isDark } = useTheme();
//   const styles = getTeamHubStyles(colors, isDark);

//   const filteredUpdates =
//     filter === 'all'
//       ? MOCK_UPDATES
//       : MOCK_UPDATES.filter(update => update.type === filter);

//   const renderUpdate = ({ item }: { item: TeamUpdate }) => (
//     <TouchableOpacity onPress={() => console.log('Pressed', item.id)}>
//       <Card style={[styles.updateCard, item.unread && styles.unreadCard]}>
//         <View style={styles.updateHeader}>
//           <PlatformIcon
//             platform={item.platform as any}
//             size={32}
//           />
//           <View style={styles.updateInfo}>
//             <Text style={styles.updateAuthor}>{item.author}</Text>
//             <Text style={styles.updateTime}>
//               {format(item.timestamp, 'MMM d, h:mm a')}
//             </Text>
//           </View>
//           {item.unread && <View style={styles.unreadDot} />}
//         </View>

//         <View
//           style={[
//             styles.typeBadge,
//             {
//               backgroundColor:
//                 item.type === 'message'
//                   ? colors.primary[500] + '20'
//                   : item.type === 'task'
//                     ? colors.semantic.warning + '20'
//                     : item.type === 'update'
//                       ? colors.semantic.info + '20'
//                       : colors.semantic.error + '20',
//             },
//           ]}
//         >
//           <Text
//             style={[
//               styles.typeText,
//               {
//                 color:
//                   item.type === 'message'
//                     ? colors.primary[700]
//                     : item.type === 'task'
//                       ? colors.semantic.warning
//                       : item.type === 'update'
//                         ? colors.semantic.info
//                         : colors.semantic.error,
//               },
//             ]}
//           >
//             {item.type.toUpperCase()}
//           </Text>
//         </View>

//         <Text style={styles.updateTitle}>{item.title}</Text>
//         <Text style={styles.updateDescription} numberOfLines={2}>
//           {item.description}
//         </Text>
//       </Card>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={onBack} style={styles.backButton}>
//           <Text style={styles.backButtonText}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.title}>Team Hub</Text>
//       </View>

//       <View style={styles.filters}>
//         <TouchableOpacity
//           style={[
//             styles.filterButton,
//             filter === 'all' && styles.filterButtonActive,
//           ]}
//           onPress={() => setFilter('all')}
//         >
//           <Text
//             style={[
//               styles.filterText,
//               filter === 'all' && styles.filterTextActive,
//             ]}
//           >
//             All
//           </Text>
//         </TouchableOpacity>
//         {(['message', 'task', 'update', 'mention'] as const).map((type) => (
//           <TouchableOpacity
//             key={type}
//             style={[
//               styles.filterButton,
//               filter === type && styles.filterButtonActive,
//             ]}
//             onPress={() => setFilter(type)}
//           >
//             <Text
//               style={[
//                 styles.filterText,
//                 filter === type && styles.filterTextActive,
//               ]}
//             >
//               {type.charAt(0).toUpperCase() + type.slice(1)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <FlatList
//         data={filteredUpdates}
//         renderItem={renderUpdate}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.list}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No team updates</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// export default function SettingsScreen() {
//   const router = useRouter();
//   const { colors, isDark, toggleTheme } = useTheme();

//   // State
//   const [user, setUser] = useState<User | null>(null);
//   const [operatingMode, setOperatingMode] = useState<'passive' | 'executive'>('passive');
//   const [notifications, setNotifications] = useState(true);
//   const [showTeamHub, setShowTeamHub] = useState(false);

//   const styles = getStyles(colors, isDark);

//   useEffect(() => {
//     loadUser();
//   }, []);

//   const loadUser = async () => {
//     const currentUser = await getCurrentUser();
//     setUser(currentUser);
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       "Sever Neural Link?",
//       "Disconnecting will pause all active context monitoring.",
//       [
//         { text: "Stay Connected", style: "cancel" },
//         {
//           text: "Disconnect",
//           style: "destructive",
//           onPress: async () => {
//             await signOut();
//             router.replace('/login');
//           }
//         }
//       ]
//     );
//   };

//   const handleDeleteAccount = () => {
//     Alert.alert(
//       "Delete Account?",
//       "This action is irreversible. All your data and connections will be wiped.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete Forever",
//           style: "destructive",
//           onPress: async () => {
//             if (!user) return;
//             try {
//               await deleteAccount(user.id);
//               router.replace('/login');
//             } catch (e: any) {
//               Alert.alert("Error", "Failed to delete account: " + e.message);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const renderModeCard = (mode: 'passive' | 'executive', title: string, desc: string, icon: string) => {
//     const isActive = operatingMode === mode;
//     return (
//       <TouchableOpacity
//         style={[styles.modeCard, isActive && styles.modeCardActive]}
//         onPress={() => setOperatingMode(mode)}
//       >
//         <View style={styles.modeHeader}>
//           <Ionicons
//             name={icon as any}
//             size={24}
//             color={isActive ? '#FFF' : colors.textSecondary}
//           />
//           <Text style={[styles.modeTitle, isActive && styles.modeTitleActive]}>{title}</Text>
//           {isActive && <View style={styles.pixelTag}><Text style={styles.pixelText}>ACTIVE</Text></View>}
//         </View>
//         <Text style={[styles.modeDesc, isActive && styles.modeDescActive]}>
//           {desc}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   if (showTeamHub) {
//     return <TeamHubView onBack={() => setShowTeamHub(false)} />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.greeting}>Protocols</Text>
//           <Text style={styles.briefing}>
//             Configure <Text style={styles.highlight}>neural weights</Text> and integration permissions.
//           </Text>
//         </View>
//         <TouchableOpacity style={styles.profileBtn} onPress={handleLogout}>
//           {user ? (
//             <View style={styles.avatarBadge}>
//               <Text style={styles.avatarText}>
//                 {user.name
//                   ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
//                   : 'ID'}
//               </Text>
//               <View style={styles.statusDot} />
//             </View>
//           ) : (
//             <Ionicons name="person-circle" size={36} color={colors.textSecondary} />
//           )}
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>


//         {/* NEURAL ACCESS */}
//         <Text style={styles.sectionLabel}>NEURAL ACCESS</Text>
//         <View style={styles.card}>
//           <TouchableOpacity style={styles.row} onPress={async () => {
//             // Check if user has granted consent
//             const { hasKGConsent } = await import('../../utils/kgConsent');
//             const hasConsent = await hasKGConsent();

//             if (hasConsent) {
//               router.push('/knowledge-graph');
//             } else {
//               // Show consent screen first
//               router.push('/kg-consent');
//             }
//           }}>
//             <View style={styles.rowIcon}>
//               <Ionicons name="git-network" size={20} color={colors.primary[500]} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.rowTitle}>Knowledge Graph</Text>
//               <Text style={styles.rowSubtitle}>View mapped relationships & context</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
//           </TouchableOpacity>

//           <View style={styles.divider} />

//           <TouchableOpacity style={styles.row} onPress={() => router.push('/toolkits')}>
//             <View style={styles.rowIcon}>
//               <Ionicons name="extension-puzzle" size={20} color={colors.primary[500]} />
//             </View>
//             <View style={{ flex: 1 }}>
//               {/* <Text style={styles.rowTitle}>Toolkit Capacity</Text> */}
//               <Text style={styles.rowTitle}>Neural Marketplace</Text>
//               <Text style={styles.rowSubtitle}>Manage integrations & capabilities</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
//           </TouchableOpacity>

//           <View style={styles.divider} />

//           {/* PREVIEW-ONLY: Team Hub */}
//           <TouchableOpacity style={styles.row} onPress={() => setShowTeamHub(true)}>
//             <View style={styles.rowIcon}>
//               <Ionicons name="people" size={20} color={colors.primary[500]} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.rowTitle}>Team Hub</Text>
//               <Text style={styles.rowSubtitle}>Preview: Team collaboration feed</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
//           </TouchableOpacity>

//           <View style={styles.divider} />

//           {/* PREVIEW-ONLY: Execution Status */}
//           <TouchableOpacity style={styles.row} onPress={() => router.push('/execution-status')}>
//             <View style={styles.rowIcon}>
//               <Ionicons name="checkmark-done" size={20} color={colors.primary[500]} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.rowTitle}>Execution Status</Text>
//               <Text style={styles.rowSubtitle}>Preview: Action tracking screen</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
//           </TouchableOpacity>
//         </View>

//         {/* CONFIGURATION */}
//         <Text style={styles.sectionLabel}>CONFIGURATION</Text>
//         <View style={styles.card}>
//           <TouchableOpacity style={styles.row} onPress={() => router.push('/connect-platforms')}>
//             <Text style={styles.rowTitle}>Connected Apps</Text>
//             <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
//           </TouchableOpacity>
//         </View>

//         {/* SYSTEM PREFS */}
//         <Text style={styles.sectionLabel}>SYSTEM PREFS</Text>
//         <View style={styles.card}>
//           <View style={styles.row}>
//             <Text style={styles.rowTitle}>Notifications</Text>
//             <Switch
//               value={notifications}
//               onValueChange={setNotifications}
//               trackColor={{ true: colors.primary[500], false: colors.neutral[700] }}
//             />
//           </View>
//           <View style={styles.divider} />
//           <View style={styles.row}>
//             <Text style={styles.rowTitle}>Dark Mode</Text>
//             <Switch
//               value={isDark}
//               onValueChange={toggleTheme}
//               trackColor={{ true: colors.primary[500], false: colors.neutral[700] }}
//             />
//           </View>
//         </View>

//         {/* DANGER ZONE */}
//         <Text style={[styles.sectionLabel, { color: colors.semantic.error, marginTop: spacing[6] }]}>DANGER ZONE</Text>
//         <View style={[styles.card, { borderColor: colors.semantic.error, borderWidth: 1 }]}>
//           <TouchableOpacity style={styles.row} onPress={handleLogout}>
//             <Ionicons name="log-out-outline" size={20} color={colors.semantic.error} />
//             <Text style={[styles.rowTitle, { color: colors.semantic.error }]}>Sign Out</Text>
//           </TouchableOpacity>

//           <View style={styles.divider} />

//           <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
//             <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
//             <Text style={[styles.rowTitle, { color: colors.semantic.error }]}>Delete Account</Text>
//           </TouchableOpacity>
//         </View>

//       </ScrollView>
//     </SafeAreaView >
//   );
// }

// const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     paddingHorizontal: spacing[6],
//     marginBottom: spacing[6],
//     paddingTop: spacing[8], // Matches Home Tab alignment
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     gap: spacing[4],
//     backgroundColor: colors.background,
//   },
//   greeting: {
//     ...typography.textStyles.h2,
//     color: colors.text,
//     marginBottom: spacing[2],
//   },
//   briefing: {
//     ...typography.textStyles.body,
//     fontSize: 16,
//     color: colors.textSecondary,
//     lineHeight: 24,
//   },
//   highlight: {
//     color: colors.primary[500],
//     fontWeight: '600',
//   },
//   profileBtn: {
//     // opacity: 0.8
//   },
//   avatarBadge: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: colors.primary[500],
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   avatarText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#FFF',
//   },
//   statusDot: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#22C55E', // Green-500
//     borderWidth: 2,
//     borderColor: colors.background,
//   },
//   scrollContent: {
//     padding: spacing[4],
//     gap: spacing[6],
//     paddingBottom: 100
//   },
//   sectionLabel: {
//     ...typography.textStyles.caption,
//     color: colors.textTertiary,
//     marginLeft: 4,
//     marginBottom: -8, // pull closer to card
//   },
//   // Mode Cards
//   modeContainer: {
//     gap: 12,
//   },
//   modeCard: {
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: colors.surface,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   modeCardActive: {
//     backgroundColor: colors.primary[500],
//     borderColor: colors.primary[500],
//   },
//   modeHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 8
//   },
//   modeTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: colors.text,
//     flex: 1,
//   },
//   modeTitleActive: {
//     color: '#FFF',
//   },
//   modeDesc: {
//     fontSize: 13,
//     color: colors.textSecondary,
//     lineHeight: 20,
//   },
//   modeDescActive: {
//     color: 'rgba(255,255,255,0.8)'
//   },
//   pixelTag: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   pixelText: {
//     fontSize: 10,
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
//   // Standard Cards
//   card: {
//     backgroundColor: colors.surface,
//     borderRadius: 16,
//     paddingVertical: 8,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: spacing[4],
//     gap: spacing[3],
//     minHeight: 44, // Ensure touch target size
//   },
//   rowIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 8,
//     backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   rowTitle: {
//     fontSize: 16,
//     color: colors.text,
//     flex: 1,
//   },
//   rowSubtitle: {
//     fontSize: 12,
//     color: colors.textTertiary,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: colors.border,
//     marginLeft: 60, // Fixed: Align with text (32 icon + 12 gap + 16 padding)
//   },
//   // Sub Card
//   subCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: spacing[5],
//     backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
//     borderRadius: borderRadius.xl,
//   },
//   subTitle: {
//     fontWeight: 'bold',
//     color: colors.text,
//   },
//   subDesc: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: 2, // Fixed: spacing[0.5] invalid
//   },
//   subAction: {
//     fontWeight: 'bold',
//     color: colors.primary[500],
//   },
// });

// const getTeamHubStyles = (colors: any, isDark: boolean) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     padding: spacing[4],
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: spacing[8],
//   },
//   backButton: {
//     marginRight: spacing[3],
//   },
//   backButtonText: {
//     ...typography.textStyles.body,
//     color: colors.primary[500],
//   },
//   title: {
//     ...typography.textStyles.h2,
//     color: colors.text,
//   },
//   filters: {
//     flexDirection: 'row',
//     padding: spacing[4],
//     gap: spacing[2],
//   },
//   filterButton: {
//     paddingHorizontal: spacing[3],
//     paddingVertical: spacing[2],
//     borderRadius: 8,
//     backgroundColor: colors.surface,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   filterButtonActive: {
//     backgroundColor: colors.primary[500],
//     borderColor: colors.primary[500],
//   },
//   filterText: {
//     ...typography.textStyles.bodySmall,
//     color: colors.textSecondary,
//   },
//   filterTextActive: {
//     color: '#FFFFFF',
//     fontWeight: typography.fontWeight.semibold,
//   },
//   list: {
//     padding: spacing[4],
//     paddingBottom: 120,
//   },
//   updateCard: {
//     marginBottom: spacing[3],
//   },
//   unreadCard: {
//     borderLeftWidth: 3,
//     borderLeftColor: colors.primary[500],
//   },
//   updateHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: spacing[3],
//   },
//   updateInfo: {
//     flex: 1,
//     marginLeft: spacing[3],
//   },
//   updateAuthor: {
//     ...typography.textStyles.body,
//     color: colors.text,
//     fontWeight: typography.fontWeight.semibold,
//   },
//   updateTime: {
//     ...typography.textStyles.caption,
//     color: colors.textSecondary,
//   },
//   unreadDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: colors.primary[500],
//   },
//   typeBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: spacing[2],
//     paddingVertical: spacing[1],
//     borderRadius: 4,
//     marginBottom: spacing[2],
//   },
//   typeText: {
//     ...typography.textStyles.caption,
//     fontWeight: typography.fontWeight.semibold,
//   },
//   updateTitle: {
//     ...typography.textStyles.body,
//     color: colors.text,
//     fontWeight: typography.fontWeight.semibold,
//     marginBottom: spacing[1],
//   },
//   updateDescription: {
//     ...typography.textStyles.bodySmall,
//     color: colors.textSecondary,
//   },
//   emptyContainer: {
//     padding: spacing[8],
//     alignItems: 'center',
//   },
//   emptyText: {
//     ...typography.textStyles.body,
//     color: colors.textTertiary,
//   },
// });


