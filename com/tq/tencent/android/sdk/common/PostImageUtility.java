package com.tq.tencent.android.sdk.common;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

public class PostImageUtility
{
  public static final String BOUNDARY = "c9152e99a2d6487fb0bfd02adec3aa16";
  public static final String END_MP_BOUNDARY = "--c9152e99a2d6487fb0bfd02adec3aa16--";
  public static final long MAX_FILE_SIZE = 4194304L;
  public static final String MP_BOUNDARY = "--c9152e99a2d6487fb0bfd02adec3aa16";
  public static final String MULTIPART_FORM_DATA = "multipart/form-data";

  // ERROR //
  private static void imageContentToUpload(OutputStream paramOutputStream, String paramString, File paramFile)
    throws Exception
  {
    // Byte code:
    //   0: new 33	java/lang/StringBuilder
    //   3: dup
    //   4: invokespecial 34	java/lang/StringBuilder:<init>	()V
    //   7: astore_3
    //   8: aload_3
    //   9: ldc 18
    //   11: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   14: ldc 40
    //   16: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   19: pop
    //   20: aload_3
    //   21: ldc 42
    //   23: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   26: pop
    //   27: aload_3
    //   28: aload_1
    //   29: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   32: pop
    //   33: aload_3
    //   34: ldc 44
    //   36: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   39: aload_2
    //   40: invokevirtual 50	java/io/File:getName	()Ljava/lang/String;
    //   43: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   46: ldc 52
    //   48: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   51: pop
    //   52: aload_3
    //   53: ldc 54
    //   55: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   58: ldc 56
    //   60: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   63: ldc 58
    //   65: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   68: pop
    //   69: aload_3
    //   70: invokevirtual 61	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   73: invokevirtual 67	java/lang/String:getBytes	()[B
    //   76: astore 9
    //   78: aload_0
    //   79: aload 9
    //   81: invokevirtual 73	java/io/OutputStream:write	([B)V
    //   84: new 75	java/io/FileInputStream
    //   87: dup
    //   88: aload_2
    //   89: invokespecial 78	java/io/FileInputStream:<init>	(Ljava/io/File;)V
    //   92: astore 13
    //   94: aload 13
    //   96: invokevirtual 82	java/io/FileInputStream:available	()I
    //   99: newarray byte
    //   101: astore 14
    //   103: new 33	java/lang/StringBuilder
    //   106: dup
    //   107: ldc 84
    //   109: invokespecial 87	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   112: aload_2
    //   113: invokevirtual 50	java/io/File:getName	()Ljava/lang/String;
    //   116: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   119: ldc 89
    //   121: invokevirtual 38	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   124: aload 14
    //   126: arraylength
    //   127: invokevirtual 92	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   130: invokevirtual 61	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   133: invokestatic 97	com/tq/tencent/android/sdk/common/Logger:error	(Ljava/lang/String;)V
    //   136: aload 13
    //   138: aload 14
    //   140: invokevirtual 101	java/io/FileInputStream:read	([B)I
    //   143: pop
    //   144: aload_0
    //   145: aload 14
    //   147: invokevirtual 73	java/io/OutputStream:write	([B)V
    //   150: aload_0
    //   151: ldc 40
    //   153: invokevirtual 67	java/lang/String:getBytes	()[B
    //   156: invokevirtual 73	java/io/OutputStream:write	([B)V
    //   159: aload 13
    //   161: invokevirtual 104	java/io/FileInputStream:close	()V
    //   164: iconst_0
    //   165: ifeq +7 -> 172
    //   168: aconst_null
    //   169: invokevirtual 107	java/io/BufferedInputStream:close	()V
    //   172: return
    //   173: astore 12
    //   175: new 29	java/lang/Exception
    //   178: dup
    //   179: aload 12
    //   181: invokespecial 110	java/lang/Exception:<init>	(Ljava/lang/Throwable;)V
    //   184: athrow
    //   185: astore 10
    //   187: iconst_0
    //   188: ifeq +7 -> 195
    //   191: aconst_null
    //   192: invokevirtual 107	java/io/BufferedInputStream:close	()V
    //   195: aload 10
    //   197: athrow
    //   198: astore 11
    //   200: new 29	java/lang/Exception
    //   203: dup
    //   204: aload 11
    //   206: invokespecial 110	java/lang/Exception:<init>	(Ljava/lang/Throwable;)V
    //   209: athrow
    //   210: astore 16
    //   212: new 29	java/lang/Exception
    //   215: dup
    //   216: aload 16
    //   218: invokespecial 110	java/lang/Exception:<init>	(Ljava/lang/Throwable;)V
    //   221: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   78	164	173	java/io/IOException
    //   78	164	185	finally
    //   175	185	185	finally
    //   191	195	198	java/io/IOException
    //   168	172	210	java/io/IOException
  }

  public static void imageContentToUpload(OutputStream paramOutputStream, HashMap<String, File> paramHashMap)
    throws Exception
  {
    Iterator localIterator = paramHashMap.entrySet().iterator();
    while (true)
    {
      if (!localIterator.hasNext())
      {
        paramOutputStream.write("\r\n--c9152e99a2d6487fb0bfd02adec3aa16--".getBytes());
        return;
      }
      Map.Entry localEntry = (Map.Entry)localIterator.next();
      imageContentToUpload(paramOutputStream, (String)localEntry.getKey(), (File)localEntry.getValue());
    }
  }

  public static void paramToUpload(OutputStream paramOutputStream, OpSdkParams paramOpSdkParams)
    throws Exception
  {
    int i = 0;
    while (true)
    {
      if (i >= paramOpSdkParams.size())
        return;
      String str = paramOpSdkParams.getKey(i);
      StringBuilder localStringBuilder = new StringBuilder(10);
      localStringBuilder.setLength(0);
      localStringBuilder.append("--c9152e99a2d6487fb0bfd02adec3aa16").append("\r\n");
      localStringBuilder.append("content-disposition: form-data; name=\"").append(str).append("\"\r\n\r\n");
      localStringBuilder.append(paramOpSdkParams.getValue(str)).append("\r\n");
      byte[] arrayOfByte = localStringBuilder.toString().getBytes();
      try
      {
        paramOutputStream.write(arrayOfByte);
        i++;
      }
      catch (IOException localIOException)
      {
        throw new Exception(localIOException);
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.PostImageUtility
 * JD-Core Version:    0.6.2
 */