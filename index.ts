import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';
import App from './App';

// Disable native RTL permanently: layout direction is controlled manually in React
// via isRTL (row-reverse, flex-end, textAlign) so a restart won't double-flip the UI.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

registerRootComponent(App);
