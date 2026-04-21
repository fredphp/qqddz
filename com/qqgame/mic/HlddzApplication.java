package com.qqgame.mic;

import android.app.Application;
import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;

public class HlddzApplication extends Application
{
  public void onCreate()
  {
    super.onCreate();
    AppInfoConfig.setAPP_ID("900000920");
    AppInfoConfig.setAPP_KEY("M0Vv4trq0ic2LNaO");
    AppInfoConfig.setB_LOG_OPEN(false);
    AppInfoConfig.setB_TEST_ENVIRONMENT(false);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.HlddzApplication
 * JD-Core Version:    0.6.2
 */