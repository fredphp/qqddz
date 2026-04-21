package com.sun.mail.iap;

import java.io.ByteArrayInputStream;

public class ByteArray
{
  private byte[] bytes;
  private int count;
  private int start;

  public ByteArray(int paramInt)
  {
    this(new byte[paramInt], 0, paramInt);
  }

  public ByteArray(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
  {
    this.bytes = paramArrayOfByte;
    this.start = paramInt1;
    this.count = paramInt2;
  }

  public byte[] getBytes()
  {
    return this.bytes;
  }

  public int getCount()
  {
    return this.count;
  }

  public byte[] getNewBytes()
  {
    byte[] arrayOfByte = new byte[this.count];
    System.arraycopy(this.bytes, this.start, arrayOfByte, 0, this.count);
    return arrayOfByte;
  }

  public int getStart()
  {
    return this.start;
  }

  public void grow(int paramInt)
  {
    byte[] arrayOfByte = new byte[paramInt + this.bytes.length];
    System.arraycopy(this.bytes, 0, arrayOfByte, 0, this.bytes.length);
    this.bytes = arrayOfByte;
  }

  public void setCount(int paramInt)
  {
    this.count = paramInt;
  }

  public ByteArrayInputStream toByteArrayInputStream()
  {
    return new ByteArrayInputStream(this.bytes, this.start, this.count);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.ByteArray
 * JD-Core Version:    0.6.2
 */