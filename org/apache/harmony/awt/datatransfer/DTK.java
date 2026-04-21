package org.apache.harmony.awt.datatransfer;

import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.SystemFlavorMap;
import java.awt.dnd.DragGestureEvent;
import java.awt.dnd.DropTargetContext;
import java.awt.dnd.peer.DragSourceContextPeer;
import java.awt.dnd.peer.DropTargetContextPeer;
import java.nio.charset.Charset;
import org.apache.harmony.awt.ContextStorage;
import org.apache.harmony.awt.internal.nls.Messages;
import org.apache.harmony.misc.SystemUtils;

public abstract class DTK
{
  protected final DataTransferThread dataTransferThread = new DataTransferThread(this);
  private NativeClipboard nativeClipboard = null;
  private NativeClipboard nativeSelection = null;
  protected SystemFlavorMap systemFlavorMap;

  protected DTK()
  {
    this.dataTransferThread.start();
  }

  private static DTK createDTK()
  {
    String str;
    switch (SystemUtils.getOS())
    {
    default:
      throw new RuntimeException(Messages.getString("awt.4E"));
    case 1:
      str = "org.apache.harmony.awt.datatransfer.windows.WinDTK";
    case 2:
    }
    try
    {
      while (true)
      {
        DTK localDTK = (DTK)Class.forName(str).newInstance();
        return localDTK;
        str = "org.apache.harmony.awt.datatransfer.linux.LinuxDTK";
      }
    }
    catch (Exception localException)
    {
      throw new RuntimeException(localException);
    }
  }

  public static DTK getDTK()
  {
    synchronized (ContextStorage.getContextLock())
    {
      if (ContextStorage.shutdownPending())
        return null;
      DTK localDTK = ContextStorage.getDTK();
      if (localDTK == null)
      {
        localDTK = createDTK();
        ContextStorage.setDTK(localDTK);
      }
      return localDTK;
    }
  }

  protected void appendSystemFlavorMap(SystemFlavorMap paramSystemFlavorMap, DataFlavor paramDataFlavor, String paramString)
  {
    paramSystemFlavorMap.addFlavorForUnencodedNative(paramString, paramDataFlavor);
    paramSystemFlavorMap.addUnencodedNativeForFlavor(paramDataFlavor, paramString);
  }

  protected void appendSystemFlavorMap(SystemFlavorMap paramSystemFlavorMap, String[] paramArrayOfString, String paramString1, String paramString2)
  {
    TextFlavor.addUnicodeClasses(paramSystemFlavorMap, paramString2, paramString1);
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfString.length)
        return;
      if ((paramArrayOfString[i] != null) && (Charset.isSupported(paramArrayOfString[i])))
        TextFlavor.addCharsetClasses(paramSystemFlavorMap, paramString2, paramString1, paramArrayOfString[i]);
    }
  }

  public abstract DragSourceContextPeer createDragSourceContextPeer(DragGestureEvent paramDragGestureEvent);

  public abstract DropTargetContextPeer createDropTargetContextPeer(DropTargetContext paramDropTargetContext);

  protected String[] getCharsets()
  {
    return new String[] { "UTF-16", "UTF-8", "unicode", "ISO-8859-1", "US-ASCII" };
  }

  public String getDefaultCharset()
  {
    return "unicode";
  }

  public NativeClipboard getNativeClipboard()
  {
    if (this.nativeClipboard == null)
      this.nativeClipboard = newNativeClipboard();
    return this.nativeClipboard;
  }

  public NativeClipboard getNativeSelection()
  {
    if (this.nativeSelection == null)
      this.nativeSelection = newNativeSelection();
    return this.nativeSelection;
  }

  public SystemFlavorMap getSystemFlavorMap()
  {
    try
    {
      SystemFlavorMap localSystemFlavorMap = this.systemFlavorMap;
      return localSystemFlavorMap;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public abstract void initDragAndDrop();

  public void initSystemFlavorMap(SystemFlavorMap paramSystemFlavorMap)
  {
    String[] arrayOfString = getCharsets();
    appendSystemFlavorMap(paramSystemFlavorMap, DataFlavor.stringFlavor, "text/plain");
    appendSystemFlavorMap(paramSystemFlavorMap, arrayOfString, "plain", "text/plain");
    appendSystemFlavorMap(paramSystemFlavorMap, arrayOfString, "html", "text/html");
    appendSystemFlavorMap(paramSystemFlavorMap, DataProvider.urlFlavor, "application/x-java-url");
    appendSystemFlavorMap(paramSystemFlavorMap, arrayOfString, "uri-list", "application/x-java-url");
    appendSystemFlavorMap(paramSystemFlavorMap, DataFlavor.javaFileListFlavor, "application/x-java-file-list");
    appendSystemFlavorMap(paramSystemFlavorMap, DataFlavor.imageFlavor, "image/x-java-image");
  }

  protected abstract NativeClipboard newNativeClipboard();

  protected abstract NativeClipboard newNativeSelection();

  public abstract void runEventLoop();

  public void setSystemFlavorMap(SystemFlavorMap paramSystemFlavorMap)
  {
    try
    {
      this.systemFlavorMap = paramSystemFlavorMap;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.DTK
 * JD-Core Version:    0.6.2
 */