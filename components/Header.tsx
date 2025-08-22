import React from 'react';

export const Header: React.FC = () => (
    <header className="text-center p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-400">
            Bosch-Thermotechnik - ASCII 40 Data Formatter
        </h1>
        <p className="mt-2 text-md sm:text-lg text-slate-400 max-w-3xl mx-auto">
            Laden Sie Ihre Quelldaten und ein Beispiel für das gewünschte Ausgabeformat hoch. Die KI formatiert Ihre Daten und stellt das Ergebnis als TXT-Datei zum Kopieren und Herunterladen bereit.
        </p>
    </header>
);