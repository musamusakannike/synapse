import { Alert, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconLock } from '@tabler/icons-react-native';
import { Course, PaymentStatus, VerifyResponse } from '@/lib/types';
import { formatKobo } from '@/lib/money';
import { SUBSCRIPTION_PRICE_KOBO } from '@/lib/paystack';
import { usePaystackPayment } from '@/hooks/usePaystackPayment';
import { NotInReview } from '@/components/common/ReviewGuard';
import PaystackCheckoutModal from '@/components/payments/PaystackCheckoutModal';
import GlassSurface from '@/components/ui/GlassSurface';
import Button from '@/components/ui/Button';
import { fontFamilies, spacing } from '@/theme';
import { INK, MUTED, TINT_ORANGE } from '@/theme/brand';

interface CoursePaywallProps {
  course: Course;
  paymentStatus: PaymentStatus | null;
  onUnlocked: () => void;
}

export default function CoursePaywall({ course, paymentStatus, onUnlocked }: CoursePaywallProps) {
  const { session, busy, verifying, initialize, closeSession, verifyReference } = usePaystackPayment();

  const handleVerified = async (result: VerifyResponse | null) => {
    if (result?.status === 'success') {
      Alert.alert('Payment successful', result.type === 'subscription' ? 'You now have all-access.' : 'This course is now unlocked.');
      onUnlocked();
    } else if (result?.status === 'pending') {
      Alert.alert('Payment pending', "We're still waiting for confirmation. Pull to refresh in a moment.");
    } else if (result?.status === 'failed') {
      Alert.alert('Payment failed', "Your payment wasn't completed.");
    }
  };

  const subActive = paymentStatus?.subscription?.status === 'active';

  return (
    <NotInReview>
      <GlassSurface style={styles.card} tintColor={TINT_ORANGE}>
        <View style={styles.row}>
          <IconLock size={18} color={INK} />
          <Text style={styles.title}>Premium course</Text>
        </View>
        <Text style={styles.body}>
          Unlock this course for {formatKobo(course.price)} or get every premium course for {formatKobo(SUBSCRIPTION_PRICE_KOBO)}/month.
        </Text>
        <Button
          fullWidth
          loading={busy === 'course' || verifying}
          disabled={!!busy && busy !== 'course'}
          onPress={() => void initialize('course', { courseId: course._id, amountKobo: course.price }, handleVerified)}
        >
          Buy this course · {formatKobo(course.price)}
        </Button>
        {!subActive && (
          <Button fullWidth variant="secondary" onPress={() => router.push('/subscribe')}>
            Subscribe instead · {formatKobo(SUBSCRIPTION_PRICE_KOBO)}/mo
          </Button>
        )}
      </GlassSurface>
      <PaystackCheckoutModal
        visible={!!session}
        authorizationUrl={session?.authorizationUrl ?? null}
        fallbackReference={session?.reference ?? null}
        onClose={closeSession}
        onSettled={(reference) => {
          void verifyReference(reference).then(handleVerified);
        }}
      />
    </NotInReview>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: spacing.base, gap: spacing.sm, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 16, fontFamily: fontFamilies.sansBold, color: INK },
  body: { fontSize: 14, fontFamily: fontFamilies.sans, color: MUTED, lineHeight: 20 },
});
