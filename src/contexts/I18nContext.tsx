'use client';

import React, { createContext, useContext } from 'react';

type Messages = Record<string, any>;

const I18nContext = createContext<Messages>({});

export function I18nProvider({ children, messages }: { children: React.ReactNode, messages: Messages }) {
    return (
        <I18nContext.Provider value={messages}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslations(namespace?: string) {
    const messages = useContext(I18nContext);

    return function t(key: string, params?: Record<string, any>): any {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const keys = fullKey.split('.');

        let value: any = messages;
        for (const k of keys) {
            value = value?.[k];
        }

        // Support returnObjects option via params logic (checking if params matches expected options structure)
        // Typically next-intl uses a second arg for options, but our custom hook signature is t(key, params).
        // Let's adhere to the calling code: t('key', { returnObjects: true })
        
        const returnObjects = params?.returnObjects === true;

        if (value === undefined) {
             if (process.env.NODE_ENV === 'development') {
                console.warn(`[I18n] Missing translation for key: "${fullKey}"`);
            }
            return fullKey;
        }

        if (typeof value !== 'string' && !returnObjects) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[I18n] Key "${fullKey}" returns an object/array but returnObjects is not set.`);
            }
            return fullKey; // Fallback if strictly expecting string but got object without explicit opt-in
        }

        if (typeof value !== 'string') {
            return value; // Return object/array directly
        }

        // Simple parameter replacement for strings
        if (params && !returnObjects) {
            return Object.keys(params).reduce((str, param) => {
                return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(params[param]));
            }, value);
        }

        return value;
    };
}