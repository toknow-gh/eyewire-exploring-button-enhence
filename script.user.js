// ==UserScript==
// @name         Eyewire Exporing Button Enhence
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  make explore mode buttons draggable and change buttons background color
// @author       toknow-gh
// @match        https://*.eyewire.org/*
// @exclude      https://*.eyewire.org/1.0/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const css = `
        .modeContainer {
            position: fixed !important;
            cursor: move !important;
            user-select: none !important;
            z-index: 9999 !important;
            height: 36px;
            pointer-events: auto;
        }

      .modeContainer > * {
           pointer-events: none;
        }
       #exploreCommit {
            pointer-events: auto !important;
            background-color: green !important;
        }
      #exploreDiscard {
            pointer-events: auto !important;
            background-color: yellow !important;
            color: black !important;
    }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const waitForElement = setInterval(() => {
        const container = document.querySelector('.modeContainer');
        if (container) {
            clearInterval(waitForElement);
            initDrag(container);
        }
    }, 500);

    function initDrag(element) {
        if (!element.style.left && !element.style.top) {
            if(!restorePosition(element))
            {
                element.style.left = '350px';
                element.style.top = '600px';
            }
        }

        let isDragging = false;
        let startX, startY, initialX, initialY;

        element.addEventListener('mousedown', startDrag);
        element.addEventListener('mouseup', () => savePosition(element));
       /* window.addEventListener('DOMContentLoaded', () => {
            const container = document.querySelector('.modeContainer');
            if (container) restorePosition(container);
        });**/

        function savePosition(element) {
            const rect = element.getBoundingClientRect();
            const position = {
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY
            };
            localStorage.setItem('modeContainerPosition', JSON.stringify(position));
        }

        function restorePosition(element) {
            if (!element) return false;

            const saved = localStorage.getItem('modeContainerPosition');
            if (!saved) return false;

            try {
                const position = JSON.parse(saved);
                element.style.position = 'fixed';
                element.style.left = `${position.left}px`;
                element.style.top = `${position.top}px`;
                return true;
            } catch (error) {
                console.error('failed to recovery position:', error);
                return false;
            }
        }

        function startDrag(e) {
            if (e.target !== element) return; // [2](@ref)
            if (e.button !== 0) return;
            isDragging = true;

            startX = e.clientX;
            startY = e.clientY;
            initialX = parseFloat(element.style.left) || 0;
            initialY = parseFloat(element.style.top) || 0;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }

        function drag(e) {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            element.style.left = `${initialX + deltaX}px`;
            element.style.top = `${initialY + deltaY}px`;
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }

        element.ondragstart = () => false;
    }
})();