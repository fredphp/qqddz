package org.cocos2dx.lib;

import android.opengl.GLSurfaceView.Renderer;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public class Cocos2dxRenderer
  implements GLSurfaceView.Renderer
{
  private static final long NANOSECONDSPERMINISECOND = 1000000L;
  private static final long NANOSECONDSPERSECOND = 1000000000L;
  private static long animationInterval = 33333333L;
  static boolean s_binit = false;
  static boolean s_bneedReload = false;
  public static boolean s_loadFinish = false;
  public boolean creatSurface = false;
  private long last;

  private static native void nativeDeleteBackward();

  private static native String nativeGetContentText();

  private static native void nativeInit(int paramInt1, int paramInt2);

  private static native void nativeInsertText(String paramString);

  private static native boolean nativeKeyDown(int paramInt);

  private static native void nativeOnOptionsItemSelected(int paramInt);

  private static native void nativeOnPause();

  private static native void nativeOnResume();

  public static native void nativeOnTimer(int paramInt);

  private static native void nativeReloadTex(int paramInt1, int paramInt2);

  private static native void nativeRender();

  private static native void nativeTouchesBegin(int paramInt, float paramFloat1, float paramFloat2);

  private static native void nativeTouchesCancel(int[] paramArrayOfInt, float[] paramArrayOfFloat1, float[] paramArrayOfFloat2);

  private static native void nativeTouchesEnd(int paramInt, float paramFloat1, float paramFloat2);

  private static native void nativeTouchesMove(int[] paramArrayOfInt, float[] paramArrayOfFloat1, float[] paramArrayOfFloat2);

  public static void setAnimationInterval(double paramDouble)
  {
    animationInterval = ()(1000000000.0D * paramDouble);
  }

  public String getContentText()
  {
    return nativeGetContentText();
  }

  public void handleActionCancel(int[] paramArrayOfInt, float[] paramArrayOfFloat1, float[] paramArrayOfFloat2)
  {
    nativeTouchesCancel(paramArrayOfInt, paramArrayOfFloat1, paramArrayOfFloat2);
  }

  public void handleActionDown(int paramInt, float paramFloat1, float paramFloat2)
  {
    nativeTouchesBegin(paramInt, paramFloat1, paramFloat2);
  }

  public void handleActionMove(int[] paramArrayOfInt, float[] paramArrayOfFloat1, float[] paramArrayOfFloat2)
  {
    nativeTouchesMove(paramArrayOfInt, paramArrayOfFloat1, paramArrayOfFloat2);
  }

  public void handleActionUp(int paramInt, float paramFloat1, float paramFloat2)
  {
    nativeTouchesEnd(paramInt, paramFloat1, paramFloat2);
  }

  public void handleDeleteBackward()
  {
    nativeDeleteBackward();
  }

  public void handleInsertText(String paramString)
  {
    nativeInsertText(paramString);
  }

  public void handleKeyDown(int paramInt)
  {
    nativeKeyDown(paramInt);
  }

  public void handleOnPause()
  {
    nativeOnPause();
  }

  public void handleOnResume()
  {
    nativeOnResume();
  }

  public void handleOnTimer(int paramInt)
  {
    nativeOnTimer(paramInt);
  }

  public void handleonOptionsItemSelected(int paramInt)
  {
    nativeOnOptionsItemSelected(paramInt);
  }

  public void onDrawFrame(GL10 paramGL10)
  {
    long l1 = System.nanoTime();
    long l2 = l1 - this.last;
    if ((s_loadFinish == true) && (this.creatSurface == true))
      nativeRender();
    if (l2 < animationInterval);
    try
    {
      Thread.sleep(2L * (animationInterval - l2) / 1000000L);
      label56: this.last = l1;
      return;
    }
    catch (Exception localException)
    {
      break label56;
    }
  }

  public void onSurfaceChanged(GL10 paramGL10, int paramInt1, int paramInt2)
  {
    paramGL10.glDisable(3024);
    if ((paramInt1 < paramInt2) && (s_bneedReload))
      s_loadFinish = false;
    do
    {
      do
        return;
      while ((Cocos2dxActivity.screenWidth == paramInt1) && (Cocos2dxActivity.screenHeight == paramInt2) && (!s_bneedReload));
      Cocos2dxActivity.screenWidth = paramInt1;
      Cocos2dxActivity.screenHeight = paramInt2;
      if (!s_binit)
      {
        nativeInit(Cocos2dxActivity.screenWidth, Cocos2dxActivity.screenHeight);
        s_loadFinish = true;
        s_binit = true;
        return;
      }
    }
    while (!s_bneedReload);
    nativeReloadTex(Cocos2dxActivity.screenWidth, Cocos2dxActivity.screenHeight);
    s_loadFinish = true;
    s_bneedReload = false;
  }

  public void onSurfaceCreated(GL10 paramGL10, EGLConfig paramEGLConfig)
  {
    s_bneedReload = true;
    this.creatSurface = true;
    s_loadFinish = false;
    this.last = System.nanoTime();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxRenderer
 * JD-Core Version:    0.6.2
 */