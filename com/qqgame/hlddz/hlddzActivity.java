package com.qqgame.hlddz;

import android.os.Bundle;
import com.qqgame.mic.MicActivity;

public class hlddzActivity extends MicActivity
{
  static
  {
    System.loadLibrary("CocosDenshion");
    System.loadLibrary("HLDDZ");
    System.loadLibrary("openglview");
    System.loadLibrary("sdktosnscore");
  }

  public void onCreate(Bundle paramBundle)
  {
    super.onCreate(paramBundle);
  }

  protected void onDestroy()
  {
    super.onDestroy();
  }

  protected void onPause()
  {
    super.onPause();
  }

  protected void onResume()
  {
    super.onResume();
  }

  protected void onStop()
  {
    super.onStop();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.hlddz.hlddzActivity
 * JD-Core Version:    0.6.2
 */