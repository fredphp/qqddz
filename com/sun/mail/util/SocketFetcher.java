package com.sun.mail.util;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.StringTokenizer;
import javax.net.SocketFactory;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

public class SocketFetcher
{
  private static void configureSSLSocket(Socket paramSocket, Properties paramProperties, String paramString)
  {
    if (!(paramSocket instanceof SSLSocket))
      return;
    SSLSocket localSSLSocket = (SSLSocket)paramSocket;
    String str1 = paramProperties.getProperty(paramString + ".ssl.protocols", null);
    if (str1 != null)
      localSSLSocket.setEnabledProtocols(stringArray(str1));
    while (true)
    {
      String str2 = paramProperties.getProperty(paramString + ".ssl.ciphersuites", null);
      if (str2 == null)
        break;
      localSSLSocket.setEnabledCipherSuites(stringArray(str2));
      return;
      localSSLSocket.setEnabledProtocols(new String[] { "TLSv1" });
    }
  }

  private static Socket createSocket(InetAddress paramInetAddress, int paramInt1, String paramString, int paramInt2, int paramInt3, SocketFactory paramSocketFactory, boolean paramBoolean)
    throws IOException
  {
    Socket localSocket;
    if (paramSocketFactory != null)
      localSocket = paramSocketFactory.createSocket();
    while (true)
    {
      if (paramInetAddress != null)
        localSocket.bind(new InetSocketAddress(paramInetAddress, paramInt1));
      if (paramInt3 < 0)
        break;
      localSocket.connect(new InetSocketAddress(paramString, paramInt2), paramInt3);
      return localSocket;
      if (paramBoolean)
        localSocket = SSLSocketFactory.getDefault().createSocket();
      else
        localSocket = new Socket();
    }
    localSocket.connect(new InetSocketAddress(paramString, paramInt2));
    return localSocket;
  }

  private static ClassLoader getContextClassLoader()
  {
    return (ClassLoader)AccessController.doPrivileged(new PrivilegedAction()
    {
      public Object run()
      {
        try
        {
          ClassLoader localClassLoader = Thread.currentThread().getContextClassLoader();
          return localClassLoader;
        }
        catch (SecurityException localSecurityException)
        {
        }
        return null;
      }
    });
  }

  public static Socket getSocket(String paramString1, int paramInt, Properties paramProperties, String paramString2)
    throws IOException
  {
    return getSocket(paramString1, paramInt, paramProperties, paramString2, false);
  }

  // ERROR //
  public static Socket getSocket(String paramString1, int paramInt, Properties paramProperties, String paramString2, boolean paramBoolean)
    throws IOException
  {
    // Byte code:
    //   0: aload_3
    //   1: ifnonnull +6 -> 7
    //   4: ldc 116
    //   6: astore_3
    //   7: aload_2
    //   8: ifnonnull +11 -> 19
    //   11: new 35	java/util/Properties
    //   14: dup
    //   15: invokespecial 117	java/util/Properties:<init>	()V
    //   18: astore_2
    //   19: new 14	java/lang/StringBuilder
    //   22: dup
    //   23: aload_3
    //   24: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   27: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   30: ldc 119
    //   32: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   35: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   38: astore 5
    //   40: aload_2
    //   41: aload 5
    //   43: aconst_null
    //   44: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   47: astore 6
    //   49: iconst_m1
    //   50: istore 7
    //   52: aload 6
    //   54: ifnull +14 -> 68
    //   57: aload 6
    //   59: invokestatic 125	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   62: istore 40
    //   64: iload 40
    //   66: istore 7
    //   68: new 14	java/lang/StringBuilder
    //   71: dup
    //   72: aload_3
    //   73: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   76: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   79: ldc 127
    //   81: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   84: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   87: astore 8
    //   89: aload_2
    //   90: aload 8
    //   92: aconst_null
    //   93: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   96: astore 9
    //   98: new 14	java/lang/StringBuilder
    //   101: dup
    //   102: aload_3
    //   103: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   106: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   109: ldc 129
    //   111: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   114: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   117: astore 10
    //   119: aload_2
    //   120: aload 10
    //   122: aconst_null
    //   123: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   126: astore 11
    //   128: aconst_null
    //   129: astore 12
    //   131: aload 11
    //   133: ifnull +10 -> 143
    //   136: aload 11
    //   138: invokestatic 135	java/net/InetAddress:getByName	(Ljava/lang/String;)Ljava/net/InetAddress;
    //   141: astore 12
    //   143: new 14	java/lang/StringBuilder
    //   146: dup
    //   147: aload_3
    //   148: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   151: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   154: ldc 137
    //   156: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   159: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   162: astore 13
    //   164: aload_2
    //   165: aload 13
    //   167: aconst_null
    //   168: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   171: astore 14
    //   173: iconst_0
    //   174: istore 15
    //   176: aload 14
    //   178: ifnull +14 -> 192
    //   181: aload 14
    //   183: invokestatic 125	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   186: istore 38
    //   188: iload 38
    //   190: istore 15
    //   192: new 14	java/lang/StringBuilder
    //   195: dup
    //   196: aload_3
    //   197: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   200: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   203: ldc 139
    //   205: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   208: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   211: astore 16
    //   213: aload_2
    //   214: aload 16
    //   216: aconst_null
    //   217: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   220: astore 17
    //   222: aload 17
    //   224: ifnull +203 -> 427
    //   227: aload 17
    //   229: ldc 141
    //   231: invokevirtual 145	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   234: ifeq +193 -> 427
    //   237: iconst_0
    //   238: istore 18
    //   240: new 14	java/lang/StringBuilder
    //   243: dup
    //   244: aload_3
    //   245: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   248: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   251: ldc 147
    //   253: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   256: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   259: astore 19
    //   261: aload_2
    //   262: aload 19
    //   264: aconst_null
    //   265: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   268: astore 20
    //   270: iconst_m1
    //   271: istore 21
    //   273: aload 20
    //   275: invokestatic 151	com/sun/mail/util/SocketFetcher:getSocketFactory	(Ljava/lang/String;)Ljavax/net/SocketFactory;
    //   278: astore 31
    //   280: aconst_null
    //   281: astore 23
    //   283: aload 31
    //   285: ifnull +80 -> 365
    //   288: new 14	java/lang/StringBuilder
    //   291: dup
    //   292: aload_3
    //   293: invokestatic 20	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   296: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   299: ldc 153
    //   301: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   304: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   307: astore 32
    //   309: aload_2
    //   310: aload 32
    //   312: aconst_null
    //   313: invokevirtual 39	java/util/Properties:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   316: astore 33
    //   318: aload 33
    //   320: ifnull +14 -> 334
    //   323: aload 33
    //   325: invokestatic 125	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   328: istore 36
    //   330: iload 36
    //   332: istore 21
    //   334: iload 21
    //   336: iconst_m1
    //   337: if_icmpne +6 -> 343
    //   340: iload_1
    //   341: istore 21
    //   343: aload 12
    //   345: iload 15
    //   347: aload_0
    //   348: iload 21
    //   350: iload 7
    //   352: aload 31
    //   354: iload 4
    //   356: invokestatic 155	com/sun/mail/util/SocketFetcher:createSocket	(Ljava/net/InetAddress;ILjava/lang/String;IILjavax/net/SocketFactory;Z)Ljava/net/Socket;
    //   359: astore 34
    //   361: aload 34
    //   363: astore 23
    //   365: aload 23
    //   367: ifnonnull +19 -> 386
    //   370: aload 12
    //   372: iload 15
    //   374: aload_0
    //   375: iload_1
    //   376: iload 7
    //   378: aconst_null
    //   379: iload 4
    //   381: invokestatic 155	com/sun/mail/util/SocketFetcher:createSocket	(Ljava/net/InetAddress;ILjava/lang/String;IILjavax/net/SocketFactory;Z)Ljava/net/Socket;
    //   384: astore 23
    //   386: iconst_m1
    //   387: istore 27
    //   389: aload 9
    //   391: ifnull +14 -> 405
    //   394: aload 9
    //   396: invokestatic 125	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   399: istore 29
    //   401: iload 29
    //   403: istore 27
    //   405: iload 27
    //   407: iflt +10 -> 417
    //   410: aload 23
    //   412: iload 27
    //   414: invokevirtual 159	java/net/Socket:setSoTimeout	(I)V
    //   417: aload 23
    //   419: aload_2
    //   420: aload_3
    //   421: invokestatic 161	com/sun/mail/util/SocketFetcher:configureSSLSocket	(Ljava/net/Socket;Ljava/util/Properties;Ljava/lang/String;)V
    //   424: aload 23
    //   426: areturn
    //   427: iconst_1
    //   428: istore 18
    //   430: goto -190 -> 240
    //   433: astore 30
    //   435: aload 30
    //   437: athrow
    //   438: astore 22
    //   440: aconst_null
    //   441: astore 23
    //   443: iload 18
    //   445: ifne -80 -> 365
    //   448: aload 22
    //   450: instanceof 163
    //   453: ifeq +28 -> 481
    //   456: aload 22
    //   458: checkcast 163	java/lang/reflect/InvocationTargetException
    //   461: invokevirtual 167	java/lang/reflect/InvocationTargetException:getTargetException	()Ljava/lang/Throwable;
    //   464: astore 26
    //   466: aload 26
    //   468: instanceof 114
    //   471: ifeq +10 -> 481
    //   474: aload 26
    //   476: checkcast 114	java/lang/Exception
    //   479: astore 22
    //   481: aload 22
    //   483: instanceof 58
    //   486: ifeq +9 -> 495
    //   489: aload 22
    //   491: checkcast 58	java/io/IOException
    //   494: athrow
    //   495: new 58	java/io/IOException
    //   498: dup
    //   499: new 14	java/lang/StringBuilder
    //   502: dup
    //   503: ldc 169
    //   505: invokespecial 23	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   508: aload 20
    //   510: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   513: ldc 171
    //   515: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   518: aload_0
    //   519: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   522: ldc 173
    //   524: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   527: iload 21
    //   529: invokevirtual 176	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   532: ldc 178
    //   534: invokevirtual 29	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   537: aload 22
    //   539: invokevirtual 181	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   542: invokevirtual 33	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   545: invokespecial 182	java/io/IOException:<init>	(Ljava/lang/String;)V
    //   548: astore 24
    //   550: aload 24
    //   552: aload 22
    //   554: invokevirtual 186	java/io/IOException:initCause	(Ljava/lang/Throwable;)Ljava/lang/Throwable;
    //   557: pop
    //   558: aload 24
    //   560: athrow
    //   561: astore 39
    //   563: goto -495 -> 68
    //   566: astore 37
    //   568: iconst_0
    //   569: istore 15
    //   571: goto -379 -> 192
    //   574: astore 35
    //   576: goto -242 -> 334
    //   579: astore 28
    //   581: goto -176 -> 405
    //
    // Exception table:
    //   from	to	target	type
    //   273	280	433	java/net/SocketTimeoutException
    //   288	318	433	java/net/SocketTimeoutException
    //   323	330	433	java/net/SocketTimeoutException
    //   343	361	433	java/net/SocketTimeoutException
    //   273	280	438	java/lang/Exception
    //   288	318	438	java/lang/Exception
    //   323	330	438	java/lang/Exception
    //   343	361	438	java/lang/Exception
    //   57	64	561	java/lang/NumberFormatException
    //   181	188	566	java/lang/NumberFormatException
    //   323	330	574	java/lang/NumberFormatException
    //   394	401	579	java/lang/NumberFormatException
  }

  private static SocketFactory getSocketFactory(String paramString)
    throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InvocationTargetException
  {
    if ((paramString == null) || (paramString.length() == 0))
      return null;
    ClassLoader localClassLoader = getContextClassLoader();
    Object localObject = null;
    if (localClassLoader != null);
    try
    {
      Class localClass = localClassLoader.loadClass(paramString);
      localObject = localClass;
      if (localObject == null)
        localObject = Class.forName(paramString);
      return (SocketFactory)((Class)localObject).getMethod("getDefault", new Class[0]).invoke(new Object(), new Object[0]);
    }
    catch (ClassNotFoundException localClassNotFoundException)
    {
      while (true)
        localObject = null;
    }
  }

  public static Socket startTLS(Socket paramSocket)
    throws IOException
  {
    return startTLS(paramSocket, new Properties(), "socket");
  }

  public static Socket startTLS(Socket paramSocket, Properties paramProperties, String paramString)
    throws IOException
  {
    String str = paramSocket.getInetAddress().getHostName();
    int i = paramSocket.getPort();
    try
    {
      SocketFactory localSocketFactory = getSocketFactory(paramProperties.getProperty(paramString + ".socketFactory.class", null));
      if ((localSocketFactory != null) && ((localSocketFactory instanceof SSLSocketFactory)));
      for (SSLSocketFactory localSSLSocketFactory = (SSLSocketFactory)localSocketFactory; ; localSSLSocketFactory = (SSLSocketFactory)SSLSocketFactory.getDefault())
      {
        Socket localSocket = localSSLSocketFactory.createSocket(paramSocket, str, i, true);
        configureSSLSocket(localSocket, paramProperties, paramString);
        return localSocket;
      }
    }
    catch (Exception localException1)
    {
      Exception localException2;
      if ((localException1 instanceof InvocationTargetException))
      {
        Throwable localThrowable = ((InvocationTargetException)localException1).getTargetException();
        if ((localThrowable instanceof Exception))
          localException2 = (Exception)localThrowable;
      }
      if ((localException2 instanceof IOException))
        throw ((IOException)localException2);
      IOException localIOException = new IOException("Exception in startTLS: host " + str + ", port " + i + "; Exception: " + localException2);
      localIOException.initCause(localException2);
      throw localIOException;
    }
  }

  private static String[] stringArray(String paramString)
  {
    StringTokenizer localStringTokenizer = new StringTokenizer(paramString);
    ArrayList localArrayList = new ArrayList();
    while (true)
    {
      if (!localStringTokenizer.hasMoreTokens())
        return (String[])localArrayList.toArray(new String[localArrayList.size()]);
      localArrayList.add(localStringTokenizer.nextToken());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.SocketFetcher
 * JD-Core Version:    0.6.2
 */