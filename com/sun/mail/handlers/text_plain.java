package com.sun.mail.handlers;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import javax.activation.ActivationDataFlavor;
import javax.activation.DataContentHandler;
import javax.activation.DataSource;
import javax.mail.internet.ContentType;
import javax.mail.internet.MimeUtility;
import myjava.awt.datatransfer.DataFlavor;

public class text_plain
  implements DataContentHandler
{
  private static ActivationDataFlavor myDF = new ActivationDataFlavor(String.class, "text/plain", "Text String");

  private String getCharset(String paramString)
  {
    try
    {
      String str1 = new ContentType(paramString).getParameter("charset");
      if (str1 == null)
        str1 = "us-ascii";
      String str2 = MimeUtility.javaCharset(str1);
      return str2;
    }
    catch (Exception localException)
    {
    }
    return null;
  }

  // ERROR //
  public Object getContent(DataSource paramDataSource)
    throws IOException
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_2
    //   2: aload_0
    //   3: aload_1
    //   4: invokeinterface 59 1 0
    //   9: invokespecial 61	com/sun/mail/handlers/text_plain:getCharset	(Ljava/lang/String;)Ljava/lang/String;
    //   12: astore_2
    //   13: new 63	java/io/InputStreamReader
    //   16: dup
    //   17: aload_1
    //   18: invokeinterface 67 1 0
    //   23: aload_2
    //   24: invokespecial 70	java/io/InputStreamReader:<init>	(Ljava/io/InputStream;Ljava/lang/String;)V
    //   27: astore 4
    //   29: iconst_0
    //   30: istore 5
    //   32: sipush 1024
    //   35: newarray char
    //   37: astore 8
    //   39: aload 4
    //   41: aload 8
    //   43: iload 5
    //   45: aload 8
    //   47: arraylength
    //   48: iload 5
    //   50: isub
    //   51: invokevirtual 74	java/io/InputStreamReader:read	([CII)I
    //   54: istore 9
    //   56: iload 9
    //   58: iconst_m1
    //   59: if_icmpne +35 -> 94
    //   62: new 14	java/lang/String
    //   65: dup
    //   66: aload 8
    //   68: iconst_0
    //   69: iload 5
    //   71: invokespecial 77	java/lang/String:<init>	([CII)V
    //   74: astore 10
    //   76: aload 4
    //   78: invokevirtual 80	java/io/InputStreamReader:close	()V
    //   81: aload 10
    //   83: areturn
    //   84: astore_3
    //   85: new 82	java/io/UnsupportedEncodingException
    //   88: dup
    //   89: aload_2
    //   90: invokespecial 83	java/io/UnsupportedEncodingException:<init>	(Ljava/lang/String;)V
    //   93: athrow
    //   94: iload 5
    //   96: iload 9
    //   98: iadd
    //   99: istore 5
    //   101: iload 5
    //   103: aload 8
    //   105: arraylength
    //   106: if_icmplt -67 -> 39
    //   109: aload 8
    //   111: arraylength
    //   112: istore 12
    //   114: iload 12
    //   116: ldc 84
    //   118: if_icmpge +34 -> 152
    //   121: iload 12
    //   123: iload 12
    //   125: iadd
    //   126: istore 13
    //   128: iload 13
    //   130: newarray char
    //   132: astore 14
    //   134: aload 8
    //   136: iconst_0
    //   137: aload 14
    //   139: iconst_0
    //   140: iload 5
    //   142: invokestatic 90	java/lang/System:arraycopy	(Ljava/lang/Object;ILjava/lang/Object;II)V
    //   145: aload 14
    //   147: astore 8
    //   149: goto -110 -> 39
    //   152: iload 12
    //   154: ldc 84
    //   156: iadd
    //   157: istore 13
    //   159: goto -31 -> 128
    //   162: astore 6
    //   164: aload 4
    //   166: invokevirtual 80	java/io/InputStreamReader:close	()V
    //   169: aload 6
    //   171: athrow
    //   172: astore 11
    //   174: aload 10
    //   176: areturn
    //   177: astore 7
    //   179: goto -10 -> 169
    //
    // Exception table:
    //   from	to	target	type
    //   2	29	84	java/lang/IllegalArgumentException
    //   32	39	162	finally
    //   39	56	162	finally
    //   62	76	162	finally
    //   101	114	162	finally
    //   128	145	162	finally
    //   76	81	172	java/io/IOException
    //   164	169	177	java/io/IOException
  }

  protected ActivationDataFlavor getDF()
  {
    return myDF;
  }

  public Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws IOException
  {
    if (getDF().equals(paramDataFlavor))
      return getContent(paramDataSource);
    return null;
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    DataFlavor[] arrayOfDataFlavor = new DataFlavor[1];
    arrayOfDataFlavor[0] = getDF();
    return arrayOfDataFlavor;
  }

  public void writeTo(Object paramObject, String paramString, OutputStream paramOutputStream)
    throws IOException
  {
    if (!(paramObject instanceof String))
      throw new IOException("\"" + getDF().getMimeType() + "\" DataContentHandler requires String object, " + "was given object of type " + paramObject.getClass().toString());
    String str1 = null;
    try
    {
      str1 = getCharset(paramString);
      OutputStreamWriter localOutputStreamWriter = new OutputStreamWriter(paramOutputStream, str1);
      String str2 = (String)paramObject;
      localOutputStreamWriter.write(str2, 0, str2.length());
      localOutputStreamWriter.flush();
      return;
    }
    catch (IllegalArgumentException localIllegalArgumentException)
    {
    }
    throw new UnsupportedEncodingException(str1);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.handlers.text_plain
 * JD-Core Version:    0.6.2
 */