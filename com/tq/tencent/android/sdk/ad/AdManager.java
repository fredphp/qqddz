package com.tq.tencent.android.sdk.ad;

import java.util.ArrayList;

public class AdManager
{
  private static AdManager instance;
  private ArrayList<AdInfo> adInfoList = new ArrayList();

  public static AdManager getInstance()
  {
    if (instance == null)
      instance = new AdManager();
    return instance;
  }

  public ArrayList<AdInfo> getAdInfoList()
  {
    return this.adInfoList;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.ad.AdManager
 * JD-Core Version:    0.6.2
 */