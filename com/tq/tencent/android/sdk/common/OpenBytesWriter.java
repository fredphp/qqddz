package com.tq.tencent.android.sdk.common;

public final class OpenBytesWriter
{
  protected byte[] buf = new byte[100];
  protected int count;

  public static byte[] getUTF8Bytes(String paramString)
  {
    if (paramString == null)
      return null;
    try
    {
      byte[] arrayOfByte2 = paramString.getBytes("UTF-8");
      return arrayOfByte2;
    }
    catch (Exception localException1)
    {
      try
      {
        byte[] arrayOfByte1 = paramString.getBytes("utf-8");
        return arrayOfByte1;
      }
      catch (Exception localException2)
      {
      }
    }
    return paramString.getBytes();
  }

  public void adjustSize()
  {
    int i = (short)this.count;
    this.buf[0] = ((byte)(0xFF & i >>> 8));
    this.buf[1] = ((byte)(0xFF & i >>> 0));
  }

  public void reset()
  {
    this.count = 0;
  }

  public int size()
  {
    return this.count;
  }

  public byte[] toByteArray()
  {
    if (this.buf.length == this.count)
      return this.buf;
    byte[] arrayOfByte = new byte[this.count];
    System.arraycopy(this.buf, 0, arrayOfByte, 0, this.count);
    return arrayOfByte;
  }

  public byte[] toMsgByteArray()
  {
    adjustSize();
    if (this.buf.length == this.count)
      return this.buf;
    byte[] arrayOfByte = new byte[this.count];
    System.arraycopy(this.buf, 0, arrayOfByte, 0, this.count);
    return arrayOfByte;
  }

  public void write(int paramInt)
  {
    int i = 1 + this.count;
    if (i > this.buf.length)
    {
      byte[] arrayOfByte = new byte[Math.max(this.buf.length << 1, i)];
      System.arraycopy(this.buf, 0, arrayOfByte, 0, this.count);
      this.buf = arrayOfByte;
    }
    this.buf[this.count] = ((byte)paramInt);
    this.count = i;
  }

  public void write(byte[] paramArrayOfByte)
  {
    write(paramArrayOfByte, 0, paramArrayOfByte.length);
  }

  public void write(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
  {
    if ((paramInt1 < 0) || (paramInt1 > paramArrayOfByte.length) || (paramInt2 < 0) || (paramInt1 + paramInt2 > paramArrayOfByte.length) || (paramInt1 + paramInt2 < 0))
      throw new IndexOutOfBoundsException();
    if (paramInt2 == 0)
      return;
    int i = paramInt2 + this.count;
    if (i > this.buf.length)
    {
      byte[] arrayOfByte = new byte[Math.max(this.buf.length << 1, i)];
      System.arraycopy(this.buf, 0, arrayOfByte, 0, this.count);
      this.buf = arrayOfByte;
    }
    System.arraycopy(paramArrayOfByte, paramInt1, this.buf, this.count, paramInt2);
    this.count = i;
  }

  public final void writeByte(int paramInt)
  {
    write(paramInt);
  }

  public final void writeCInt(int paramInt)
  {
    write(0xFF & paramInt >>> 0);
    write(0xFF & paramInt >>> 8);
    write(0xFF & paramInt >>> 16);
    write(0xFF & paramInt >>> 24);
  }

  public final void writeCLong(long paramLong)
  {
    write(0xFF & (int)(paramLong >>> 0));
    write(0xFF & (int)(paramLong >>> 8));
    write(0xFF & (int)(paramLong >>> 16));
    write(0xFF & (int)(paramLong >>> 24));
    write(0xFF & (int)(paramLong >>> 32));
    write(0xFF & (int)(paramLong >>> 40));
    write(0xFF & (int)(paramLong >>> 48));
    write(0xFF & (int)(paramLong >>> 56));
  }

  public final void writeCShort(int paramInt)
  {
    write(0xFF & paramInt >>> 0);
    write(0xFF & paramInt >>> 8);
  }

  public final void writeChar(int paramInt)
  {
    write(0xFF & paramInt >>> 0);
  }

  public final void writeInt(int paramInt)
  {
    write(0xFF & paramInt >>> 24);
    write(0xFF & paramInt >>> 16);
    write(0xFF & paramInt >>> 8);
    write(0xFF & paramInt >>> 0);
  }

  public final void writeLong(long paramLong)
  {
    write(0xFF & (int)(paramLong >>> 56));
    write(0xFF & (int)(paramLong >>> 48));
    write(0xFF & (int)(paramLong >>> 40));
    write(0xFF & (int)(paramLong >>> 32));
    write(0xFF & (int)(paramLong >>> 24));
    write(0xFF & (int)(paramLong >>> 16));
    write(0xFF & (int)(paramLong >>> 8));
    write(0xFF & (int)(paramLong >>> 0));
  }

  public final void writeShort(int paramInt)
  {
    write(0xFF & paramInt >>> 8);
    write(0xFF & paramInt >>> 0);
  }

  public final void writeUTF1(String paramString)
  {
    if (paramString == null)
    {
      writeByte(0);
      return;
    }
    byte[] arrayOfByte = getUTF8Bytes(paramString);
    if (arrayOfByte != null)
    {
      writeByte(arrayOfByte.length);
      write(arrayOfByte);
      return;
    }
    writeByte(0);
  }

  public final void writeUTF2(String paramString)
  {
    if (paramString == null)
    {
      writeShort(0);
      return;
    }
    byte[] arrayOfByte = getUTF8Bytes(paramString);
    if (arrayOfByte != null)
    {
      writeShort(arrayOfByte.length);
      write(arrayOfByte);
      return;
    }
    writeShort(0);
  }

  public final void writeUTF4(String paramString)
  {
    if (paramString == null)
    {
      writeInt(0);
      return;
    }
    byte[] arrayOfByte = getUTF8Bytes(paramString);
    if (arrayOfByte != null)
    {
      writeInt(arrayOfByte.length);
      write(arrayOfByte);
      return;
    }
    writeInt(0);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.OpenBytesWriter
 * JD-Core Version:    0.6.2
 */