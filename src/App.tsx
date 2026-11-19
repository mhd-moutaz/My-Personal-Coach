/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isRTL = lang === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D12',
        color: '#F8F9FE',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: '#1A1A24',
          borderRadius: '16px',
          border: '1px solid #2B2B3B',
          padding: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#00E676',
            }}
          >
            {isRTL ? 'المرحلة ١ · Expo / React Native' : 'Phase 1 · Expo / React Native'}
          </span>
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            style={{
              backgroundColor: '#222230',
              color: '#F8F9FE',
              border: '1px solid #2B2B3B',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 10px' }}>
          {isRTL ? 'مدربي الشخصي' : 'My Personal Coach'}
        </h1>
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#A1A3B5',
            margin: '0 0 20px',
          }}
        >
          {isRTL
            ? 'تطبيق جوال مبني بـ Expo و React Native ويعمل دون اتصال بالإنترنت عبر AsyncStorage وقواعد حسابية محلية.'
            : 'Offline-first mobile app built with Expo and React Native using local AsyncStorage and deterministic fitness & nutrition rule engines.'}
        </p>

        <div
          style={{
            backgroundColor: '#13131C',
            borderRadius: '12px',
            border: '1px solid #2B2B3B',
            padding: '14px 16px',
            marginBottom: '16px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#FF5E36',
            direction: 'ltr',
            textAlign: 'left',
          }}
        >
          npm run expo:start
        </div>

        <p
          style={{
            fontSize: '12.5px',
            color: '#707388',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {isRTL
            ? 'هذه الخطة إرشادية عامة وليست نصيحة طبية.'
            : 'This plan is general guidance, not medical advice.'}
        </p>
      </div>
    </div>
  );
}
