import { View, Text, Image, StyleSheet, Linking } from 'react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { TopicContent } from '@/lib/types';
import LatexRenderer from '@/components/ui/LatexRenderer';
import CodeRenderer from '@/components/ui/CodeRenderer';
import YouTubePlayer from '@/components/ui/YouTubePlayer';

function FormattedParagraph({ text, colors }: { text: string; colors: any }) {
  // Support [text](url), **bold/highlight**, and plain text
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);

  return (
    <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
      {parts.map((part, pIdx) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <Text
              key={pIdx}
              onPress={() => Linking.openURL(linkMatch[2]).catch(() => {})}
              style={[styles.linkText, { color: '#0084FE' }]}
            >
              {linkMatch[1]}
            </Text>
          );
        }
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
          return (
            <Text key={pIdx} style={[styles.boldHighlight, { color: '#0084FE' }]}>
              {boldMatch[1]}
            </Text>
          );
        }
        return <Text key={pIdx}>{part}</Text>;
      })}
    </Text>
  );
}

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
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: content.content }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      );
    case 'audio':
      return (
        <View style={[styles.audioBlock, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderSubtle }]}>
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
        <View style={styles.textContainer}>
          {content.content
            .split(/\n\n+/)
            .filter((p) => p.trim().length > 0)
            .map((paragraph, pIdx) => (
              <View key={pIdx} style={styles.paragraphWrap}>
                <FormattedParagraph text={paragraph} colors={colors} />
              </View>
            ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  textContainer: {
    gap: spacing.base,
  },
  paragraphWrap: {
    marginBottom: spacing.xs,
  },
  paragraph: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.sans,
    lineHeight: fontSizes.lg * 1.6,
  },
  boldHighlight: {
    fontFamily: fontFamilies.sansBold || fontFamilies.sansMedium,
    fontWeight: '700',
  },
  linkText: {
    fontFamily: fontFamilies.sansBold || fontFamilies.sansMedium,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radii.xl,
  },
  audioBlock: {
    padding: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  groupWrap: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  groupTitle: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.displaySemiBold,
    marginBottom: spacing.xs,
  },
});
