package com.sun.mail.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class ASCIIUtility
{
  public static byte[] getBytes(InputStream paramInputStream)
    throws IOException
  {
    if ((paramInputStream instanceof ByteArrayInputStream))
    {
      int j = paramInputStream.available();
      byte[] arrayOfByte2 = new byte[j];
      paramInputStream.read(arrayOfByte2, 0, j);
      return arrayOfByte2;
    }
    ByteArrayOutputStream localByteArrayOutputStream = new ByteArrayOutputStream();
    byte[] arrayOfByte1 = new byte[1024];
    while (true)
    {
      int i = paramInputStream.read(arrayOfByte1, 0, 1024);
      if (i == -1)
        return localByteArrayOutputStream.toByteArray();
      localByteArrayOutputStream.write(arrayOfByte1, 0, i);
    }
  }

  public static byte[] getBytes(String paramString)
  {
    char[] arrayOfChar = paramString.toCharArray();
    int i = arrayOfChar.length;
    byte[] arrayOfByte = new byte[i];
    int k;
    for (int j = 0; ; j = k)
    {
      if (j >= i)
        return arrayOfByte;
      k = j + 1;
      arrayOfByte[j] = ((byte)arrayOfChar[j]);
    }
  }

  public static int parseInt(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws NumberFormatException
  {
    return parseInt(paramArrayOfByte, paramInt1, paramInt2, 10);
  }

  public static int parseInt(byte[] paramArrayOfByte, int paramInt1, int paramInt2, int paramInt3)
    throws NumberFormatException
  {
    if (paramArrayOfByte == null)
      throw new NumberFormatException("null");
    int i = paramInt1;
    int k;
    int j;
    int m;
    int n;
    int i1;
    if (paramInt2 > paramInt1)
    {
      if (paramArrayOfByte[i] == 45)
      {
        k = 1;
        j = -2147483648;
        i++;
      }
      int i5;
      while (true)
      {
        m = j / paramInt3;
        if (i >= paramInt2)
          break label254;
        n = i + 1;
        i5 = Character.digit((char)paramArrayOfByte[i], paramInt3);
        if (i5 >= 0)
          break;
        throw new NumberFormatException("illegal number: " + toString(paramArrayOfByte, paramInt1, paramInt2));
        j = -2147483647;
        k = 0;
      }
      i1 = -i5;
    }
    while (true)
    {
      if (n >= paramInt2)
      {
        if (k == 0)
          break label250;
        if (n > paramInt1 + 1)
          return i1;
      }
      else
      {
        int i2 = n + 1;
        int i3 = Character.digit((char)paramArrayOfByte[n], paramInt3);
        if (i3 < 0)
          throw new NumberFormatException("illegal number");
        if (i1 < m)
          throw new NumberFormatException("illegal number");
        int i4 = i1 * paramInt3;
        if (i4 < j + i3)
          throw new NumberFormatException("illegal number");
        i1 = i4 - i3;
        n = i2;
        continue;
        throw new NumberFormatException("illegal number");
      }
      throw new NumberFormatException("illegal number");
      label250: return -i1;
      label254: n = i;
      i1 = 0;
    }
  }

  public static long parseLong(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws NumberFormatException
  {
    return parseLong(paramArrayOfByte, paramInt1, paramInt2, 10);
  }

  public static long parseLong(byte[] paramArrayOfByte, int paramInt1, int paramInt2, int paramInt3)
    throws NumberFormatException
  {
    if (paramArrayOfByte == null)
      throw new NumberFormatException("null");
    long l1 = 0L;
    int i = paramInt1;
    int j;
    long l2;
    long l3;
    int k;
    if (paramInt2 > paramInt1)
    {
      if (paramArrayOfByte[i] == 45)
      {
        j = 1;
        l2 = -9223372036854775808L;
        i++;
      }
      int i1;
      while (true)
      {
        l3 = l2 / paramInt3;
        if (i >= paramInt2)
          break label266;
        k = i + 1;
        i1 = Character.digit((char)paramArrayOfByte[i], paramInt3);
        if (i1 >= 0)
          break;
        throw new NumberFormatException("illegal number: " + toString(paramArrayOfByte, paramInt1, paramInt2));
        l2 = -9223372036854775807L;
        j = 0;
      }
      l1 = -i1;
    }
    while (true)
    {
      if (k >= paramInt2)
      {
        if (j == 0)
          break label262;
        if (k > paramInt1 + 1)
          return l1;
      }
      else
      {
        int m = k + 1;
        int n = Character.digit((char)paramArrayOfByte[k], paramInt3);
        if (n < 0)
          throw new NumberFormatException("illegal number");
        if (l1 < l3)
          throw new NumberFormatException("illegal number");
        long l4 = l1 * paramInt3;
        if (l4 < l2 + n)
          throw new NumberFormatException("illegal number");
        l1 = l4 - n;
        k = m;
        continue;
        throw new NumberFormatException("illegal number");
      }
      throw new NumberFormatException("illegal number");
      label262: return -l1;
      label266: k = i;
    }
  }

  public static String toString(ByteArrayInputStream paramByteArrayInputStream)
  {
    int i = paramByteArrayInputStream.available();
    char[] arrayOfChar = new char[i];
    byte[] arrayOfByte = new byte[i];
    paramByteArrayInputStream.read(arrayOfByte, 0, i);
    int k;
    for (int j = 0; ; j = k)
    {
      if (j >= i)
        return new String(arrayOfChar);
      k = j + 1;
      arrayOfChar[j] = ((char)(0xFF & arrayOfByte[j]));
    }
  }

  public static String toString(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
  {
    int i = paramInt2 - paramInt1;
    char[] arrayOfChar = new char[i];
    int j = paramInt1;
    int m;
    for (int k = 0; ; k = m)
    {
      if (k >= i)
        return new String(arrayOfChar);
      m = k + 1;
      int n = j + 1;
      arrayOfChar[k] = ((char)(0xFF & paramArrayOfByte[j]));
      j = n;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.ASCIIUtility
 * JD-Core Version:    0.6.2
 */