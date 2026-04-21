package org.apache.harmony.awt.datatransfer;

import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.SystemFlavorMap;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class DataSnapshot
  implements DataProvider
{
  private final String[] fileList;
  private final String html;
  private final String[] nativeFormats;
  private final RawBitmap rawBitmap;
  private final Map<Class<?>, byte[]> serializedObjects;
  private final String text;
  private final String url;

  public DataSnapshot(DataProvider paramDataProvider)
  {
    this.nativeFormats = paramDataProvider.getNativeFormats();
    this.text = paramDataProvider.getText();
    this.fileList = paramDataProvider.getFileList();
    this.url = paramDataProvider.getURL();
    this.html = paramDataProvider.getHTML();
    this.rawBitmap = paramDataProvider.getRawBitmap();
    this.serializedObjects = Collections.synchronizedMap(new HashMap());
    int i = 0;
    while (true)
    {
      if (i >= this.nativeFormats.length)
        return;
      try
      {
        DataFlavor localDataFlavor2 = SystemFlavorMap.decodeDataFlavor(this.nativeFormats[i]);
        localDataFlavor1 = localDataFlavor2;
        if (localDataFlavor1 != null)
        {
          Class localClass = localDataFlavor1.getRepresentationClass();
          byte[] arrayOfByte = paramDataProvider.getSerializedObject(localClass);
          if (arrayOfByte != null)
            this.serializedObjects.put(localClass, arrayOfByte);
        }
        i++;
      }
      catch (ClassNotFoundException localClassNotFoundException)
      {
        while (true)
          DataFlavor localDataFlavor1 = null;
      }
    }
  }

  public String[] getFileList()
  {
    return this.fileList;
  }

  public String getHTML()
  {
    return this.html;
  }

  public String[] getNativeFormats()
  {
    return this.nativeFormats;
  }

  public RawBitmap getRawBitmap()
  {
    return this.rawBitmap;
  }

  public short[] getRawBitmapBuffer16()
  {
    if ((this.rawBitmap != null) && ((this.rawBitmap.buffer instanceof short[])))
      return (short[])this.rawBitmap.buffer;
    return null;
  }

  public int[] getRawBitmapBuffer32()
  {
    if ((this.rawBitmap != null) && ((this.rawBitmap.buffer instanceof int[])))
      return (int[])this.rawBitmap.buffer;
    return null;
  }

  public byte[] getRawBitmapBuffer8()
  {
    if ((this.rawBitmap != null) && ((this.rawBitmap.buffer instanceof byte[])))
      return (byte[])this.rawBitmap.buffer;
    return null;
  }

  public int[] getRawBitmapHeader()
  {
    if (this.rawBitmap != null)
      return this.rawBitmap.getHeader();
    return null;
  }

  public byte[] getSerializedObject(Class<?> paramClass)
  {
    return (byte[])this.serializedObjects.get(paramClass);
  }

  public byte[] getSerializedObject(String paramString)
  {
    try
    {
      byte[] arrayOfByte = getSerializedObject(SystemFlavorMap.decodeDataFlavor(paramString).getRepresentationClass());
      return arrayOfByte;
    }
    catch (Exception localException)
    {
    }
    return null;
  }

  public String getText()
  {
    return this.text;
  }

  public String getURL()
  {
    return this.url;
  }

  public boolean isNativeFormatAvailable(String paramString)
  {
    if (paramString == null);
    do
    {
      do
      {
        do
        {
          do
          {
            do
            {
              return false;
              if (!paramString.equals("text/plain"))
                break;
            }
            while (this.text == null);
            return true;
            if (!paramString.equals("application/x-java-file-list"))
              break;
          }
          while (this.fileList == null);
          return true;
          if (!paramString.equals("application/x-java-url"))
            break;
        }
        while (this.url == null);
        return true;
        if (!paramString.equals("text/html"))
          break;
      }
      while (this.html == null);
      return true;
      if (!paramString.equals("image/x-java-image"))
        break;
    }
    while (this.rawBitmap == null);
    return true;
    try
    {
      DataFlavor localDataFlavor = SystemFlavorMap.decodeDataFlavor(paramString);
      boolean bool = this.serializedObjects.containsKey(localDataFlavor.getRepresentationClass());
      return bool;
    }
    catch (Exception localException)
    {
    }
    return false;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.DataSnapshot
 * JD-Core Version:    0.6.2
 */