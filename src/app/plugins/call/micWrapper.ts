/* eslint-disable no-console */
import { trimTrailingSlash } from '../../utils/common';

const TAG = '[mic-wrapper]';

// Run `localStorage.setItem('cinny-noise-suppression', 'off')` in the browser console to
// switch RNNoise off (takes effect the next time you join a call). Remove the key to turn it on.
const SETTING_KEY = 'cinny-noise-suppression';

type IframeWindow = Window & typeof globalThis;

type Pipeline = {
  attach: (stream: MediaStream) => MediaStream;
  dispose: () => void;
};

const wrapped = new WeakSet<object>();

const isEnabled = (): boolean => {
  try {
    return window.localStorage.getItem(SETTING_KEY) !== 'off';
  } catch {
    return true;
  }
};

// Files are copied from the npm package into /public/noise-suppressor by vite.config.js
const assetUrl = (path: string): string => {
  const base = trimTrailingSlash(import.meta.env.BASE_URL);
  return new URL(`${base}/public/noise-suppressor/${path}`, window.location.origin).href;
};

const withTimeout = <T>(promise: Promise<T>, ms: number, what: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${what} timed out`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

// RNNoise replaces the browser's own noise suppression, so ask the browser not to run its
// filter as well (two filters in a row make the voice sound worse).
const withoutBrowserSuppression = (constraints: MediaStreamConstraints): MediaStreamConstraints => {
  const audio = typeof constraints.audio === 'object' ? constraints.audio : {};
  return {
    ...constraints,
    audio: { ...audio, noiseSuppression: false, voiceIsolation: false } as MediaTrackConstraints,
  };
};

/**
 * Everything is created inside the call iframe's own window, so the streams and tracks we hand
 * back belong to the same JavaScript realm as the call page (avoids instanceof surprises).
 */
async function createPipeline(win: IframeWindow): Promise<Pipeline> {
  const { loadRnnoise, RnnoiseWorkletNode } = await import('@sapphi-red/web-noise-suppressor');

  const ctx = new win.AudioContext({ sampleRate: 48000, latencyHint: 'interactive' });

  let disposed = false;
  let node: (AudioWorkletNode & { destroy: () => void }) | undefined;
  let source: MediaStreamAudioSourceNode | undefined;
  let rawAudio: MediaStreamTrack[] = [];

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    try {
      source?.disconnect();
    } catch {
      // ignore
    }
    try {
      node?.disconnect();
      node?.destroy();
    } catch {
      // ignore
    }
    rawAudio.forEach((track) => track.stop());
    ctx.close().catch(() => {});
  };

  try {
    const [wasmBinary] = await Promise.all([
      loadRnnoise({ url: assetUrl('rnnoise.wasm'), simdUrl: assetUrl('rnnoise_simd.wasm') }),
      ctx.audioWorklet.addModule(assetUrl('rnnoise/workletProcessor.js')),
    ]);

    if ((ctx.state as AudioContextState) !== 'running') {
      await withTimeout(ctx.resume(), 2000, 'AudioContext resume');
    }
    if ((ctx.state as AudioContextState) !== 'running') {
      throw new Error(`AudioContext is ${ctx.state}`);
    }

    const rnnoise = new RnnoiseWorkletNode(ctx, { maxChannels: 1, wasmBinary });
    node = rnnoise;
    const destination = ctx.createMediaStreamDestination();
    rnnoise.connect(destination);

    const attach = (stream: MediaStream): MediaStream => {
      const tracks = stream.getAudioTracks();
      const rawTrack = tracks[0];
      if (!rawTrack) throw new Error('no audio track to process');

      const src = ctx.createMediaStreamSource(new win.MediaStream([rawTrack]));
      src.connect(rnnoise);

      const outTrack = destination.stream.getAudioTracks()[0];
      if (!outTrack) throw new Error('no processed audio track');

      // Make the processed track look like the real microphone to the call page
      try {
        Object.defineProperty(outTrack, 'label', { value: rawTrack.label });
        outTrack.getSettings = () => ({ ...rawTrack.getSettings() });
      } catch (error) {
        console.warn(TAG, 'could not copy microphone details to the processed track', error);
      }

      // Hanging up / muting by stopping the track must also release the real microphone
      const originalStop = outTrack.stop.bind(outTrack);
      outTrack.stop = () => {
        originalStop();
        dispose();
      };
      rawTrack.addEventListener('ended', () => {
        originalStop();
        dispose();
        outTrack.dispatchEvent(new win.Event('ended'));
      });

      // Only now that everything succeeded do we take ownership of the real microphone
      source = src;
      rawAudio = tracks;

      return new win.MediaStream([outTrack, ...stream.getVideoTracks()]);
    };

    return { attach, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}

export function installMicWrapper(iframe: HTMLIFrameElement): void {
  const win = iframe.contentWindow as IframeWindow | null;
  const mediaDevices = win?.navigator?.mediaDevices;
  if (!win || !mediaDevices) {
    console.warn(TAG, 'no mediaDevices in call iframe');
    return;
  }
  if (wrapped.has(mediaDevices)) return;

  const original = mediaDevices.getUserMedia.bind(mediaDevices);

  mediaDevices.getUserMedia = async (constraints?: MediaStreamConstraints): Promise<MediaStream> => {
    console.log(TAG, 'getUserMedia requested', JSON.stringify(constraints));

    // Video-only requests, or noise suppression switched off: behave exactly as before
    if (!constraints?.audio || !isEnabled()) return original(constraints);

    let pipeline: Pipeline;
    try {
      pipeline = await createPipeline(win);
    } catch (error) {
      console.warn(TAG, 'RNNoise unavailable, using the normal microphone:', error);
      return original(constraints);
    }

    let stream: MediaStream;
    try {
      stream = await original(withoutBrowserSuppression(constraints));
    } catch (error) {
      pipeline.dispose();
      throw error;
    }

    try {
      const processed = pipeline.attach(stream);
      console.log(
        TAG,
        'RNNoise active',
        processed.getAudioTracks().map((track) => track.label)
      );
      return processed;
    } catch (error) {
      console.warn(TAG, 'RNNoise failed after capture, giving back the normal microphone:', error);
      pipeline.dispose();
      // Put the browser's own suppression back on the real microphone track
      stream.getAudioTracks().forEach((track) => {
        track.applyConstraints({ noiseSuppression: true }).catch(() => {});
      });
      return stream;
    }
  };

  wrapped.add(mediaDevices);
  console.log(TAG, 'installed');
}
