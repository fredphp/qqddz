package com.tq.tencent.android.sdk.communicator;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AsyncHttpConnectionManager
{
  public static final int MAX_CONNECTIONS = 5;
  private static AsyncHttpConnectionManager instance;
  private ExecutorService mThreadPool = Executors.newFixedThreadPool(5);

  public static AsyncHttpConnectionManager getInstance()
  {
    if (instance == null)
      instance = new AsyncHttpConnectionManager();
    return instance;
  }

  public void submit(Runnable paramRunnable)
  {
    this.mThreadPool.submit(paramRunnable);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.communicator.AsyncHttpConnectionManager
 * JD-Core Version:    0.6.2
 */