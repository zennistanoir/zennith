import React, { MouseEventHandler, useCallback, useState } from 'react';
import {
  Button,
  color,
  config,
  Icon,
  Icons,
  Menu,
  MenuItem,
  PopOut,
  RectCords,
  Spinner,
  Text,
} from 'folds';
import { MatrixError } from 'matrix-js-sdk';
import FocusTrap from 'focus-trap-react';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../../room-settings/styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useRoom } from '../../../hooks/useRoom';
import { StateEvent } from '../../../../types/matrix/room';
import { AsyncStatus, useAsyncCallback } from '../../../hooks/useAsyncCallback';
import { useStateEvent } from '../../../hooks/useStateEvent';
import { stopPropagation } from '../../../utils/keyboard';
import { RoomPermissionsAPI } from '../../../hooks/useRoomPermissions';

const DAY_MS = 24 * 60 * 60 * 1000;
// Whole numbers only: Matrix rejects decimals in event content.
const RETENTION_OPTIONS: { label: string; maxLifetime?: number }[] = [
  { label: 'Off' },
  { label: '1 day', maxLifetime: DAY_MS },
  { label: '7 days', maxLifetime: 7 * DAY_MS },
  { label: '14 days', maxLifetime: 14 * DAY_MS },
  { label: '30 days', maxLifetime: 30 * DAY_MS },
];

const labelFor = (maxLifetime?: number): string => {
  if (typeof maxLifetime !== 'number') return 'Off';
  const known = RETENTION_OPTIONS.find((o) => o.maxLifetime === maxLifetime);
  if (known) return known.label;
  const days = Math.round(maxLifetime / DAY_MS);
  return `${days} day${days === 1 ? '' : 's'}`;
};

type RoomRetentionProps = {
  permissions: RoomPermissionsAPI;
};
export function RoomRetention({ permissions }: RoomRetentionProps) {
  const mx = useMatrixClient();
  const room = useRoom();

  const canEdit = permissions.stateEvent(StateEvent.RoomRetention, mx.getSafeUserId());

  const retentionEvent = useStateEvent(room, StateEvent.RoomRetention);
  const current = retentionEvent?.getContent<{ max_lifetime?: number }>().max_lifetime;

  const [menuAnchor, setMenuAnchor] = useState<RectCords>();

  const handleOpenMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuAnchor(evt.currentTarget.getBoundingClientRect());
  };

  const [submitState, submit] = useAsyncCallback(
    useCallback(
      async (maxLifetime?: number) => {
        const content = maxLifetime === undefined ? {} : { max_lifetime: Math.round(maxLifetime) };
        await mx.sendStateEvent(room.roomId, StateEvent.RoomRetention as any, content);
      },
      [mx, room.roomId]
    )
  );
  const submitting = submitState.status === AsyncStatus.Loading;

  const handleChange = (maxLifetime?: number) => {
    submit(maxLifetime);
    setMenuAnchor(undefined);
  };

  return (
    <SequenceCard
      className={SequenceCardStyle}
      variant="SurfaceVariant"
      direction="Column"
      gap="400"
    >
      <SettingTile
        title="Auto-delete messages"
        description={
          canEdit
            ? 'Messages older than this are deleted from the server. This is permanent and cannot be undone. It takes effect within about a day.'
            : `Messages older than this are permanently deleted from the server (within about a day). Current setting: ${labelFor(
                current
              )}.`
        }
        after={
          canEdit ? (
            <PopOut
              anchor={menuAnchor}
              position="Bottom"
              align="End"
              content={
                <FocusTrap
                  focusTrapOptions={{
                    initialFocus: false,
                    onDeactivate: () => setMenuAnchor(undefined),
                    clickOutsideDeactivates: true,
                    isKeyForward: (evt: KeyboardEvent) => evt.key === 'ArrowDown',
                    isKeyBackward: (evt: KeyboardEvent) => evt.key === 'ArrowUp',
                    escapeDeactivates: stopPropagation,
                  }}
                >
                  <Menu style={{ padding: config.space.S100 }}>
                    {RETENTION_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.label}
                        size="300"
                        radii="300"
                        onClick={() => handleChange(option.maxLifetime)}
                        aria-pressed={option.maxLifetime === current}
                      >
                        <Text as="span" size="T300" truncate>
                          {option.label}
                        </Text>
                      </MenuItem>
                    ))}
                  </Menu>
                </FocusTrap>
              }
            >
              <Button
                variant="Secondary"
                fill="Soft"
                size="300"
                radii="300"
                outlined
                disabled={submitting}
                onClick={handleOpenMenu}
                after={
                  submitting ? (
                    <Spinner size="100" variant="Secondary" />
                  ) : (
                    <Icon size="100" src={Icons.ChevronBottom} />
                  )
                }
              >
                <Text size="B300">{labelFor(current)}</Text>
              </Button>
            </PopOut>
          ) : (
            <Text size="B300">{labelFor(current)}</Text>
          )
        }
      >
        {submitState.status === AsyncStatus.Error && (
          <Text style={{ color: color.Critical.Main }} size="T200">
            {(submitState.error as MatrixError).message}
          </Text>
        )}
      </SettingTile>
    </SequenceCard>
  );
}
