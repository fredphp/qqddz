package com.sun.mail.dsn;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import javax.activation.ActivationDataFlavor;
import javax.activation.DataContentHandler;
import javax.activation.DataSource;
import javax.mail.MessagingException;
import javax.mail.internet.ContentType;
import javax.mail.internet.MimeUtility;
import myjava.awt.datatransfer.DataFlavor;

public class text_rfc822headers
  implements DataContentHandler
{
  private static ActivationDataFlavor myDF = new ActivationDataFlavor(MessageHeaders.class, "text/rfc822-headers", "RFC822 headers");
  private static ActivationDataFlavor myDFs = new ActivationDataFlavor(String.class, "text/rfc822-headers", "RFC822 headers");

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

  private Object getStringContent(DataSource paramDataSource)
    throws IOException
  {
    String str = null;
    int i;
    Object localObject;
    do
    {
      int j;
      try
      {
        str = getCharset(paramDataSource.getContentType());
        InputStreamReader localInputStreamReader = new InputStreamReader(paramDataSource.getInputStream(), str);
        i = 0;
        localObject = new char[1024];
        j = localInputStreamReader.read((char[])localObject, i, localObject.length - i);
        if (j == -1)
          return new String((char[])localObject, 0, i);
      }
      catch (IllegalArgumentException localIllegalArgumentException)
      {
        throw new UnsupportedEncodingException(str);
      }
      i += j;
    }
    while (i < localObject.length);
    int k = localObject.length;
    if (k < 262144);
    for (int m = k + k; ; m = k + 262144)
    {
      char[] arrayOfChar = new char[m];
      System.arraycopy(localObject, 0, arrayOfChar, 0, i);
      localObject = arrayOfChar;
      break;
    }
  }

  public Object getContent(DataSource paramDataSource)
    throws IOException
  {
    try
    {
      MessageHeaders localMessageHeaders = new MessageHeaders(paramDataSource.getInputStream());
      return localMessageHeaders;
    }
    catch (MessagingException localMessagingException)
    {
      throw new IOException("Exception creating MessageHeaders: " + localMessagingException);
    }
  }

  public Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws IOException
  {
    if (myDF.equals(paramDataFlavor))
      return getContent(paramDataSource);
    if (myDFs.equals(paramDataFlavor))
      return getStringContent(paramDataSource);
    return null;
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    DataFlavor[] arrayOfDataFlavor = new DataFlavor[2];
    arrayOfDataFlavor[0] = myDF;
    arrayOfDataFlavor[1] = myDFs;
    return arrayOfDataFlavor;
  }

  public void writeTo(Object paramObject, String paramString, OutputStream paramOutputStream)
    throws IOException
  {
    if ((paramObject instanceof MessageHeaders))
    {
      MessageHeaders localMessageHeaders = (MessageHeaders)paramObject;
      try
      {
        localMessageHeaders.writeTo(paramOutputStream);
        return;
      }
      catch (MessagingException localMessagingException)
      {
        Exception localException = localMessagingException.getNextException();
        if ((localException instanceof IOException))
          throw ((IOException)localException);
        throw new IOException("Exception writing headers: " + localMessagingException);
      }
    }
    if (!(paramObject instanceof String))
      throw new IOException("\"" + myDFs.getMimeType() + "\" DataContentHandler requires String object, " + "was given object of type " + paramObject.getClass().toString());
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
 * Qualified Name:     com.sun.mail.dsn.text_rfc822headers
 * JD-Core Version:    0.6.2
 */