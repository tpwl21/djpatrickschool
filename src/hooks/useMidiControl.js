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

    const handleMIDIMessage = (message) => {
      const data = message.data;
      const status = data[0];
      const type = status & 0xF0;
      const note = data[1];
      
      // SAFETY SHIELD: Prevent browser saturation by dropping high-frequency CC messages.
      // 0xB0 is the status for Control Change (Pitch/Jog/Knobs).
      if (type === 0xB0) {
        const now = performance.now();
        const last = lastCCNoteTime[note] || 0;
        if (now - last < 10) return; // Hard cap at 100Hz per control to avoid I/O flooding
        lastCCNoteTime[note] = now;
      }

      if (callbackRef.current) {
        callbackRef.current(data);
      }
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
