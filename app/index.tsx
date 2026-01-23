import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  // The AuthContext in _layout.tsx handles the redirection logic globally.
  // This component just needs to render a loading state while the check happens.
  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
  );
}
