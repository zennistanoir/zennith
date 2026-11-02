import { globalStyle } from '@vanilla-extract/css';
import { color, config } from 'folds';
import { solidFillValue } from '../../../colors.css';

// Voice-channel participant tree and volume slider styles for the room nav.
// Rules use !important where they must override folds NavItem (display: flex).
// Colors come from folds theme vars so every theme (incl. light Lavender) applies.

const criticalFill = solidFillValue.Critical;

globalStyle('.zennith-voice-channel-block', {
  display: 'flex !important',
  flexDirection: 'column !important' as 'column',
  width: '100% !important',
  marginBottom: '2px !important',
});

globalStyle('.zennith-channel-header-row', {
  display: 'flex !important',
  alignItems: 'center !important',
  justifyContent: 'space-between !important',
  height: '34px !important',
  padding: '0 8px !important',
  borderRadius: '4px !important',
  width: '100% !important',
  background: 'transparent',
  cursor: 'pointer',
  overflow: 'hidden !important',
});

globalStyle('.channel-title-group', {
  display: 'flex !important',
  alignItems: 'center !important',
  gap: '8px !important',
  minWidth: '0 !important',
  flex: '1',
});

globalStyle('.channel-name', {
  fontSize: '14px !important',
  color: `${color.Background.OnContainer}`,
  opacity: config.opacity.P400,
  whiteSpace: 'nowrap !important',
  overflow: 'hidden !important',
  textOverflow: 'ellipsis !important',
});

globalStyle('.channel-name.unread, [aria-selected=true] .channel-name', {
  opacity: '1',
});

globalStyle('.channel-name.unread', {
  fontWeight: '600',
});

globalStyle('.zennith-channel-status', {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: '0',
  marginLeft: '4px',
});

globalStyle('.zennith-voice-user-tree', {
  display: 'flex !important',
  flexDirection: 'column !important' as 'column',
  width: '100% !important',
  paddingLeft: '28px !important',
  marginTop: '2px !important',
  gap: '2px !important',
});

globalStyle('.zennith-voice-user-item', {
  display: 'flex !important',
  alignItems: 'center !important',
  gap: '8px !important',
  height: '28px !important',
  width: '100% !important',
  borderRadius: '4px !important',
  padding: '0 6px !important',
});

globalStyle('.zennith-voice-user-item:hover, .zennith-voice-user-item:focus-within', {
  background: `${color.Background.ContainerHover} !important`,
});

globalStyle('.zennith-voice-user-main', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '1',
  minWidth: '0',
  height: '100%',
  padding: '0',
  border: '0',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
});

globalStyle('.zennith-voice-user-main:focus-visible', {
  outline: `2px solid ${color.Primary.Main}`,
  outlineOffset: '-2px',
  borderRadius: '4px',
});

// Hidden until hover/focus; always shown on touch screens (no hover).
globalStyle('.zennith-voice-volume-btn', {
  opacity: '0',
  flexShrink: '0',
});

globalStyle(
  '.zennith-voice-user-item:hover .zennith-voice-volume-btn, .zennith-voice-user-item:focus-within .zennith-voice-volume-btn, .zennith-voice-volume-btn[aria-pressed=true]',
  {
    opacity: '1',
  }
);

globalStyle('.zennith-voice-volume-btn', {
  '@media': {
    '(hover: none)': {
      opacity: '1',
    },
  },
});

globalStyle('.zennith-voice-avatar', {
  width: '20px !important',
  height: '20px !important',
  minWidth: '20px !important',
  minHeight: '20px !important',
  maxWidth: '20px !important',
  maxHeight: '20px !important',
  borderRadius: '50% !important',
  objectFit: 'cover !important' as 'cover',
  flexShrink: '0 !important',
  overflow: 'hidden !important',
});

// Ring drawn with box-shadow so it never shifts the row's layout.
globalStyle('.zennith-voice-avatar', {
  transition: 'box-shadow 120ms ease-out',
});

globalStyle('.zennith-voice-avatar.speaking', {
  boxShadow: `0 0 0 2px ${color.Success.Main}, 0 0 6px 1px ${color.Success.Main} !important`,
});

globalStyle('.zennith-voice-avatar', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

globalStyle('.zennith-voice-live', {
  flexShrink: '0',
  marginLeft: 'auto',
  background: criticalFill.Main,
  color: color.Critical.OnMain,
  borderRadius: '4px',
  padding: '0 4px',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.04em',
  lineHeight: '15px',
});

globalStyle('.zennith-voice-state', {
  flexShrink: '0',
  color: `${color.Critical.Main}`,
});

globalStyle('.zennith-voice-volume-row', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

// Custom slider: filled part of the track follows --zv-fill (set inline).
globalStyle('.zennith-voice-slider', {
  WebkitAppearance: 'none',
  appearance: 'none',
  flex: '1',
  minWidth: '0',
  height: '20px',
  margin: '0',
  background: 'transparent',
  cursor: 'pointer',
});

globalStyle('.zennith-voice-slider:focus-visible', {
  outline: `2px solid ${color.Other.FocusRing}`,
  outlineOffset: '3px',
  borderRadius: '4px',
});

globalStyle('.zennith-voice-slider::-webkit-slider-runnable-track', {
  height: '6px',
  borderRadius: '999px',
  background: `linear-gradient(to right, ${color.Primary.Main} 0 var(--zv-fill), ${color.SurfaceVariant.ContainerActive} var(--zv-fill) 100%)`,
});

globalStyle('.zennith-voice-slider::-moz-range-track', {
  height: '6px',
  borderRadius: '999px',
  background: `${color.SurfaceVariant.ContainerActive}`,
});

globalStyle('.zennith-voice-slider::-moz-range-progress', {
  height: '6px',
  borderRadius: '999px',
  background: `${color.Primary.Main}`,
});

globalStyle('.zennith-voice-slider::-webkit-slider-thumb', {
  WebkitAppearance: 'none',
  appearance: 'none',
  width: '14px',
  height: '14px',
  marginTop: '-4px',
  borderRadius: '50%',
  background: `${color.Primary.OnMain}`,
  border: `2px solid ${color.Primary.Main}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  transition: 'transform 100ms ease-out, box-shadow 100ms ease-out',
});

globalStyle('.zennith-voice-slider::-moz-range-thumb', {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: `${color.Primary.OnMain}`,
  border: `2px solid ${color.Primary.Main}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  transition: 'transform 100ms ease-out, box-shadow 100ms ease-out',
});

globalStyle(
  '.zennith-voice-slider:hover::-webkit-slider-thumb, .zennith-voice-slider:active::-webkit-slider-thumb',
  {
    transform: 'scale(1.15)',
  }
);

globalStyle(
  '.zennith-voice-slider:hover::-moz-range-thumb, .zennith-voice-slider:active::-moz-range-thumb',
  {
    transform: 'scale(1.15)',
  }
);

globalStyle('.zennith-voice-slider:focus-visible::-webkit-slider-thumb', {
  boxShadow: `0 0 0 4px ${color.Other.FocusRing}`,
});

globalStyle('.zennith-voice-slider:focus-visible::-moz-range-thumb', {
  boxShadow: `0 0 0 4px ${color.Other.FocusRing}`,
});

globalStyle('.zennith-voice-percent', {
  minWidth: '36px',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
});

// Separate rules: one unknown pseudo-element would void a shared selector list.
globalStyle('.zennith-voice-slider::-webkit-slider-thumb', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

globalStyle('.zennith-voice-slider::-moz-range-thumb', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

globalStyle('.zennith-voice-avatar img', {
  width: '100% !important',
  height: '100% !important',
  objectFit: 'cover !important' as 'cover',
});

globalStyle('.zennith-voice-username', {
  flex: '1',
  minWidth: '0',
  fontSize: '13px !important',
  color: `${color.Background.OnContainer} !important`,
  whiteSpace: 'nowrap !important',
  overflow: 'hidden !important',
  textOverflow: 'ellipsis !important',
});
