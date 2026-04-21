package com.sun.mail.util;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class BASE64EncoderStream extends FilterOutputStream
{
  private static byte[] newline = { 13, 10 };
  private static final char[] pem_array = { 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47 };
  private byte[] buffer = new byte[3];
  private int bufsize = 0;
  private int bytesPerLine;
  private int count = 0;
  private int lineLimit;
  private boolean noCRLF = false;
  private byte[] outbuf;

  public BASE64EncoderStream(OutputStream paramOutputStream)
  {
    this(paramOutputStream, 76);
  }

  public BASE64EncoderStream(OutputStream paramOutputStream, int paramInt)
  {
    super(paramOutputStream);
    if ((paramInt == 2147483647) || (paramInt < 4))
    {
      this.noCRLF = true;
      paramInt = 76;
    }
    int i = 4 * (paramInt / 4);
    this.bytesPerLine = i;
    this.lineLimit = (3 * (i / 4));
    if (this.noCRLF)
    {
      this.outbuf = new byte[i];
      return;
    }
    this.outbuf = new byte[i + 2];
    this.outbuf[i] = 13;
    this.outbuf[(i + 1)] = 10;
  }

  private void encode()
    throws IOException
  {
    int i = encodedSize(this.bufsize);
    this.out.write(encode(this.buffer, 0, this.bufsize, this.outbuf), 0, i);
    this.count = (i + this.count);
    if (this.count >= this.bytesPerLine)
    {
      if (!this.noCRLF)
        this.out.write(newline);
      this.count = 0;
    }
  }

  public static byte[] encode(byte[] paramArrayOfByte)
  {
    if (paramArrayOfByte.length == 0)
      return paramArrayOfByte;
    return encode(paramArrayOfByte, 0, paramArrayOfByte.length, null);
  }

  private static byte[] encode(byte[] paramArrayOfByte1, int paramInt1, int paramInt2, byte[] paramArrayOfByte2)
  {
    if (paramArrayOfByte2 == null)
      paramArrayOfByte2 = new byte[encodedSize(paramInt2)];
    int i = 0;
    int i2;
    for (int j = paramInt1; ; j = i2)
    {
      if (paramInt2 < 3)
      {
        if (paramInt2 != 1)
          break;
        (j + 1);
        int i12 = (0xFF & paramArrayOfByte1[j]) << 4;
        paramArrayOfByte2[(i + 3)] = 61;
        paramArrayOfByte2[(i + 2)] = 61;
        paramArrayOfByte2[(i + 1)] = ((byte)pem_array[(i12 & 0x3F)]);
        int i13 = i12 >> 6;
        paramArrayOfByte2[(i + 0)] = ((byte)pem_array[(i13 & 0x3F)]);
        return paramArrayOfByte2;
      }
      int k = j + 1;
      int m = (0xFF & paramArrayOfByte1[j]) << 8;
      int n = k + 1;
      int i1 = (m | 0xFF & paramArrayOfByte1[k]) << 8;
      i2 = n + 1;
      int i3 = i1 | 0xFF & paramArrayOfByte1[n];
      paramArrayOfByte2[(i + 3)] = ((byte)pem_array[(i3 & 0x3F)]);
      int i4 = i3 >> 6;
      paramArrayOfByte2[(i + 2)] = ((byte)pem_array[(i4 & 0x3F)]);
      int i5 = i4 >> 6;
      paramArrayOfByte2[(i + 1)] = ((byte)pem_array[(i5 & 0x3F)]);
      int i6 = i5 >> 6;
      paramArrayOfByte2[(i + 0)] = ((byte)pem_array[(i6 & 0x3F)]);
      paramInt2 -= 3;
      i += 4;
    }
    if (paramInt2 == 2)
    {
      int i7 = j + 1;
      int i8 = (0xFF & paramArrayOfByte1[j]) << 8;
      j = i7 + 1;
      int i9 = (i8 | 0xFF & paramArrayOfByte1[i7]) << 2;
      paramArrayOfByte2[(i + 3)] = 61;
      paramArrayOfByte2[(i + 2)] = ((byte)pem_array[(i9 & 0x3F)]);
      int i10 = i9 >> 6;
      paramArrayOfByte2[(i + 1)] = ((byte)pem_array[(i10 & 0x3F)]);
      int i11 = i10 >> 6;
      paramArrayOfByte2[(i + 0)] = ((byte)pem_array[(i11 & 0x3F)]);
    }
    return paramArrayOfByte2;
  }

  private static int encodedSize(int paramInt)
  {
    return 4 * ((paramInt + 2) / 3);
  }

  public void close()
    throws IOException
  {
    try
    {
      flush();
      if ((this.count > 0) && (!this.noCRLF))
      {
        this.out.write(newline);
        this.out.flush();
      }
      this.out.close();
      return;
    }
    finally
    {
    }
  }

  public void flush()
    throws IOException
  {
    try
    {
      if (this.bufsize > 0)
      {
        encode();
        this.bufsize = 0;
      }
      this.out.flush();
      return;
    }
    finally
    {
    }
  }

  public void write(int paramInt)
    throws IOException
  {
    try
    {
      byte[] arrayOfByte = this.buffer;
      int i = this.bufsize;
      this.bufsize = (i + 1);
      arrayOfByte[i] = ((byte)paramInt);
      if (this.bufsize == 3)
      {
        encode();
        this.bufsize = 0;
      }
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void write(byte[] paramArrayOfByte)
    throws IOException
  {
    write(paramArrayOfByte, 0, paramArrayOfByte.length);
  }

  // ERROR //
  public void write(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: iload_2
    //   3: iload_3
    //   4: iadd
    //   5: istore 4
    //   7: iload_2
    //   8: istore 5
    //   10: aload_0
    //   11: getfield 98	com/sun/mail/util/BASE64EncoderStream:bufsize	I
    //   14: ifeq +10 -> 24
    //   17: iload 5
    //   19: iload 4
    //   21: if_icmplt +203 -> 224
    //   24: iconst_3
    //   25: aload_0
    //   26: getfield 107	com/sun/mail/util/BASE64EncoderStream:bytesPerLine	I
    //   29: aload_0
    //   30: getfield 100	com/sun/mail/util/BASE64EncoderStream:count	I
    //   33: isub
    //   34: iconst_4
    //   35: idiv
    //   36: imul
    //   37: istore 9
    //   39: iload 5
    //   41: iload 9
    //   43: iadd
    //   44: iload 4
    //   46: if_icmpge +261 -> 307
    //   49: iload 9
    //   51: invokestatic 118	com/sun/mail/util/BASE64EncoderStream:encodedSize	(I)I
    //   54: istore 10
    //   56: aload_0
    //   57: getfield 102	com/sun/mail/util/BASE64EncoderStream:noCRLF	Z
    //   60: ifne +41 -> 101
    //   63: aload_0
    //   64: getfield 111	com/sun/mail/util/BASE64EncoderStream:outbuf	[B
    //   67: astore 14
    //   69: iload 10
    //   71: iconst_1
    //   72: iadd
    //   73: istore 15
    //   75: aload 14
    //   77: iload 10
    //   79: bipush 13
    //   81: bastore
    //   82: aload_0
    //   83: getfield 111	com/sun/mail/util/BASE64EncoderStream:outbuf	[B
    //   86: astore 16
    //   88: iload 15
    //   90: iconst_1
    //   91: iadd
    //   92: istore 10
    //   94: aload 16
    //   96: iload 15
    //   98: bipush 10
    //   100: bastore
    //   101: aload_0
    //   102: getfield 122	com/sun/mail/util/BASE64EncoderStream:out	Ljava/io/OutputStream;
    //   105: aload_1
    //   106: iload 5
    //   108: iload 9
    //   110: aload_0
    //   111: getfield 111	com/sun/mail/util/BASE64EncoderStream:outbuf	[B
    //   114: invokestatic 125	com/sun/mail/util/BASE64EncoderStream:encode	([BII[B)[B
    //   117: iconst_0
    //   118: iload 10
    //   120: invokevirtual 131	java/io/OutputStream:write	([BII)V
    //   123: iload 5
    //   125: iload 9
    //   127: iadd
    //   128: istore 11
    //   130: aload_0
    //   131: iconst_0
    //   132: putfield 100	com/sun/mail/util/BASE64EncoderStream:count	I
    //   135: iload 11
    //   137: aload_0
    //   138: getfield 109	com/sun/mail/util/BASE64EncoderStream:lineLimit	I
    //   141: iadd
    //   142: iload 4
    //   144: if_icmplt +101 -> 245
    //   147: iload 11
    //   149: iconst_3
    //   150: iadd
    //   151: iload 4
    //   153: if_icmpge +61 -> 214
    //   156: iconst_3
    //   157: iload 4
    //   159: iload 11
    //   161: isub
    //   162: iconst_3
    //   163: idiv
    //   164: imul
    //   165: istore 12
    //   167: iload 12
    //   169: invokestatic 118	com/sun/mail/util/BASE64EncoderStream:encodedSize	(I)I
    //   172: istore 13
    //   174: aload_0
    //   175: getfield 122	com/sun/mail/util/BASE64EncoderStream:out	Ljava/io/OutputStream;
    //   178: aload_1
    //   179: iload 11
    //   181: iload 12
    //   183: aload_0
    //   184: getfield 111	com/sun/mail/util/BASE64EncoderStream:outbuf	[B
    //   187: invokestatic 125	com/sun/mail/util/BASE64EncoderStream:encode	([BII[B)[B
    //   190: iconst_0
    //   191: iload 13
    //   193: invokevirtual 131	java/io/OutputStream:write	([BII)V
    //   196: iload 11
    //   198: iload 12
    //   200: iadd
    //   201: istore 11
    //   203: aload_0
    //   204: iload 13
    //   206: aload_0
    //   207: getfield 100	com/sun/mail/util/BASE64EncoderStream:count	I
    //   210: iadd
    //   211: putfield 100	com/sun/mail/util/BASE64EncoderStream:count	I
    //   214: iload 11
    //   216: iload 4
    //   218: if_icmplt +60 -> 278
    //   221: aload_0
    //   222: monitorexit
    //   223: return
    //   224: iload 5
    //   226: iconst_1
    //   227: iadd
    //   228: istore 8
    //   230: aload_0
    //   231: aload_1
    //   232: iload 5
    //   234: baload
    //   235: invokevirtual 148	com/sun/mail/util/BASE64EncoderStream:write	(I)V
    //   238: iload 8
    //   240: istore 5
    //   242: goto -232 -> 10
    //   245: aload_0
    //   246: getfield 122	com/sun/mail/util/BASE64EncoderStream:out	Ljava/io/OutputStream;
    //   249: aload_1
    //   250: iload 11
    //   252: aload_0
    //   253: getfield 109	com/sun/mail/util/BASE64EncoderStream:lineLimit	I
    //   256: aload_0
    //   257: getfield 111	com/sun/mail/util/BASE64EncoderStream:outbuf	[B
    //   260: invokestatic 125	com/sun/mail/util/BASE64EncoderStream:encode	([BII[B)[B
    //   263: invokevirtual 134	java/io/OutputStream:write	([B)V
    //   266: iload 11
    //   268: aload_0
    //   269: getfield 109	com/sun/mail/util/BASE64EncoderStream:lineLimit	I
    //   272: iadd
    //   273: istore 11
    //   275: goto -140 -> 135
    //   278: aload_0
    //   279: aload_1
    //   280: iload 11
    //   282: baload
    //   283: invokevirtual 148	com/sun/mail/util/BASE64EncoderStream:write	(I)V
    //   286: iinc 11 1
    //   289: goto -75 -> 214
    //   292: astore 6
    //   294: iload 5
    //   296: pop
    //   297: aload_0
    //   298: monitorexit
    //   299: aload 6
    //   301: athrow
    //   302: astore 6
    //   304: goto -7 -> 297
    //   307: iload 5
    //   309: istore 11
    //   311: goto -176 -> 135
    //
    // Exception table:
    //   from	to	target	type
    //   10	17	292	finally
    //   24	39	292	finally
    //   49	69	292	finally
    //   75	88	292	finally
    //   94	101	292	finally
    //   101	123	292	finally
    //   130	135	302	finally
    //   135	147	302	finally
    //   156	196	302	finally
    //   203	214	302	finally
    //   230	238	302	finally
    //   245	275	302	finally
    //   278	286	302	finally
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.BASE64EncoderStream
 * JD-Core Version:    0.6.2
 */