import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { IconChevronDown, IconX } from '@tabler/icons-react-native';
import { fontFamilies, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';
import { ReminderTime } from '@/store/onboarding.store';

interface OnboardingTimePickerModalProps {
  value: ReminderTime;
  onChange: (time: ReminderTime) => void;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM'];

export default function OnboardingTimePickerModal({
  value,
  onChange,
}: OnboardingTimePickerModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState(value.hour);
  const [tempMinute, setTempMinute] = useState(value.minute);
  const [tempPeriod, setTempPeriod] = useState(value.period);

  const formattedMinute = value.minute < 10 ? `0${value.minute}` : `${value.minute}`;
  const displayString = `${value.hour}:${formattedMinute} ${value.period}`;

  const handleOpen = () => {
    setTempHour(value.hour);
    setTempMinute(value.minute);
    setTempPeriod(value.period);
    setModalVisible(true);
    haptics.light();
  };

  const handleSave = () => {
    onChange({
      hour: tempHour,
      minute: tempMinute,
      period: tempPeriod,
    });
    setModalVisible(false);
    haptics.success();
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        <Text style={styles.label}>Remind me at :</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change reminder time, currently ${displayString}`}
          onPress={handleOpen}
          style={({ pressed }) => [styles.triggerBox, pressed && styles.triggerBoxPressed]}
        >
          <Text style={styles.triggerText}>{displayString}</Text>
          <IconChevronDown size={20} color="#0E0E1A" strokeWidth={2.4} />
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Daily Reminder</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                style={styles.closeBtn}
              >
                <IconX size={20} color="#6B6B80" />
              </Pressable>
            </View>

            <View style={styles.pickerColumns}>
              {/* Hours Column */}
              <View style={styles.columnWrapper}>
                <Text style={styles.columnHeader}>Hour</Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.columnScroll}
                  contentContainerStyle={styles.columnContent}
                >
                  {HOURS.map((h) => {
                    const isSelected = tempHour === h;
                    return (
                      <Pressable
                        key={`hour-${h}`}
                        onPress={() => {
                          haptics.selection();
                          setTempHour(h);
                        }}
                        style={[
                          styles.optionPill,
                          isSelected && styles.optionPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {h}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Minutes Column */}
              <View style={styles.columnWrapper}>
                <Text style={styles.columnHeader}>Minute</Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.columnScroll}
                  contentContainerStyle={styles.columnContent}
                >
                  {MINUTES.map((m) => {
                    const isSelected = tempMinute === m;
                    const formattedM = m < 10 ? `0${m}` : `${m}`;
                    return (
                      <Pressable
                        key={`min-${m}`}
                        onPress={() => {
                          haptics.selection();
                          setTempMinute(m);
                        }}
                        style={[
                          styles.optionPill,
                          isSelected && styles.optionPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          :{formattedM}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* AM / PM Column */}
              <View style={styles.columnWrapper}>
                <Text style={styles.columnHeader}>Period</Text>
                <View style={styles.columnContent}>
                  {PERIODS.map((p) => {
                    const isSelected = tempPeriod === p;
                    return (
                      <Pressable
                        key={`period-${p}`}
                        onPress={() => {
                          haptics.selection();
                          setTempPeriod(p);
                        }}
                        style={[
                          styles.optionPill,
                          isSelected && styles.optionPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>Save Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  label: {
    fontSize: 18,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
    letterSpacing: -0.2,
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: spacing.base + 2,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  triggerBoxPressed: {
    backgroundColor: '#F8F8FA',
    transform: [{ scale: 0.98 }],
  },
  triggerText: {
    fontSize: 18,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 14, 26, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
  },
  closeBtn: {
    padding: 4,
  },
  pickerColumns: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  columnWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  columnHeader: {
    fontSize: 12,
    fontFamily: fontFamilies.sansSemiBold,
    color: '#6B6B80',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  columnScroll: {
    maxHeight: 180,
    width: '100%',
  },
  columnContent: {
    gap: 6,
    paddingVertical: 4,
    alignItems: 'center',
    width: '100%',
  },
  optionPill: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  optionPillSelected: {
    backgroundColor: '#FF8A1E',
  },
  optionText: {
    fontSize: 15,
    fontFamily: fontFamilies.sansMedium,
    color: '#0E0E1A',
  },
  optionTextSelected: {
    fontFamily: fontFamilies.sansBold,
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#FF8A1E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
  },
});
