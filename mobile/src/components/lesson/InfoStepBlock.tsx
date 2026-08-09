import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { TopicContent } from '@/lib/types';
import LatexRenderer from '@/components/ui/LatexRenderer';
import CodeRenderer from '@/components/ui/CodeRenderer';
import YouTubePlayer from '@/components/ui/YouTubePlayer';

export default function InfoStepBlock({ content }: { content: TopicContent }) {
  const { colors } = useTheme();

  switch (content.type) {
    case 'latex':
      return <LatexRenderer expression={content.content} />;
    case 'code':
      return <CodeRenderer code={content.content} language={content.language} />;
    case 'youtube':
    case 'video':
      return <YouTubePlayer source={content.content} />;
    case 'image':
      return <Image source={{ uri: content.content }} style={styles.image} resizeMode="cover" />;
    case 'audio':
      return (
        <View style={[styles.textBlock, { backgroundColor: colors.surfaceSunken }]}>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Audio: {content.content}</Text>
        </View>
      );
    case 'group':
      return (
        <View style={[styles.groupWrap, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
          {!!content.content && (
            <Text style={[styles.groupTitle, { color: colors.textPrimary }]}>{content.content}</Text>
          )}
          {(content.blocks || []).map((subBlock, bIdx) => (
            <InfoStepBlock key={bIdx} content={subBlock} />
          ))}
        </View>
      );
    case 'text':
    default:
      return (
        <View style={styles.textBlock}>
          <Text style={[styles.paragraph, { color: colors.textPrimary }]}>{content.content}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  textBlock: { paddingVertical: spacing.xs },
  paragraph: { fontSize: fontSizes.base, fontFamily: fontFamilies.sans, lineHeight: fontSizes.base * 1.65 },
  image: { width: '100%', height: 200, borderRadius: radii.md },
  groupWrap: { padding: spacing.md, borderRadius: radii.md, borderWidth: 1, gap: spacing.sm, marginVertical: spacing.xs },
  groupTitle: { fontSize: fontSizes.md, fontFamily: fontFamilies.displaySemiBold, marginBottom: spacing.xs },
});
