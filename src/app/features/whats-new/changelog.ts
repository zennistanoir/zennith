// Shown once after an update (see WhatsNew.tsx). Newest first. Keep each item to a
// line: what changed and where to find it.

export type ChangelogEntry = {
  version: string;
  items: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    items: [
      'Zennith 1.0: the first official release. Chat, voice channels, screen sharing and a soundboard, on the web and as a desktop app.',
      'Voice channels: muted and deafened icons, a per-person volume slider, and a call panel with camera, screen share, soundboard and noise suppression.',
      'Moderators can disconnect or move people between voice channels, and a Remove from call button clears someone whose PC is off.',
      'Soundboard: sounds can be added again and show in calls for voice rooms inside sub-spaces. Moderators add them in Space Settings → Soundboard.',
      'The voice channel list shows one speaker icon per person, not two.',
      'Settings > Account: you can now change your password.',
      'Room settings: moderators can auto-delete messages after 1, 7, 14 or 30 days.',
      'Keyboard shortcuts (press Ctrl + / to see them), per-room message drafts, an Accessibility page and a settings search.',
    ],
  },
];
