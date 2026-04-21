package org.apache.harmony.awt.datatransfer;

import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.SystemFlavorMap;
import java.io.InputStream;
import java.io.Reader;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;

public class TextFlavor
{
  public static final Class[] charsetTextClasses = { InputStream.class, ByteBuffer.class, [B.class };
  public static final Class[] unicodeTextClasses = { String.class, Reader.class, CharBuffer.class, [C.class };

  public static void addCharsetClasses(SystemFlavorMap paramSystemFlavorMap, String paramString1, String paramString2, String paramString3)
  {
    for (int i = 0; ; i++)
    {
      if (i >= charsetTextClasses.length)
        return;
      String str1 = "text/" + paramString2;
      String str2 = ";class=\"" + charsetTextClasses[i].getName() + "\"" + ";charset=\"" + paramString3 + "\"";
      DataFlavor localDataFlavor = new DataFlavor(str1 + str2, str1);
      paramSystemFlavorMap.addFlavorForUnencodedNative(paramString1, localDataFlavor);
      paramSystemFlavorMap.addUnencodedNativeForFlavor(localDataFlavor, paramString1);
    }
  }

  public static void addUnicodeClasses(SystemFlavorMap paramSystemFlavorMap, String paramString1, String paramString2)
  {
    for (int i = 0; ; i++)
    {
      if (i >= unicodeTextClasses.length)
        return;
      String str1 = "text/" + paramString2;
      String str2 = ";class=\"" + unicodeTextClasses[i].getName() + "\"";
      DataFlavor localDataFlavor = new DataFlavor(str1 + str2, str1);
      paramSystemFlavorMap.addFlavorForUnencodedNative(paramString1, localDataFlavor);
      paramSystemFlavorMap.addUnencodedNativeForFlavor(localDataFlavor, paramString1);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.TextFlavor
 * JD-Core Version:    0.6.2
 */