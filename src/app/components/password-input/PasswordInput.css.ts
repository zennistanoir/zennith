import { style } from '@vanilla-extract/css';
import { toRem } from 'folds';

// Large inputs (the login form) get a 44x44 CSS px hit area for the reveal toggle.
export const touchTarget = style({
  minWidth: toRem(44),
  minHeight: toRem(44),
});
