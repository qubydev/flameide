import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardShortcut = (keys, callback, options = {}) => {
    const {
        preventDefault = true,
        stopPropagation = false,
        target = 'document',
        enabled = true
    } = options;

    const handlerRef = useRef();
    handlerRef.current = callback;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (event) => {
            const pressedKeys = [];
            if (event.ctrlKey) pressedKeys.push('ctrl');
            if (event.metaKey) pressedKeys.push('meta');
            if (event.shiftKey) pressedKeys.push('shift');
            if (event.altKey) pressedKeys.push('alt');

            const mainKey = event.key.toLowerCase();
            if (!['control', 'meta', 'shift', 'alt'].includes(mainKey)) {
                pressedKeys.push(mainKey);
            }

            const targetKeys = Array.isArray(keys) ? keys.map(k => k.toLowerCase()) : [keys.toLowerCase()];
            const keysMatch = targetKeys.every(key => pressedKeys.includes(key)) &&
                targetKeys.length === pressedKeys.length;

            if (keysMatch) {
                if (preventDefault) event.preventDefault();
                if (stopPropagation) event.stopPropagation();
                handlerRef.current(event);
            }
        };

        const targetElement = target === 'document' ? document :
            target === 'window' ? window :
                target;

        targetElement.addEventListener('keydown', handleKeyPress);

        return () => {
            targetElement.removeEventListener('keydown', handleKeyPress);
        };
    }, [keys, preventDefault, stopPropagation, target, enabled]);
};

export const useGlobalShortcut = (keyCombo, callback, enabled = true) => {
    const callbackRef = useRef();
    callbackRef.current = callback;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            const combo = keyCombo.toLowerCase();
            let pressedCombo = '';

            if (e.ctrlKey || e.metaKey) pressedCombo += 'ctrl+';
            if (e.shiftKey) pressedCombo += 'shift+';
            if (e.altKey) pressedCombo += 'alt+';
            pressedCombo += e.key.toLowerCase();

            if (pressedCombo === combo) {
                e.preventDefault();
                callbackRef.current(e);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [keyCombo, enabled]);
};