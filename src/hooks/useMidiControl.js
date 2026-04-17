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

    const handleMIDIMessage = (message) => {
      if (callbackRef.current) {
        callbackRef.current(message.data);
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
  }, [onMidiMessage]);

  return { midiAccess, error };
};
