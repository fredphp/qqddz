package com.sun.mail.imap.protocol;

import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.Writer;

public class BASE64MailboxEncoder
{
  private static final char[] pem_array = { 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 44 };
  protected byte[] buffer = new byte[4];
  protected int bufsize = 0;
  protected Writer out = null;
  protected boolean started = false;

  public BASE64MailboxEncoder(Writer paramWriter)
  {
    this.out = paramWriter;
  }

  public static String encode(String paramString)
  {
    BASE64MailboxEncoder localBASE64MailboxEncoder = null;
    char[] arrayOfChar = paramString.toCharArray();
    int i = arrayOfChar.length;
    int j = 0;
    CharArrayWriter localCharArrayWriter = new CharArrayWriter(i);
    int k = 0;
    if (k >= i)
    {
      if (localBASE64MailboxEncoder != null)
        localBASE64MailboxEncoder.flush();
      if (j != 0)
        paramString = localCharArrayWriter.toString();
      return paramString;
    }
    int m = arrayOfChar[k];
    if ((m >= 32) && (m <= 126))
    {
      if (localBASE64MailboxEncoder != null)
        localBASE64MailboxEncoder.flush();
      if (m == 38)
      {
        j = 1;
        localCharArrayWriter.write(38);
        localCharArrayWriter.write(45);
      }
    }
    while (true)
    {
      k++;
      break;
      localCharArrayWriter.write(m);
      continue;
      if (localBASE64MailboxEncoder == null)
      {
        localBASE64MailboxEncoder = new BASE64MailboxEncoder(localCharArrayWriter);
        j = 1;
      }
      localBASE64MailboxEncoder.write(m);
    }
  }

  protected void encode()
    throws IOException
  {
    if (this.bufsize == 1)
    {
      int i1 = this.buffer[0];
      this.out.write(pem_array[(0x3F & i1 >>> 2)]);
      this.out.write(pem_array[(0 + (0x30 & i1 << 4))]);
    }
    do
    {
      return;
      if (this.bufsize == 2)
      {
        int m = this.buffer[0];
        int n = this.buffer[1];
        this.out.write(pem_array[(0x3F & m >>> 2)]);
        this.out.write(pem_array[((0x30 & m << 4) + (0xF & n >>> 4))]);
        this.out.write(pem_array[(0 + (0x3C & n << 2))]);
        return;
      }
      int i = this.buffer[0];
      int j = this.buffer[1];
      int k = this.buffer[2];
      this.out.write(pem_array[(0x3F & i >>> 2)]);
      this.out.write(pem_array[((0x30 & i << 4) + (0xF & j >>> 4))]);
      this.out.write(pem_array[((0x3C & j << 2) + (0x3 & k >>> 6))]);
      this.out.write(pem_array[(k & 0x3F)]);
    }
    while (this.bufsize != 4);
    this.buffer[0] = this.buffer[3];
  }

  public void flush()
  {
    try
    {
      if (this.bufsize > 0)
      {
        encode();
        this.bufsize = 0;
      }
      if (this.started)
      {
        this.out.write(45);
        this.started = false;
      }
      return;
    }
    catch (IOException localIOException)
    {
    }
  }

  public void write(int paramInt)
  {
    try
    {
      if (!this.started)
      {
        this.started = true;
        this.out.write(38);
      }
      byte[] arrayOfByte1 = this.buffer;
      int i = this.bufsize;
      this.bufsize = (i + 1);
      arrayOfByte1[i] = ((byte)(paramInt >> 8));
      byte[] arrayOfByte2 = this.buffer;
      int j = this.bufsize;
      this.bufsize = (j + 1);
      arrayOfByte2[j] = ((byte)(paramInt & 0xFF));
      if (this.bufsize >= 3)
      {
        encode();
        this.bufsize = (-3 + this.bufsize);
      }
      return;
    }
    catch (IOException localIOException)
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.BASE64MailboxEncoder
 * JD-Core Version:    0.6.2
 */