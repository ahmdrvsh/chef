import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { PushNotifications } from '@capacitor/push-notifications';

export const isNative = Capacitor.isNativePlatform();

export const initCapacitor = async () => {
  if (!isNative) return;

  try {
    // Status Bar
    await StatusBar.setStyle({ style: Style.Light });
    
    // Splash Screen
    await SplashScreen.hide();

    // Push Notifications (safe registration)
    try {
      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive === 'granted') {
        await PushNotifications.register();
      }

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });
    } catch (pushErr) {
      console.log('Push notifications not available on this platform/emulator', pushErr);
    }

    // Robust Deep links parsing (without fragile .com split)
    CapacitorApp.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
      try {
        const parsedUrl = new URL(data.url);
        const relativePath = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        if (relativePath) {
          window.location.hash = relativePath; // or window.location.href = relativePath for hash/history router
        }
      } catch (e) {
        console.error('Failed to parse deep link URL:', e);
      }
    });

    // Android Back Button handling
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (window.location.pathname !== '/' && window.location.pathname !== '/recipes' && canGoBack) {
        window.history.back();
      } else {
        // Confirm exit or minimize if on main tab
        const confirmExit = window.confirm('آیا می‌خواهید از برنامه خارج شوید؟');
        if (confirmExit) {
          CapacitorApp.exitApp();
        }
      }
    });

  } catch (error) {
    console.error('Capacitor initialization error:', error);
  }
};

export const nativeShare = async (title: string, text: string, url: string) => {
  if (isNative) {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'اشتراک‌گذاری',
    });
  } else if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch(e) {
      console.log('share failed', e);
    }
  } else {
    // fallback
    await navigator.clipboard.writeText(`${title} - ${url}`);
    alert('لینک کپی شد!');
  }
};

export const openExternalLink = async (url: string) => {
  if (isNative) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

