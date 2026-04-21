package org.cocos2dx.lib;

import android.content.Context;
import android.content.res.AssetManager;
import android.media.SoundPool;
import android.os.Handler;
import android.util.Log;
import java.io.PrintStream;
import java.util.HashMap;

public class Cocos2dxSound
{
  private static final int MAX_SIMULTANEOUS_STREAMS_DEFAULT = 5;
  private static final int SOUND_LOOP_TIME = 0;
  private static final int SOUND_PRIORITY = 1;
  private static final int SOUND_QUALITY = 5;
  private static final float SOUND_RATE = 1.0F;
  private static final String TAG = "Cocos2dxSound";
  private final int INVALID_SOUND_ID = -1;
  private final int INVALID_STREAM_ID = -1;
  private final int NOTREADY_STREAM = 0;
  private Context mContext;
  private float mLeftVolume;
  private HashMap<String, Integer> mPathSoundIDMap;
  private float mRightVolume;
  private HashMap<Integer, Integer> mSoundIdStreamIdMap;
  private SoundPool mSoundPool;

  public Cocos2dxSound(Context paramContext)
  {
    this.mContext = paramContext;
    initData();
  }

  private void initData()
  {
    this.mSoundIdStreamIdMap = new HashMap();
    this.mSoundPool = new SoundPool(5, 3, 5);
    this.mPathSoundIDMap = new HashMap();
    this.mLeftVolume = 0.5F;
    this.mRightVolume = 0.5F;
  }

  private void playSoundDelayed(final String paramString, final long paramLong)
  {
    new Runnable()
    {
      public void run()
      {
        if ((Cocos2dxSound.this.playEffect(paramString) == 0) && (!Cocos2dxActivity.handler.postDelayed(this, paramLong)))
          System.err.println("playSound_Delayed::mHandler.postAtTime FAILED!");
      }
    }
    .run();
  }

  public int createSoundIdFromAsset(String paramString)
  {
    try
    {
      int i = this.mSoundPool.load(this.mContext.getAssets().openFd(paramString), 0);
      return i;
    }
    catch (Exception localException)
    {
      Log.e("Cocos2dxSound", "error: " + localException.getMessage(), localException);
    }
    return -1;
  }

  public void end()
  {
    this.mSoundPool.release();
    this.mPathSoundIDMap.clear();
    this.mSoundIdStreamIdMap.clear();
    initData();
  }

  public float getEffectsVolume()
  {
    return (this.mLeftVolume + this.mRightVolume) / 2.0F;
  }

  public int playEffect(String paramString)
  {
    Integer localInteger = (Integer)this.mPathSoundIDMap.get(paramString);
    if (localInteger != null)
    {
      int i = this.mSoundPool.play(localInteger.intValue(), this.mLeftVolume, this.mRightVolume, 1, 0, 1.0F);
      System.out.println(i);
      if (i == 0)
        return 0;
      this.mSoundIdStreamIdMap.put(localInteger, Integer.valueOf(i));
    }
    while (true)
    {
      return localInteger.intValue();
      localInteger = Integer.valueOf(preloadEffect(paramString));
      if (localInteger.intValue() == -1)
        return -1;
      playSoundDelayed(paramString, 100L);
    }
  }

  public int preloadEffect(String paramString)
  {
    int i;
    if (this.mPathSoundIDMap.get(paramString) != null)
      i = ((Integer)this.mPathSoundIDMap.get(paramString)).intValue();
    do
    {
      return i;
      i = createSoundIdFromAsset(paramString);
    }
    while (i == -1);
    this.mSoundIdStreamIdMap.put(Integer.valueOf(i), Integer.valueOf(-1));
    this.mPathSoundIDMap.put(paramString, Integer.valueOf(i));
    return i;
  }

  public void setEffectsVolume(float paramFloat)
  {
    if (paramFloat < 0.0F)
      paramFloat = 0.0F;
    if (paramFloat > 1.0F)
      paramFloat = 1.0F;
    this.mRightVolume = paramFloat;
    this.mLeftVolume = paramFloat;
  }

  public void stopEffect(int paramInt)
  {
    Integer localInteger = (Integer)this.mSoundIdStreamIdMap.get(Integer.valueOf(paramInt));
    if ((localInteger != null) && (localInteger.intValue() != -1))
      this.mSoundPool.stop(localInteger.intValue());
  }

  public void unloadEffect(String paramString)
  {
    Integer localInteger = (Integer)this.mPathSoundIDMap.remove(paramString);
    if (localInteger != null)
    {
      this.mSoundPool.unload(localInteger.intValue());
      this.mSoundIdStreamIdMap.remove(localInteger);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxSound
 * JD-Core Version:    0.6.2
 */