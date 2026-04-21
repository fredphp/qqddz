package javax.mail.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.activation.DataSource;
import javax.mail.internet.ContentType;
import javax.mail.internet.MimeUtility;
import javax.mail.internet.ParseException;

public class ByteArrayDataSource
  implements DataSource
{
  private byte[] data;
  private int len = -1;
  private String name = "";
  private String type;

  public ByteArrayDataSource(InputStream paramInputStream, String paramString)
    throws IOException
  {
    DSByteArrayOutputStream localDSByteArrayOutputStream = new DSByteArrayOutputStream();
    byte[] arrayOfByte = new byte[8192];
    while (true)
    {
      int i = paramInputStream.read(arrayOfByte);
      if (i <= 0)
      {
        this.data = localDSByteArrayOutputStream.getBuf();
        this.len = localDSByteArrayOutputStream.getCount();
        if (this.data.length - this.len > 262144)
        {
          this.data = localDSByteArrayOutputStream.toByteArray();
          this.len = this.data.length;
        }
        this.type = paramString;
        return;
      }
      localDSByteArrayOutputStream.write(arrayOfByte, 0, i);
    }
  }

  public ByteArrayDataSource(String paramString1, String paramString2)
    throws IOException
  {
    try
    {
      String str2 = new ContentType(paramString2).getParameter("charset");
      str1 = str2;
      if (str1 == null)
        str1 = MimeUtility.getDefaultJavaCharset();
      this.data = paramString1.getBytes(str1);
      this.type = paramString2;
      return;
    }
    catch (ParseException localParseException)
    {
      while (true)
        String str1 = null;
    }
  }

  public ByteArrayDataSource(byte[] paramArrayOfByte, String paramString)
  {
    this.data = paramArrayOfByte;
    this.type = paramString;
  }

  public String getContentType()
  {
    return this.type;
  }

  public InputStream getInputStream()
    throws IOException
  {
    if (this.data == null)
      throw new IOException("no data");
    if (this.len < 0)
      this.len = this.data.length;
    return new SharedByteArrayInputStream(this.data, 0, this.len);
  }

  public String getName()
  {
    return this.name;
  }

  public OutputStream getOutputStream()
    throws IOException
  {
    throw new IOException("cannot do this");
  }

  public void setName(String paramString)
  {
    this.name = paramString;
  }

  static class DSByteArrayOutputStream extends ByteArrayOutputStream
  {
    public byte[] getBuf()
    {
      return this.buf;
    }

    public int getCount()
    {
      return this.count;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.util.ByteArrayDataSource
 * JD-Core Version:    0.6.2
 */