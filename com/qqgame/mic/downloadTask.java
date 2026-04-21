package com.qqgame.mic;

import java.io.IOException;

class downloadTask extends Thread
{
  private int nID;
  private String strUrl;

  public downloadTask(int paramInt, String paramString)
  {
    this.strUrl = paramString;
    this.nID = paramInt;
  }

  public void run()
  {
    try
    {
      MyImageViewMgr.RequestUrltask(this.nID, this.strUrl);
      MyImageViewMgr.s_isInRequestUrl = false;
      return;
    }
    catch (IOException localIOException)
    {
      while (true)
        localIOException.printStackTrace();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.downloadTask
 * JD-Core Version:    0.6.2
 */