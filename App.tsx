// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const ignoreNextSession = useRef(false);

  const setIgnore = (val: boolean) => {
    ignoreNextSession.current = val;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (ignoreNextSession.current) {
          ignoreNextSession.current = false;
          return;
        }
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <AppNavigator session={session} setIgnore={setIgnore} />
    </NavigationContainer>
  );
}