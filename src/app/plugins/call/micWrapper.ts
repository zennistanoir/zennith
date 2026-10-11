const wrapped = new WeakSet<object>();

export function installMicWrapper(iframe: HTMLIFrameElement): void {
  const mediaDevices = iframe.contentWindow?.navigator?.mediaDevices;
  if (!mediaDevices) {
    // eslint-disable-next-line no-console
    console.warn('[mic-wrapper] no mediaDevices in call iframe');
    return;
  }
  if (wrapped.has(mediaDevices)) return;

  const original = mediaDevices.getUserMedia.bind(mediaDevices);
  mediaDevices.getUserMedia = async (constraints?: MediaStreamConstraints) => {
    // eslint-disable-next-line no-console
    console.log('[mic-wrapper] getUserMedia requested', JSON.stringify(constraints));
    const stream = await original(constraints);
    // eslint-disable-next-line no-console
    console.log(
      '[mic-wrapper] audio tracks',
      stream.getAudioTracks().map((t) => t.label)
    );
    return stream;
  };
  wrapped.add(mediaDevices);
  // eslint-disable-next-line no-console
  console.log('[mic-wrapper] installed');
}
