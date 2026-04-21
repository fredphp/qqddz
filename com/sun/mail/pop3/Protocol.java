package com.sun.mail.pop3;

import com.sun.mail.util.LineInputStream;
import java.io.DataInputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

class Protocol
{
  private static final String CRLF = "\r\n";
  private static final int POP3_PORT = 110;
  private static char[] digits = { 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102 };
  private String apopChallenge;
  private boolean debug;
  private DataInputStream input;
  private PrintStream out;
  private PrintWriter output;
  private Socket socket;

  // ERROR //
  Protocol(String paramString1, int paramInt, boolean paramBoolean1, PrintStream paramPrintStream, java.util.Properties paramProperties, String paramString2, boolean paramBoolean2)
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: invokespecial 50	java/lang/Object:<init>	()V
    //   4: aload_0
    //   5: iconst_0
    //   6: putfield 52	com/sun/mail/pop3/Protocol:debug	Z
    //   9: aload_0
    //   10: aconst_null
    //   11: putfield 54	com/sun/mail/pop3/Protocol:apopChallenge	Ljava/lang/String;
    //   14: aload_0
    //   15: iload_3
    //   16: putfield 52	com/sun/mail/pop3/Protocol:debug	Z
    //   19: aload_0
    //   20: aload 4
    //   22: putfield 56	com/sun/mail/pop3/Protocol:out	Ljava/io/PrintStream;
    //   25: aload 5
    //   27: new 58	java/lang/StringBuilder
    //   30: dup
    //   31: aload 6
    //   33: invokestatic 64	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   36: invokespecial 67	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   39: ldc 69
    //   41: invokevirtual 73	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   44: invokevirtual 77	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   47: invokevirtual 83	java/util/Properties:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   50: astore 8
    //   52: aload 8
    //   54: ifnull +174 -> 228
    //   57: aload 8
    //   59: ldc 85
    //   61: invokevirtual 89	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   64: ifeq +164 -> 228
    //   67: iconst_1
    //   68: istore 9
    //   70: iload_2
    //   71: iconst_m1
    //   72: if_icmpne +6 -> 78
    //   75: bipush 110
    //   77: istore_2
    //   78: iload_3
    //   79: ifeq +43 -> 122
    //   82: aload 4
    //   84: new 58	java/lang/StringBuilder
    //   87: dup
    //   88: ldc 91
    //   90: invokespecial 67	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   93: aload_1
    //   94: invokevirtual 73	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   97: ldc 93
    //   99: invokevirtual 73	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   102: iload_2
    //   103: invokevirtual 96	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   106: ldc 98
    //   108: invokevirtual 73	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   111: iload 7
    //   113: invokevirtual 101	java/lang/StringBuilder:append	(Z)Ljava/lang/StringBuilder;
    //   116: invokevirtual 77	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   119: invokevirtual 106	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   122: aload_0
    //   123: aload_1
    //   124: iload_2
    //   125: aload 5
    //   127: aload 6
    //   129: iload 7
    //   131: invokestatic 112	com/sun/mail/util/SocketFetcher:getSocket	(Ljava/lang/String;ILjava/util/Properties;Ljava/lang/String;Z)Ljava/net/Socket;
    //   134: putfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   137: aload_0
    //   138: new 116	java/io/DataInputStream
    //   141: dup
    //   142: new 118	java/io/BufferedInputStream
    //   145: dup
    //   146: aload_0
    //   147: getfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   150: invokevirtual 124	java/net/Socket:getInputStream	()Ljava/io/InputStream;
    //   153: invokespecial 127	java/io/BufferedInputStream:<init>	(Ljava/io/InputStream;)V
    //   156: invokespecial 128	java/io/DataInputStream:<init>	(Ljava/io/InputStream;)V
    //   159: putfield 130	com/sun/mail/pop3/Protocol:input	Ljava/io/DataInputStream;
    //   162: aload_0
    //   163: new 132	java/io/PrintWriter
    //   166: dup
    //   167: new 134	java/io/BufferedWriter
    //   170: dup
    //   171: new 136	java/io/OutputStreamWriter
    //   174: dup
    //   175: aload_0
    //   176: getfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   179: invokevirtual 140	java/net/Socket:getOutputStream	()Ljava/io/OutputStream;
    //   182: ldc 142
    //   184: invokespecial 145	java/io/OutputStreamWriter:<init>	(Ljava/io/OutputStream;Ljava/lang/String;)V
    //   187: invokespecial 148	java/io/BufferedWriter:<init>	(Ljava/io/Writer;)V
    //   190: invokespecial 149	java/io/PrintWriter:<init>	(Ljava/io/Writer;)V
    //   193: putfield 151	com/sun/mail/pop3/Protocol:output	Ljava/io/PrintWriter;
    //   196: aload_0
    //   197: aconst_null
    //   198: invokespecial 155	com/sun/mail/pop3/Protocol:simpleCommand	(Ljava/lang/String;)Lcom/sun/mail/pop3/Response;
    //   201: astore 12
    //   203: aload 12
    //   205: getfield 160	com/sun/mail/pop3/Response:ok	Z
    //   208: ifne +38 -> 246
    //   211: aload_0
    //   212: getfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   215: invokevirtual 163	java/net/Socket:close	()V
    //   218: new 48	java/io/IOException
    //   221: dup
    //   222: ldc 165
    //   224: invokespecial 166	java/io/IOException:<init>	(Ljava/lang/String;)V
    //   227: athrow
    //   228: iconst_0
    //   229: istore 9
    //   231: goto -161 -> 70
    //   234: astore 10
    //   236: aload_0
    //   237: getfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   240: invokevirtual 163	java/net/Socket:close	()V
    //   243: aload 10
    //   245: athrow
    //   246: iload 9
    //   248: ifeq +87 -> 335
    //   251: aload 12
    //   253: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   256: bipush 60
    //   258: invokevirtual 173	java/lang/String:indexOf	(I)I
    //   261: istore 13
    //   263: aload 12
    //   265: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   268: bipush 62
    //   270: iload 13
    //   272: invokevirtual 176	java/lang/String:indexOf	(II)I
    //   275: istore 14
    //   277: iload 13
    //   279: iconst_m1
    //   280: if_icmpeq +27 -> 307
    //   283: iload 14
    //   285: iconst_m1
    //   286: if_icmpeq +21 -> 307
    //   289: aload_0
    //   290: aload 12
    //   292: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   295: iload 13
    //   297: iload 14
    //   299: iconst_1
    //   300: iadd
    //   301: invokevirtual 180	java/lang/String:substring	(II)Ljava/lang/String;
    //   304: putfield 54	com/sun/mail/pop3/Protocol:apopChallenge	Ljava/lang/String;
    //   307: iload_3
    //   308: ifeq +27 -> 335
    //   311: aload 4
    //   313: new 58	java/lang/StringBuilder
    //   316: dup
    //   317: ldc 182
    //   319: invokespecial 67	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   322: aload_0
    //   323: getfield 54	com/sun/mail/pop3/Protocol:apopChallenge	Ljava/lang/String;
    //   326: invokevirtual 73	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   329: invokevirtual 77	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   332: invokevirtual 106	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   335: return
    //   336: astore 15
    //   338: goto -120 -> 218
    //   341: astore 11
    //   343: goto -100 -> 243
    //
    // Exception table:
    //   from	to	target	type
    //   82	122	234	java/io/IOException
    //   122	203	234	java/io/IOException
    //   211	218	336	finally
    //   236	243	341	finally
  }

  private String getDigest(String paramString)
  {
    String str = this.apopChallenge + paramString;
    try
    {
      byte[] arrayOfByte = MessageDigest.getInstance("MD5").digest(str.getBytes("iso-8859-1"));
      return toHex(arrayOfByte);
    }
    catch (NoSuchAlgorithmException localNoSuchAlgorithmException)
    {
      return null;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
    }
    return null;
  }

  private Response multilineCommand(String paramString, int paramInt)
    throws IOException
  {
    Response localResponse = simpleCommand(paramString);
    if (!localResponse.ok)
      return localResponse;
    SharedByteArrayOutputStream localSharedByteArrayOutputStream = new SharedByteArrayOutputStream(paramInt);
    int j;
    for (int i = 10; ; i = j)
    {
      j = this.input.read();
      if (j < 0);
      while (true)
      {
        if (j >= 0)
          break label178;
        throw new EOFException("EOF on socket");
        if ((i != 10) || (j != 46))
          break;
        if (this.debug)
          this.out.write(j);
        j = this.input.read();
        if (j != 13)
          break;
        if (this.debug)
          this.out.write(j);
        j = this.input.read();
        if (this.debug)
          this.out.write(j);
      }
      localSharedByteArrayOutputStream.write(j);
      if (this.debug)
        this.out.write(j);
    }
    label178: localResponse.bytes = localSharedByteArrayOutputStream.toStream();
    return localResponse;
  }

  private Response simpleCommand(String paramString)
    throws IOException
  {
    if (this.socket == null)
      throw new IOException("Folder is closed");
    if (paramString != null)
    {
      if (this.debug)
        this.out.println("C: " + paramString);
      String str2 = paramString + "\r\n";
      this.output.print(str2);
      this.output.flush();
    }
    String str1 = this.input.readLine();
    if (str1 == null)
    {
      if (this.debug)
        this.out.println("S: EOF");
      throw new EOFException("EOF on socket");
    }
    if (this.debug)
      this.out.println("S: " + str1);
    Response localResponse = new Response();
    if (str1.startsWith("+OK"));
    for (localResponse.ok = true; ; localResponse.ok = false)
    {
      int i = str1.indexOf(' ');
      if (i >= 0)
        localResponse.data = str1.substring(i + 1);
      return localResponse;
      if (!str1.startsWith("-ERR"))
        break;
    }
    throw new IOException("Unexpected response: " + str1);
  }

  private static String toHex(byte[] paramArrayOfByte)
  {
    char[] arrayOfChar = new char[2 * paramArrayOfByte.length];
    int i = 0;
    int j = 0;
    while (true)
    {
      if (i >= paramArrayOfByte.length)
        return new String(arrayOfChar);
      int k = 0xFF & paramArrayOfByte[i];
      int m = j + 1;
      arrayOfChar[j] = digits[(k >> 4)];
      j = m + 1;
      arrayOfChar[m] = digits[(k & 0xF)];
      i++;
    }
  }

  boolean dele(int paramInt)
    throws IOException
  {
    try
    {
      boolean bool = simpleCommand("DELE " + paramInt).ok;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    if (this.socket != null)
      quit();
  }

  // ERROR //
  int list(int paramInt)
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: new 58	java/lang/StringBuilder
    //   6: dup
    //   7: ldc_w 285
    //   10: invokespecial 67	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   13: iload_1
    //   14: invokevirtual 96	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   17: invokevirtual 77	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   20: invokespecial 155	com/sun/mail/pop3/Protocol:simpleCommand	(Ljava/lang/String;)Lcom/sun/mail/pop3/Response;
    //   23: astore_3
    //   24: iconst_m1
    //   25: istore 4
    //   27: aload_3
    //   28: getfield 160	com/sun/mail/pop3/Response:ok	Z
    //   31: ifeq +47 -> 78
    //   34: aload_3
    //   35: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   38: astore 5
    //   40: aload 5
    //   42: ifnull +36 -> 78
    //   45: new 287	java/util/StringTokenizer
    //   48: dup
    //   49: aload_3
    //   50: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   53: invokespecial 288	java/util/StringTokenizer:<init>	(Ljava/lang/String;)V
    //   56: astore 6
    //   58: aload 6
    //   60: invokevirtual 291	java/util/StringTokenizer:nextToken	()Ljava/lang/String;
    //   63: pop
    //   64: aload 6
    //   66: invokevirtual 291	java/util/StringTokenizer:nextToken	()Ljava/lang/String;
    //   69: invokestatic 297	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   72: istore 9
    //   74: iload 9
    //   76: istore 4
    //   78: aload_0
    //   79: monitorexit
    //   80: iload 4
    //   82: ireturn
    //   83: astore_2
    //   84: aload_0
    //   85: monitorexit
    //   86: aload_2
    //   87: athrow
    //   88: astore 7
    //   90: goto -12 -> 78
    //
    // Exception table:
    //   from	to	target	type
    //   2	24	83	finally
    //   27	40	83	finally
    //   45	74	83	finally
    //   45	74	88	java/lang/Exception
  }

  InputStream list()
    throws IOException
  {
    try
    {
      InputStream localInputStream = multilineCommand("LIST", 128).bytes;
      return localInputStream;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  String login(String paramString1, String paramString2)
    throws IOException
  {
    while (true)
    {
      try
      {
        String str1 = this.apopChallenge;
        String str2 = null;
        if (str1 != null)
          str2 = getDigest(paramString2);
        Response localResponse1;
        if ((this.apopChallenge != null) && (str2 != null))
        {
          localResponse1 = simpleCommand("APOP " + paramString1 + " " + str2);
          if (localResponse1.ok)
            continue;
          if (localResponse1.data != null)
          {
            str3 = localResponse1.data;
            return str3;
          }
        }
        else
        {
          Response localResponse2 = simpleCommand("USER " + paramString1);
          if (!localResponse2.ok)
          {
            if (localResponse2.data == null)
              break label191;
            str3 = localResponse2.data;
            continue;
          }
          localResponse1 = simpleCommand("PASS " + paramString2);
          continue;
        }
        str3 = "login failed";
        continue;
        str3 = null;
        continue;
      }
      finally
      {
      }
      label191: String str3 = "USER command failed";
    }
  }

  boolean noop()
    throws IOException
  {
    try
    {
      boolean bool = simpleCommand("NOOP").ok;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  boolean quit()
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: ldc_w 322
    //   6: invokespecial 155	com/sun/mail/pop3/Protocol:simpleCommand	(Ljava/lang/String;)Lcom/sun/mail/pop3/Response;
    //   9: getfield 160	com/sun/mail/pop3/Response:ok	Z
    //   12: istore 4
    //   14: aload_0
    //   15: getfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   18: invokevirtual 163	java/net/Socket:close	()V
    //   21: aload_0
    //   22: aconst_null
    //   23: putfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   26: aload_0
    //   27: aconst_null
    //   28: putfield 130	com/sun/mail/pop3/Protocol:input	Ljava/io/DataInputStream;
    //   31: aload_0
    //   32: aconst_null
    //   33: putfield 151	com/sun/mail/pop3/Protocol:output	Ljava/io/PrintWriter;
    //   36: aload_0
    //   37: monitorexit
    //   38: iload 4
    //   40: ireturn
    //   41: astore_1
    //   42: aload_0
    //   43: getfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   46: invokevirtual 163	java/net/Socket:close	()V
    //   49: aload_0
    //   50: aconst_null
    //   51: putfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   54: aload_0
    //   55: aconst_null
    //   56: putfield 130	com/sun/mail/pop3/Protocol:input	Ljava/io/DataInputStream;
    //   59: aload_0
    //   60: aconst_null
    //   61: putfield 151	com/sun/mail/pop3/Protocol:output	Ljava/io/PrintWriter;
    //   64: aload_1
    //   65: athrow
    //   66: astore_3
    //   67: aload_0
    //   68: monitorexit
    //   69: aload_3
    //   70: athrow
    //   71: astore_2
    //   72: aload_0
    //   73: aconst_null
    //   74: putfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   77: aload_0
    //   78: aconst_null
    //   79: putfield 130	com/sun/mail/pop3/Protocol:input	Ljava/io/DataInputStream;
    //   82: aload_0
    //   83: aconst_null
    //   84: putfield 151	com/sun/mail/pop3/Protocol:output	Ljava/io/PrintWriter;
    //   87: aload_2
    //   88: athrow
    //   89: astore 5
    //   91: aload_0
    //   92: aconst_null
    //   93: putfield 114	com/sun/mail/pop3/Protocol:socket	Ljava/net/Socket;
    //   96: aload_0
    //   97: aconst_null
    //   98: putfield 130	com/sun/mail/pop3/Protocol:input	Ljava/io/DataInputStream;
    //   101: aload_0
    //   102: aconst_null
    //   103: putfield 151	com/sun/mail/pop3/Protocol:output	Ljava/io/PrintWriter;
    //   106: aload 5
    //   108: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   2	14	41	finally
    //   21	36	66	finally
    //   49	66	66	finally
    //   72	89	66	finally
    //   91	109	66	finally
    //   42	49	71	finally
    //   14	21	89	finally
  }

  InputStream retr(int paramInt1, int paramInt2)
    throws IOException
  {
    try
    {
      InputStream localInputStream = multilineCommand("RETR " + paramInt1, paramInt2).bytes;
      return localInputStream;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  boolean rset()
    throws IOException
  {
    try
    {
      boolean bool = simpleCommand("RSET").ok;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  Status stat()
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: ldc_w 333
    //   6: invokespecial 155	com/sun/mail/pop3/Protocol:simpleCommand	(Ljava/lang/String;)Lcom/sun/mail/pop3/Response;
    //   9: astore_2
    //   10: new 335	com/sun/mail/pop3/Status
    //   13: dup
    //   14: invokespecial 336	com/sun/mail/pop3/Status:<init>	()V
    //   17: astore_3
    //   18: aload_2
    //   19: getfield 160	com/sun/mail/pop3/Response:ok	Z
    //   22: ifeq +51 -> 73
    //   25: aload_2
    //   26: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   29: astore 4
    //   31: aload 4
    //   33: ifnull +40 -> 73
    //   36: new 287	java/util/StringTokenizer
    //   39: dup
    //   40: aload_2
    //   41: getfield 169	com/sun/mail/pop3/Response:data	Ljava/lang/String;
    //   44: invokespecial 288	java/util/StringTokenizer:<init>	(Ljava/lang/String;)V
    //   47: astore 5
    //   49: aload_3
    //   50: aload 5
    //   52: invokevirtual 291	java/util/StringTokenizer:nextToken	()Ljava/lang/String;
    //   55: invokestatic 297	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   58: putfield 339	com/sun/mail/pop3/Status:total	I
    //   61: aload_3
    //   62: aload 5
    //   64: invokevirtual 291	java/util/StringTokenizer:nextToken	()Ljava/lang/String;
    //   67: invokestatic 297	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   70: putfield 342	com/sun/mail/pop3/Status:size	I
    //   73: aload_0
    //   74: monitorexit
    //   75: aload_3
    //   76: areturn
    //   77: astore_1
    //   78: aload_0
    //   79: monitorexit
    //   80: aload_1
    //   81: athrow
    //   82: astore 6
    //   84: goto -11 -> 73
    //
    // Exception table:
    //   from	to	target	type
    //   2	31	77	finally
    //   36	73	77	finally
    //   36	73	82	java/lang/Exception
  }

  InputStream top(int paramInt1, int paramInt2)
    throws IOException
  {
    try
    {
      InputStream localInputStream = multilineCommand("TOP " + paramInt1 + " " + paramInt2, 0).bytes;
      return localInputStream;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  String uidl(int paramInt)
    throws IOException
  {
    try
    {
      Response localResponse = simpleCommand("UIDL " + paramInt);
      boolean bool = localResponse.ok;
      Object localObject2 = null;
      if (!bool);
      while (true)
      {
        return localObject2;
        int i = localResponse.data.indexOf(' ');
        localObject2 = null;
        if (i > 0)
        {
          String str = localResponse.data.substring(i + 1);
          localObject2 = str;
        }
      }
    }
    finally
    {
    }
  }

  boolean uidl(String[] paramArrayOfString)
    throws IOException
  {
    try
    {
      Response localResponse = multilineCommand("UIDL", 15 * paramArrayOfString.length);
      boolean bool1 = localResponse.ok;
      boolean bool2 = false;
      if (!bool1)
        return bool2;
      LineInputStream localLineInputStream = new LineInputStream(localResponse.bytes);
      while (true)
      {
        String str = localLineInputStream.readLine();
        if (str == null)
        {
          bool2 = true;
          break;
        }
        int i = str.indexOf(' ');
        if ((i >= 1) && (i < str.length()))
        {
          int j = Integer.parseInt(str.substring(0, i));
          if ((j > 0) && (j <= paramArrayOfString.length))
            paramArrayOfString[(j - 1)] = str.substring(i + 1);
        }
      }
    }
    finally
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.Protocol
 * JD-Core Version:    0.6.2
 */