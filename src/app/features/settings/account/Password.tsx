import React, { FormEventHandler, useCallback, useRef, useState } from 'react';
import { Box, Button, Checkbox, Input, Spinner, Text, color } from 'folds';
import { AuthDict, MatrixError } from 'matrix-js-sdk';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { ActionUIA, ActionUIAFlowsLoader } from '../../../components/ActionUIA';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useCapabilities } from '../../../hooks/useCapabilities';
import { useAuthMetadata } from '../../../hooks/useAuthMetadata';
import { AsyncState, AsyncStatus, useAsync } from '../../../hooks/useAsyncCallback';
import { useUIAMatrixError } from '../../../hooks/useUIAFlows';

const MIN_PASSWORD_LENGTH = 8;

// Changes the account password with the standard Matrix endpoint. The server asks
// for the current password itself (the same password prompt as other sensitive
// actions), so it is never checked or stored here. The new password only lives in
// a ref for the length of that round trip and is cleared afterwards.
export function Password() {
  const mx = useMatrixClient();
  const capabilities = useCapabilities();
  const authMetadata = useAuthMetadata();

  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<string>();
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [formError, setFormError] = useState<string>();
  const [done, setDone] = useState(false);
  const [state, setState] = useState<AsyncState<void, MatrixError>>({
    status: AsyncStatus.Idle,
  });

  const changePassword = useAsync(
    useCallback(
      async (authDict?: AuthDict) => {
        const next = pendingRef.current;
        if (!next) throw new Error('No new password set.');
        // The first call has no auth: the server answers with its auth flows.
        await mx.setPassword(authDict as AuthDict, next, signOutOthers);
      },
      [mx, signOutOthers]
    ),
    useCallback((s: AsyncState<void, MatrixError>) => {
      if (s.status === AsyncStatus.Success) {
        pendingRef.current = undefined;
        if (newRef.current) newRef.current.value = '';
        if (confirmRef.current) confirmRef.current.value = '';
        setDone(true);
      }
      setState(s);
    }, [])
  );
  const [authData, changeError] = useUIAMatrixError(
    state.status === AsyncStatus.Error ? state.error : undefined
  );
  const changing = state.status === AsyncStatus.Loading || authData !== undefined;

  const handleCancelAuth = useCallback(() => {
    pendingRef.current = undefined;
    setState({ status: AsyncStatus.Idle });
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    setDone(false);
    const next = newRef.current?.value ?? '';
    const confirm = confirmRef.current?.value ?? '';
    if (next.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setFormError("The two passwords don't match.");
      return;
    }
    setFormError(undefined);
    pendingRef.current = next;
    changePassword();
  };

  // Accounts that sign in through an identity provider manage their password there.
  if (authMetadata) return null;
  if (capabilities['m.change_password']?.enabled === false) return null;

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">Password</Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title="Change Password"
          description="You'll be asked for your current password to confirm."
        >
          <Box
            as="form"
            direction="Column"
            gap="200"
            style={{ maxWidth: 360 }}
            onSubmit={handleSubmit}
          >
            <Input
              ref={newRef}
              type="password"
              name="newPassword"
              autoComplete="new-password"
              placeholder="New password"
              variant="Secondary"
              radii="300"
              required
              disabled={changing}
            />
            <Input
              ref={confirmRef}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm new password"
              variant="Secondary"
              radii="300"
              required
              disabled={changing}
            />
            <Box as="label" alignItems="Center" gap="200">
              <Checkbox
                checked={signOutOthers}
                onClick={() => setSignOutOthers(!signOutOthers)}
                variant="Primary"
                size="50"
                disabled={changing}
              />
              <Text size="T200">Sign out my other devices</Text>
            </Box>
            {formError && (
              <Text size="T200" style={{ color: color.Critical.Main }}>
                {formError}
              </Text>
            )}
            {changeError && (
              <Text size="T200" style={{ color: color.Critical.Main }}>
                Couldn&apos;t change the password. {changeError.message}
              </Text>
            )}
            {done && (
              <Text size="T200" style={{ color: color.Success.Main }}>
                Password changed.
              </Text>
            )}
            <Box>
              <Button
                type="submit"
                size="300"
                variant="Primary"
                radii="300"
                disabled={changing}
                before={changing && <Spinner variant="Primary" fill="Solid" size="100" />}
              >
                <Text size="B300">Change Password</Text>
              </Button>
            </Box>
          </Box>
        </SettingTile>
      </SequenceCard>
      {authData && (
        <ActionUIAFlowsLoader
          authData={authData}
          unsupported={() => (
            <Text size="T200">
              Authentication steps to perform this action are not supported by client.
            </Text>
          )}
        >
          {(ongoingFlow) => (
            <ActionUIA
              authData={authData}
              ongoingFlow={ongoingFlow}
              action={changePassword}
              onCancel={handleCancelAuth}
            />
          )}
        </ActionUIAFlowsLoader>
      )}
    </Box>
  );
}
