/**
 * js/firebase-config.js — OPC-BĐS (Nguyệt Land) Firebase Client SDK Config
 * Project: opc-nguyet-land
 */

export const firebaseConfig = {
    apiKey: "AIzaSyBkRCeIBASWIqDmLTdwkg9yY065c-knPe4",
    authDomain: "opc-nguyet-land.firebaseapp.com",
    projectId: "opc-nguyet-land",
    storageBucket: "opc-nguyet-land.firebasestorage.app",
    messagingSenderId: "953055559376",
    appId: "1:953055559376:web:49adc419d0c06f41e428d5",
    measurementId: "G-72ES1R5ZMF"
};

// Global attachment for CDN scripts
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}
