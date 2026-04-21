package com.sun.mail.imap.protocol;

import java.text.CharacterIterator;
import java.text.StringCharacterIterator;

public class BASE64MailboxDecoder
{
  static final char[] pem_array = { 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 44 };
  private static final byte[] pem_convert_array = new byte[256];

  static
  {
    int i = 0;
    if (i >= 255);
    for (int j = 0; ; j++)
    {
      if (j >= pem_array.length)
      {
        return;
        pem_convert_array[i] = -1;
        i++;
        break;
      }
      pem_convert_array[pem_array[j]] = ((byte)j);
    }
  }

  protected static int base64decode(char[] paramArrayOfChar, int paramInt, CharacterIterator paramCharacterIterator)
  {
    int i = 1;
    int j = -1;
    while (true)
    {
      int k = (byte)paramCharacterIterator.next();
      if (k == -1);
      label20: int i1;
      int i2;
      label143: int i3;
      do
      {
        int m;
        do
        {
          do
          {
            return paramInt;
            if (k != 45)
              break;
          }
          while (i == 0);
          int i12 = paramInt + 1;
          paramArrayOfChar[paramInt] = '&';
          return i12;
          m = (byte)paramCharacterIterator.next();
        }
        while ((m == -1) || (m == 45));
        int n = pem_convert_array[(k & 0xFF)];
        i1 = pem_convert_array[(m & 0xFF)];
        i2 = (byte)(0xFC & n << 2 | 0x3 & i1 >>> 4);
        if (j == -1)
          break label351;
        int i11 = paramInt + 1;
        paramArrayOfChar[paramInt] = ((char)(j << 8 | i2 & 0xFF));
        j = -1;
        paramInt = i11;
        i3 = (byte)paramCharacterIterator.next();
        i = 0;
        if (i3 == 61)
          break;
      }
      while ((i3 == -1) || (i3 == 45));
      int i4 = pem_convert_array[(i3 & 0xFF)];
      int i5 = (byte)(0xF0 & i1 << 4 | 0xF & i4 >>> 2);
      if (j != -1)
      {
        int i10 = paramInt + 1;
        paramArrayOfChar[paramInt] = ((char)(j << 8 | i5 & 0xFF));
        j = -1;
        paramInt = i10;
      }
      int i8;
      while (true)
      {
        int i6 = (byte)paramCharacterIterator.next();
        i = 0;
        if (i6 == 61)
          break;
        if ((i6 == -1) || (i6 == 45))
          break label20;
        int i7 = pem_convert_array[(i6 & 0xFF)];
        i8 = (byte)(0xC0 & i4 << 6 | i7 & 0x3F);
        if (j == -1)
          break label373;
        ((char)(j << 8 | i8 & 0xFF));
        int i9 = paramInt + 1;
        paramArrayOfChar[paramInt] = ((char)(j << 8 | i8 & 0xFF));
        j = -1;
        paramInt = i9;
        i = 0;
        break;
        label351: j = i2 & 0xFF;
        break label143;
        j = i5 & 0xFF;
      }
      label373: j = i8 & 0xFF;
      i = 0;
    }
  }

  public static String decode(String paramString)
  {
    if ((paramString == null) || (paramString.length() == 0));
    int i;
    char[] arrayOfChar;
    StringCharacterIterator localStringCharacterIterator;
    int j;
    int k;
    do
    {
      return paramString;
      i = 0;
      arrayOfChar = new char[paramString.length()];
      localStringCharacterIterator = new StringCharacterIterator(paramString);
      j = localStringCharacterIterator.first();
      k = 0;
      if (j != 65535)
        break;
    }
    while (i == 0);
    return new String(arrayOfChar, 0, k);
    int m;
    if (j == 38)
    {
      i = 1;
      m = base64decode(arrayOfChar, k, localStringCharacterIterator);
    }
    while (true)
    {
      j = localStringCharacterIterator.next();
      k = m;
      break;
      m = k + 1;
      arrayOfChar[k] = j;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.BASE64MailboxDecoder
 * JD-Core Version:    0.6.2
 */