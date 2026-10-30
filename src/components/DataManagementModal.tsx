import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  exportAllData,
  importAllData,
  resetAllData,
  clearDayLogs,
  clearDayWater,
  restoreDefaultIndianFoods,
} from '../db';
import { Colors } from '../theme';

interface DataManagementModalProps {
  visible: boolean;
  activeDate: string;
  onClose: () => void;
  onReload: () => Promise<void>;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  visible,
  activeDate,
  onClose,
  onReload,
}) => {
  const insets = useSafeAreaInsets();
  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const data = await exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);

      await Share.share({
        message: jsonStr,
        title: `protein-tracker-backup-${activeDate}.json`,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err.message || 'Could not export data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      Alert.alert('Empty Data', 'Please paste valid backup JSON in the box.');
      return;
    }

    Alert.alert(
      'Confirm Import',
      'This will merge imported foods, meals, and logs into your database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setIsProcessing(true);
            const res = await importAllData(importJson.trim());
            setIsProcessing(false);
            if (res.success) {
              Alert.alert('Success', res.message);
              setImportJson('');
              setShowImportBox(false);
              await onReload();
              onClose();
            } else {
              Alert.alert('Import Failed', res.message);
            }
          },
        },
      ]
    );
  };

  const handleRestoreIndianFoods = async () => {
    Alert.alert(
      'Restore Indian Food Library?',
      'This will re-add any missing Indian staples and common fitness foods without modifying your personal foods.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Foods',
          onPress: async () => {
            setIsProcessing(true);
            await restoreDefaultIndianFoods();
            setIsProcessing(false);
            await onReload();
            Alert.alert('Restored', 'Starter Indian foods are ready in your Food Library.');
          },
        },
      ]
    );
  };

  const handleClearDay = async () => {
    Alert.alert(
      'Clear Logs for ' + activeDate + '?',
      'All food entries and water logs for this specific date will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Day',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            await clearDayLogs(activeDate);
            await clearDayWater(activeDate);
            setIsProcessing(false);
            await onReload();
            Alert.alert('Cleared', `Logs for ${activeDate} have been removed.`);
          },
        },
      ]
    );
  };

  const handleFactoryReset = async () => {
    Alert.alert(
      '⚠️ Factory Reset App?',
      'This will delete all custom foods, meals, logs, water records, and settings. Default Indian foods will be restored.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            await resetAllData();
            setIsProcessing(false);
            await onReload();
            onClose();
            Alert.alert('Reset Complete', 'App data has been restored to factory state.');
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>Data & Privacy</Text>
                <Text style={styles.modalSub} numberOfLines={1}>100% offline, local SQLite storage</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Export */}
              <View style={styles.actionCard}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="cloud-upload-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Export Backup</Text>
                  <Text style={styles.cardDesc}>
                    Generate a JSON backup of all your foods, meals, logs, and settings. Share or save anywhere.
                  </Text>
                </View>
                <Pressable
                  style={styles.btnSmall}
                  onPress={handleExport}
                  disabled={isProcessing}
                >
                  <Text style={styles.btnSmallText}>Export</Text>
                </Pressable>
              </View>

              {/* Import */}
              <View style={styles.actionCard}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="cloud-download-outline" size={22} color={Colors.carbs} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Import Backup</Text>
                  <Text style={styles.cardDesc}>
                    Restore your logs and custom foods from a previously exported backup file.
                  </Text>
                </View>
                <Pressable
                  style={[styles.btnSmall, { backgroundColor: Colors.carbsLight }]}
                  onPress={() => setShowImportBox(!showImportBox)}
                >
                  <Text style={[styles.btnSmallText, { color: Colors.carbs }]}>
                    {showImportBox ? 'Close' : 'Import'}
                  </Text>
                </Pressable>
              </View>

              {showImportBox && (
                <View style={styles.importBox}>
                  <Text style={styles.importLabel}>Paste Backup JSON content below:</Text>
                  <TextInput
                    value={importJson}
                    onChangeText={setImportJson}
                    placeholder='{"version": 1, "foods": [...] }'
                    placeholderTextColor="#A0A8A0"
                    multiline
                    numberOfLines={4}
                    style={styles.jsonInput}
                  />
                  <Pressable
                    style={styles.applyImportBtn}
                    onPress={handleImport}
                    disabled={isProcessing}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.applyImportBtnText}>Verify & Restore Backup</Text>
                  </Pressable>
                </View>
              )}

              {/* Replenish Indian Food Library */}
              <View style={styles.actionCard}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="restaurant-outline" size={22} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Indian Foods Library</Text>
                  <Text style={styles.cardDesc}>
                    Replenish 35+ common Indian meals and ingredients (Dal, Paneer, Roti, Chicken Tikka, etc.).
                  </Text>
                </View>
                <Pressable
                  style={[styles.btnSmall, { backgroundColor: '#FEF3C7' }]}
                  onPress={handleRestoreIndianFoods}
                  disabled={isProcessing}
                >
                  <Text style={[styles.btnSmallText, { color: '#B45309' }]}>Restore</Text>
                </Pressable>
              </View>

              {/* Clear active day */}
              <View style={styles.actionCard}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trash-bin-outline" size={22} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Clear Date's Records</Text>
                  <Text style={styles.cardDesc}>
                    Remove all foods and water tracked for {activeDate}.
                  </Text>
                </View>
                <Pressable
                  style={[styles.btnSmall, { backgroundColor: '#FEE2E2' }]}
                  onPress={handleClearDay}
                  disabled={isProcessing}
                >
                  <Text style={[styles.btnSmallText, { color: Colors.danger }]}>Clear</Text>
                </Pressable>
              </View>

              {/* Factory reset */}
              <View style={[styles.actionCard, { borderColor: '#FECACA' }]}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#DC2626' }]}>
                  <Ionicons name="alert-circle-outline" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: Colors.danger }]}>Reset All Data</Text>
                  <Text style={styles.cardDesc}>
                    Wipe database completely and restart fresh with starter configuration.
                  </Text>
                </View>
                <Pressable
                  style={[styles.btnSmall, { backgroundColor: Colors.danger }]}
                  onPress={handleFactoryReset}
                  disabled={isProcessing}
                >
                  <Text style={[styles.btnSmallText, { color: '#FFFFFF' }]}>Reset</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '92%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EC',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAF8',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6ECE4',
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.muted,
  },
  btnSmall: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  btnSmallText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  importBox: {
    backgroundColor: '#F4F7F4',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D8E2D6',
  },
  importLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ink,
  },
  jsonInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1DDD0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: Colors.ink,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  applyImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.carbs,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applyImportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
