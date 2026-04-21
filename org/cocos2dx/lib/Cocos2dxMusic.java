package org.cocos2dx.lib;

import android.content.Context;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.util.Log;

public class Cocos2dxMusic
{
  private static final String TAG = "Cocos2dxMusic";
  private MediaPlayer mBackgroundMediaPlayer;
  private Context mContext;
  private String mCurrentPath;
  private boolean mIsPaused;
  private float mLeftVolume;
  private float mRightVolume;

  public Cocos2dxMusic(Context paramContext)
  {
    this.mContext = paramContext;
    initData();
  }

  // ERROR //
  private MediaPlayer createMediaplayerFromAssets(String paramString)
  {
    // Byte code:
    //   0: aload_0
    //   1: getfield 25	org/cocos2dx/lib/Cocos2dxMusic:mContext	Landroid/content/Context;
    //   4: invokevirtual 48	android/content/Context:getAssets	()Landroid/content/res/AssetManager;
    //   7: aload_1
    //   8: invokevirtual 54	android/content/res/AssetManager:openFd	(Ljava/lang/String;)Landroid/content/res/AssetFileDescriptor;
    //   11: astore 4
    //   13: new 56	android/media/MediaPlayer
    //   16: dup
    //   17: invokespecial 57	android/media/MediaPlayer:<init>	()V
    //   20: astore 5
    //   22: aload 5
    //   24: aload 4
    //   26: invokevirtual 63	android/content/res/AssetFileDescriptor:getFileDescriptor	()Ljava/io/FileDescriptor;
    //   29: aload 4
    //   31: invokevirtual 67	android/content/res/AssetFileDescriptor:getStartOffset	()J
    //   34: aload 4
    //   36: invokevirtual 70	android/content/res/AssetFileDescriptor:getLength	()J
    //   39: invokevirtual 74	android/media/MediaPlayer:setDataSource	(Ljava/io/FileDescriptor;JJ)V
    //   42: aload 5
    //   44: invokevirtual 77	android/media/MediaPlayer:prepare	()V
    //   47: aload 5
    //   49: aload_0
    //   50: getfield 79	org/cocos2dx/lib/Cocos2dxMusic:mLeftVolume	F
    //   53: aload_0
    //   54: getfield 81	org/cocos2dx/lib/Cocos2dxMusic:mRightVolume	F
    //   57: invokevirtual 85	android/media/MediaPlayer:setVolume	(FF)V
    //   60: aload 5
    //   62: areturn
    //   63: astore_2
    //   64: ldc 8
    //   66: new 87	java/lang/StringBuilder
    //   69: dup
    //   70: invokespecial 88	java/lang/StringBuilder:<init>	()V
    //   73: ldc 90
    //   75: invokevirtual 94	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   78: aload_2
    //   79: invokevirtual 98	java/lang/Exception:getMessage	()Ljava/lang/String;
    //   82: invokevirtual 94	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   85: invokevirtual 101	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   88: aload_2
    //   89: invokestatic 107	android/util/Log:e	(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I
    //   92: pop
    //   93: aconst_null
    //   94: areturn
    //   95: astore_2
    //   96: goto -32 -> 64
    //
    // Exception table:
    //   from	to	target	type
    //   0	22	63	java/lang/Exception
    //   22	60	95	java/lang/Exception
  }

  private void initData()
  {
    this.mLeftVolume = 0.5F;
    this.mRightVolume = 0.5F;
    this.mBackgroundMediaPlayer = null;
    this.mIsPaused = false;
    this.mCurrentPath = null;
  }

  private native void playcomplete(String paramString);

  public void end()
  {
    if (this.mBackgroundMediaPlayer != null)
      this.mBackgroundMediaPlayer.release();
    initData();
  }

  public float getBackgroundVolume()
  {
    if (this.mBackgroundMediaPlayer != null)
      return (this.mLeftVolume + this.mRightVolume) / 2.0F;
    return 0.0F;
  }

  public int getCurrPos()
  {
    if ((this.mBackgroundMediaPlayer != null) && (this.mBackgroundMediaPlayer.isPlaying()))
      return this.mBackgroundMediaPlayer.getCurrentPosition();
    return 0;
  }

  public boolean isBackgroundMusicPlaying()
  {
    if (this.mBackgroundMediaPlayer == null)
      return false;
    return this.mBackgroundMediaPlayer.isPlaying();
  }

  public void onCompletion(MediaPlayer paramMediaPlayer)
  {
    if (paramMediaPlayer != null)
      paramMediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener()
      {
        public void onCompletion(MediaPlayer paramAnonymousMediaPlayer)
        {
          try
          {
            Cocos2dxMusic.this.playcomplete(Cocos2dxMusic.this.mCurrentPath);
            Log.i("Cocos2dxMusic", "fisher>>onCompletion: \"" + Cocos2dxMusic.this.mCurrentPath + "\" completed!");
            return;
          }
          catch (Exception localException)
          {
            Log.e("Cocos2dxMusic", "fisher>>onCompletion: mBackgroundMediaPlayer release erro");
          }
        }
      });
  }

  public void pauseBackgroundMusic()
  {
    if ((this.mBackgroundMediaPlayer != null) && (this.mBackgroundMediaPlayer.isPlaying()))
    {
      this.mBackgroundMediaPlayer.pause();
      this.mIsPaused = true;
    }
  }

  public void playBackgroundMusic(String paramString, boolean paramBoolean)
  {
    int i;
    if (this.mCurrentPath == null)
    {
      this.mBackgroundMediaPlayer = createMediaplayerFromAssets(paramString);
      i = 1;
      this.mCurrentPath = paramString;
    }
    while (this.mBackgroundMediaPlayer == null)
    {
      Log.e("Cocos2dxMusic", "playBackgroundMusic: background media player is null");
      return;
      boolean bool = this.mCurrentPath.equals(paramString);
      i = 0;
      if (!bool)
      {
        if (this.mBackgroundMediaPlayer != null)
          this.mBackgroundMediaPlayer.release();
        this.mBackgroundMediaPlayer = createMediaplayerFromAssets(paramString);
        i = 1;
        this.mCurrentPath = paramString;
      }
    }
    this.mBackgroundMediaPlayer.stop();
    this.mBackgroundMediaPlayer.setLooping(paramBoolean);
    if (i != 0);
    try
    {
      onCompletion(this.mBackgroundMediaPlayer);
      this.mBackgroundMediaPlayer.prepare();
      this.mBackgroundMediaPlayer.seekTo(0);
      this.mBackgroundMediaPlayer.start();
      this.mIsPaused = false;
      return;
    }
    catch (Exception localException)
    {
      Log.e("Cocos2dxMusic", "playBackgroundMusic: error state");
    }
  }

  public void restoreBackgroundMusic(String paramString, int paramInt, boolean paramBoolean)
  {
    int i;
    if (this.mCurrentPath == null)
    {
      this.mBackgroundMediaPlayer = createMediaplayerFromAssets(paramString);
      i = 1;
      this.mCurrentPath = paramString;
    }
    while (this.mBackgroundMediaPlayer == null)
    {
      Log.e("Cocos2dxMusic", "playBackgroundMusic: background media player is null");
      return;
      boolean bool = this.mCurrentPath.equals(paramString);
      i = 0;
      if (!bool)
      {
        if (this.mBackgroundMediaPlayer != null)
          this.mBackgroundMediaPlayer.release();
        this.mBackgroundMediaPlayer = createMediaplayerFromAssets(paramString);
        i = 1;
        this.mCurrentPath = paramString;
      }
    }
    this.mBackgroundMediaPlayer.stop();
    this.mBackgroundMediaPlayer.setLooping(paramBoolean);
    if (i != 0);
    try
    {
      onCompletion(this.mBackgroundMediaPlayer);
      this.mBackgroundMediaPlayer.prepare();
      this.mBackgroundMediaPlayer.seekTo(paramInt);
      this.mBackgroundMediaPlayer.start();
      this.mIsPaused = false;
      return;
    }
    catch (Exception localException)
    {
      Log.e("Cocos2dxMusic", "playBackgroundMusic: error state");
    }
  }

  public void resumeBackgroundMusic()
  {
    if ((this.mBackgroundMediaPlayer != null) && (this.mIsPaused))
    {
      this.mBackgroundMediaPlayer.start();
      this.mIsPaused = false;
    }
  }

  public void rewindBackgroundMusic()
  {
    if (this.mBackgroundMediaPlayer != null)
      this.mBackgroundMediaPlayer.stop();
    try
    {
      this.mBackgroundMediaPlayer.prepare();
      this.mBackgroundMediaPlayer.seekTo(0);
      this.mBackgroundMediaPlayer.start();
      this.mIsPaused = false;
      return;
    }
    catch (Exception localException)
    {
      Log.e("Cocos2dxMusic", "rewindBackgroundMusic: error state");
    }
  }

  public void setBackgroundVolume(float paramFloat)
  {
    this.mRightVolume = paramFloat;
    this.mLeftVolume = paramFloat;
    if (this.mBackgroundMediaPlayer != null)
      this.mBackgroundMediaPlayer.setVolume(this.mLeftVolume, this.mRightVolume);
  }

  public void stopBackgroundMusic()
  {
    if (this.mBackgroundMediaPlayer != null)
    {
      this.mBackgroundMediaPlayer.stop();
      this.mIsPaused = false;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxMusic
 * JD-Core Version:    0.6.2
 */