import { useEffect, useState, useRef } from 'react';

export const useMidiControl = (onMidiMessage) => {
  const [midiAccess, setMidiAccess] = useState(null);
  const [error, setError] = useState(null);
  const callbackRef = useRef(onMidiMessage);

  useEffect(() => {
    callbackRef.current = onMidiMessage;
  }, [onMidiMessage]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API is not supported in this browser.');
      setError('Web MIDI API is not supported in this browser.');
      return;
    }

    let accessObj = null;

    const lastCCNoteTime = {};
    const pendingCC = {}; // dernier message CC retenu par le bouclier, par contrôle
    const pendingTimer = {};

    const deliver = (data) => {
      if (callbackRef.current) callbackRef.current(data);
    };

    const handleMIDIMessage = (message) => {
      const data = message.data;
      const status = data[0];
      const type = status & 0xF0;
      const note = data[1];

      // SAFETY SHIELD: Prevent browser saturation by dropping high-frequency CC messages.
      // 0xB0 is the status for Control Change (Pitch/Jog/Knobs).
      if (type === 0xB0) {
        const key = (status << 8) | note; // par contrôle ET par canal (pitch A ≠ pitch B)
        const now = performance.now();
        const wait = 10 - (now - (lastCCNoteTime[key] || 0));
        if (wait > 0) {
          // Hard cap at 100Hz per control; le dernier message de la rafale est livré en fin de fenêtre
          // pour que la position finale d'un fader (MSB/LSB) ne soit jamais perdue.
          pendingCC[key] = data;
          if (!pendingTimer[key]) {
            pendingTimer[key] = setTimeout(() => {
              pendingTimer[key] = null;
              lastCCNoteTime[key] = performance.now();
              deliver(pendingCC[key]);
            }, wait);
          }
          return;
        }
        lastCCNoteTime[key] = now;
      }

      deliver(data);
    };

    const attachListeners = (access) => {
      // Setup listeners for all currently connected inputs
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMIDIMessage;
      });
    };

    const handleStateChange = (e) => {
      // Connect to new devices
      if (e.port.state === 'connected' && e.port.type === 'input') {
        e.port.onmidimessage = handleMIDIMessage;
      }
    };

    navigator.requestMIDIAccess()
      .then((access) => {
        accessObj = access;
        setMidiAccess(access);
        attachListeners(access);
        access.onstatechange = handleStateChange;
      })
      .catch((err) => {
        console.error('MIDI Access Failed', err);
        setError(err.message);
      });

    return () => {
      Object.values(pendingTimer).forEach((id) => id && clearTimeout(id));
      // Cleanup listeners
      if (accessObj) {
        accessObj.onstatechange = null;
        accessObj.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { midiAccess, error };
};
