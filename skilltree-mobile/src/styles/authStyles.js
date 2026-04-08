import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../skilltree-shared/theme';

export const authStyles = StyleSheet.create({
  // ========== CONTAINERS & LAYOUT ==========
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark.black,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  frameWrapper: {
    position: 'relative',
    backgroundColor: 'transparent',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  form: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },

  // ========== TITLE ==========
  title: {
    fontFamily: FONTS.decorative,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.dark.brown,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    textShadowColor: 'rgba(255, 220, 120, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },

  // ========== LABELS ==========
  label: {
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.dark.brown,
    textShadowColor: 'rgba(255, 220, 100, 0.30)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },

  // ========== INPUT ==========
  input: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 220, 80, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 100, 0.2)',
    marginBottom: SPACING.lg,
  },

  inputFocused: {
    borderColor: 'rgba(255, 220, 80, 0.5)',
    backgroundColor: 'rgba(255, 220, 80, 0.1)',
  },

  inputDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  // ========== BUTTON ==========
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(245, 232, 176, 0.3)',
    backgroundColor: 'transparent',
  },

  buttonPressed: {
    backgroundColor: 'rgba(255, 220, 80, 0.1)',
    borderColor: 'rgba(245, 232, 176, 0.6)',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontFamily: FONTS.decorative,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.primary.goldLight,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 220, 80, 0.80)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },

  // ========== LINKS ==========
  linksContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },

  link: {
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary.goldLight,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },

  // ========== ERROR MESSAGE ==========
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },

  errorText: {
    fontFamily: FONTS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
    color: COLORS.semantic.error,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // ========== SUCCESS MESSAGE ==========
  successContainer: {
    backgroundColor: 'rgba(144, 238, 144, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.semantic.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },

  successText: {
    fontFamily: FONTS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
    color: COLORS.semantic.success,
    textAlign: 'center',
  },

  // ========== FIREFLY ==========
  firefly: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary.goldAccent,
    position: 'absolute',
  },
});
