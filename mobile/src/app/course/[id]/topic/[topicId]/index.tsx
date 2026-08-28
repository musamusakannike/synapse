import { useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TopicContentScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();

  useEffect(() => {
    if (id && topicId) {
      router.replace(`/course/${id}/topic/${topicId}/learn` as any);
    }
  }, [id, topicId]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </View>
  );
}
