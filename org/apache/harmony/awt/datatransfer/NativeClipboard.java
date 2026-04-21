package org.apache.harmony.awt.datatransfer;

import java.awt.datatransfer.Clipboard;

public abstract class NativeClipboard extends Clipboard
{
  protected static final int OPS_TIMEOUT = 10000;

  public NativeClipboard(String paramString)
  {
    super(paramString);
  }

  public void onRestart()
  {
  }

  public void onShutdown()
  {
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.NativeClipboard
 * JD-Core Version:    0.6.2
 */