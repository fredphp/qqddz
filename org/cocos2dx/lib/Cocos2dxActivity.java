package org.cocos2dx.lib;

import android.app.Activity;
import android.app.AlertDialog.Builder;
import android.app.Application;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import java.util.Locale;

public class Cocos2dxActivity extends Activity
{
  private static final int HANDLER_SHOW_DIALOG = 1;
  private static Cocos2dxAccelerometer accelerometer;
  private static boolean accelerometerEnabled = false;
  private static boolean bIsLoopBKMusic;
  private static boolean bIsLoopVoice;
  private static Cocos2dxMusic backgroundMusicPlayer = null;
  private static String filenameBKMusic = null;
  private static String filenameVoice = null;
  static Handler handler;
  private static String packageName;
  private static int posBKMusic;
  private static int posVoice;
  public static int screenHeight;
  public static int screenWidth;
  private static Cocos2dxSound soundPlayer;
  private static Cocos2dxMusic voiceMusicPlayer = null;
  private final float layoutHeight = 320.0F;
  private final float layoutWidth = 480.0F;

  static
  {
    soundPlayer = null;
  }

  public static void disableAccelerometer()
  {
    accelerometerEnabled = false;
    accelerometer.disable();
  }

  public static void enableAccelerometer()
  {
    accelerometerEnabled = true;
    accelerometer.enable();
  }

  public static void end()
  {
    backgroundMusicPlayer.end();
    voiceMusicPlayer.end();
    soundPlayer.end();
  }

  public static float getBackgroundMusicVolume()
  {
    return backgroundMusicPlayer.getBackgroundVolume();
  }

  public static String getCocos2dxPackageName()
  {
    return packageName;
  }

  public static String getCurrentLanguage()
  {
    return Locale.getDefault().getLanguage();
  }

  public static float getEffectsVolume()
  {
    return soundPlayer.getEffectsVolume();
  }

  public static float getVoiceMusicVolume()
  {
    return voiceMusicPlayer.getBackgroundVolume();
  }

  public static boolean isBackgroundMusicPlaying()
  {
    return backgroundMusicPlayer.isBackgroundMusicPlaying();
  }

  public static boolean isVoiceMusicPlaying()
  {
    return voiceMusicPlayer.isBackgroundMusicPlaying();
  }

  private static native void nativeSetPaths(String paramString1, String paramString2);

  public static void pauseBackgroundMusic()
  {
    backgroundMusicPlayer.pauseBackgroundMusic();
  }

  public static void pauseVoiceMusic()
  {
    voiceMusicPlayer.pauseBackgroundMusic();
  }

  public static void playBackgroundMusic(String paramString, boolean paramBoolean)
  {
    filenameBKMusic = paramString;
    bIsLoopBKMusic = paramBoolean;
    backgroundMusicPlayer.playBackgroundMusic(paramString, paramBoolean);
  }

  public static int playEffect(String paramString)
  {
    return soundPlayer.playEffect(paramString);
  }

  public static void playVoiceMusic(String paramString, boolean paramBoolean)
  {
    filenameVoice = paramString;
    bIsLoopVoice = paramBoolean;
    voiceMusicPlayer.playBackgroundMusic(paramString, paramBoolean);
  }

  public static void preloadEffect(String paramString)
  {
    soundPlayer.preloadEffect(paramString);
  }

  public static void resumeBackgroundMusic()
  {
    backgroundMusicPlayer.resumeBackgroundMusic();
  }

  public static void resumeVoiceMusic()
  {
    voiceMusicPlayer.resumeBackgroundMusic();
  }

  public static void rewindBackgroundMusic()
  {
    backgroundMusicPlayer.rewindBackgroundMusic();
  }

  public static void rewindVoiceMusic()
  {
    voiceMusicPlayer.rewindBackgroundMusic();
  }

  public static void setBackgroundMusicVolume(float paramFloat)
  {
    backgroundMusicPlayer.setBackgroundVolume(paramFloat);
  }

  public static void setEffectsVolume(float paramFloat)
  {
    soundPlayer.setEffectsVolume(paramFloat);
  }

  public static void setVoiceMusicVolume(float paramFloat)
  {
    voiceMusicPlayer.setBackgroundVolume(paramFloat);
  }

  private void showDialog(String paramString1, String paramString2)
  {
    new AlertDialog.Builder(this).setTitle(paramString1).setMessage(paramString2).setPositiveButton("Ok", new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
      }
    }).create().show();
  }

  public static void showMessageBox(String paramString1, String paramString2)
  {
    Message localMessage = handler.obtainMessage();
    localMessage.what = 1;
    localMessage.obj = new DialogMessage(paramString1, paramString2);
    handler.sendMessage(localMessage);
  }

  public static void stopBackgroundMusic()
  {
    backgroundMusicPlayer.stopBackgroundMusic();
  }

  public static void stopEffect(int paramInt)
  {
    soundPlayer.stopEffect(paramInt);
  }

  public static void stopVoiceMusic()
  {
    voiceMusicPlayer.stopBackgroundMusic();
  }

  public static void unloadEffect(String paramString)
  {
    soundPlayer.unloadEffect(paramString);
  }

  protected void onCreate(Bundle paramBundle)
  {
    super.onCreate(paramBundle);
    accelerometer = new Cocos2dxAccelerometer(this);
    if (backgroundMusicPlayer == null)
      backgroundMusicPlayer = new Cocos2dxMusic(this);
    while (true)
    {
      if (voiceMusicPlayer == null)
        voiceMusicPlayer = new Cocos2dxMusic(this);
      if (soundPlayer == null)
        soundPlayer = new Cocos2dxSound(this);
      handler = new Handler()
      {
        public void handleMessage(Message paramAnonymousMessage)
        {
          switch (paramAnonymousMessage.what)
          {
          default:
            return;
          case 1:
          }
          Cocos2dxActivity.this.showDialog(((DialogMessage)paramAnonymousMessage.obj).title, ((DialogMessage)paramAnonymousMessage.obj).message);
        }
      };
      return;
      backgroundMusicPlayer.stopBackgroundMusic();
    }
  }

  protected void onPause()
  {
    super.onPause();
    if (accelerometerEnabled)
      accelerometer.disable();
    posBKMusic = backgroundMusicPlayer.getCurrPos();
    pauseBackgroundMusic();
  }

  protected void onRestoreInstanceState(Bundle paramBundle)
  {
    Log.e("hlddz", "onRestoreInstanceState" + paramBundle);
    filenameBKMusic = paramBundle.getString("filenameBKMusic");
    if (filenameBKMusic != null)
    {
      Log.e("hlddz", "filenameBKMusic != null");
      posBKMusic = paramBundle.getInt("posBKMusic");
      bIsLoopBKMusic = paramBundle.getBoolean("bIsLoopBKMusic");
      backgroundMusicPlayer.restoreBackgroundMusic(filenameBKMusic, posBKMusic, bIsLoopBKMusic);
    }
    if (filenameVoice != null)
    {
      Log.e("hlddz", "filenameVoice != null");
      filenameVoice = paramBundle.getString("filenameVoice");
      posVoice = paramBundle.getInt("posVoice");
      voiceMusicPlayer.restoreBackgroundMusic(filenameVoice, posVoice, bIsLoopVoice);
    }
    super.onRestoreInstanceState(paramBundle);
  }

  protected void onResume()
  {
    super.onResume();
    if (accelerometerEnabled)
      accelerometer.enable();
    resumeBackgroundMusic();
  }

  protected void onSaveInstanceState(Bundle paramBundle)
  {
    Log.e("hlddz", "onSaveInstanceState" + paramBundle);
    if (backgroundMusicPlayer.isBackgroundMusicPlaying())
    {
      Log.e("hlddz", "backgroundMusicPlayer.isBackgroundMusicPlaying");
      paramBundle.putString("filenameBKMusic", filenameBKMusic);
      paramBundle.putInt("posBKMusic", posBKMusic);
      paramBundle.putBoolean("IsLoopBKMusic", bIsLoopBKMusic);
      if (!voiceMusicPlayer.isBackgroundMusicPlaying())
        break label144;
      Log.e("hlddz", "voiceMusicPlayer.isBackgroundMusicPlaying");
      paramBundle.putString("filenameVoice", filenameVoice);
      paramBundle.putInt("posVoice", posVoice);
      paramBundle.putBoolean("IsLoopBKMusic", bIsLoopVoice);
    }
    while (true)
    {
      super.onSaveInstanceState(paramBundle);
      return;
      Log.e("hlddz", "filenameBKMusic = null");
      filenameBKMusic = null;
      break;
      label144: Log.e("hlddz", "filenameVoice = null");
      filenameVoice = null;
    }
  }

  protected void setPackageName(String paramString)
  {
    packageName = paramString;
    PackageManager localPackageManager = getApplication().getPackageManager();
    try
    {
      ApplicationInfo localApplicationInfo = localPackageManager.getApplicationInfo(paramString, 0);
      String str = localApplicationInfo.sourceDir;
      Log.w("apk path", str);
      nativeSetPaths(str, paramString);
      return;
    }
    catch (PackageManager.NameNotFoundException localNameNotFoundException)
    {
      localNameNotFoundException.printStackTrace();
    }
    throw new RuntimeException("Unable to locate assets, aborting...");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxActivity
 * JD-Core Version:    0.6.2
 */