import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>GLYPH</Text>

        <View style={styles.headerDivider} />

        <View style={styles.previewRow}>
          <Pressable style={styles.navButton} accessibilityLabel="Previous preview">
            <Text style={styles.navText}>{'<'}</Text>
          </Pressable>

          <View style={styles.previewCard}>
            <Text style={styles.previewText}>[ Image Preview ]</Text>
          </View>

          <Pressable style={styles.navButton} accessibilityLabel="Next preview">
            <Text style={styles.navText}>{'>'}</Text>
          </Pressable>
        </View>

        <View style={styles.textGrid}>
          <View style={styles.textCard}>
            <Text style={styles.cardLabel}>ORIGINAL TEXT</Text>
            <Text style={styles.cardText}>
              Bonjour le monde, ceci est un exemple de texte à traduire.
            </Text>
          </View>

          <View style={styles.textCard}>
            <Text style={styles.cardLabel}>TRANSLATED TEXT</Text>
            <Text style={styles.cardText}>
              Hello world, this is an example of text to translate.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071d2d',
  },
  container: {
    flex: 1,
    backgroundColor: '#071d2d',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    color: '#36baf6',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#1d364f',
    width: '100%',
    marginBottom: 28,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  navButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  navText: {
    color: '#f8fbff',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 28,
    includeFontPadding: false,
  },
  previewCard: {
    width: '58%',
    minWidth: 280,
    maxWidth: 480,
    height: 270,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 148, 164, 0.18)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(173, 202, 220, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  previewText: {
    fontSize: 18,
    color: '#dfeaf3',
    opacity: 0.9,
    letterSpacing: 0.4,
    fontWeight: '400',
  },
  textGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  textCard: {
    flex: 1,
    minHeight: 150,
    backgroundColor: 'rgba(118, 139, 160, 0.16)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(166, 192, 207, 0.18)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 18,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#d5e6f2',
    marginBottom: 14,
    opacity: 0.95,
  },
  cardText: {
    color: '#f0f6fa',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
  },
});
