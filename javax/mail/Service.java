package javax.mail;

import java.util.Vector;
import javax.mail.event.ConnectionEvent;
import javax.mail.event.ConnectionListener;
import javax.mail.event.MailEvent;

public abstract class Service
{
  private boolean connected = false;
  private Vector connectionListeners = null;
  protected boolean debug = false;
  private EventQueue q;
  private Object qLock = new Object();
  protected Session session;
  protected URLName url = null;

  protected Service(Session paramSession, URLName paramURLName)
  {
    this.session = paramSession;
    this.url = paramURLName;
    this.debug = paramSession.getDebug();
  }

  private void terminateQueue()
  {
    synchronized (this.qLock)
    {
      if (this.q != null)
      {
        Vector localVector = new Vector();
        localVector.setSize(1);
        this.q.enqueue(new TerminatorEvent(), localVector);
        this.q = null;
      }
      return;
    }
  }

  public void addConnectionListener(ConnectionListener paramConnectionListener)
  {
    try
    {
      if (this.connectionListeners == null)
        this.connectionListeners = new Vector();
      this.connectionListeners.addElement(paramConnectionListener);
      return;
    }
    finally
    {
    }
  }

  public void close()
    throws MessagingException
  {
    try
    {
      setConnected(false);
      notifyConnectionListeners(3);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void connect()
    throws MessagingException
  {
    connect(null, null, null);
  }

  // ERROR //
  public void connect(String paramString1, int paramInt, String paramString2, String paramString3)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 89	javax/mail/Service:isConnected	()Z
    //   6: ifeq +20 -> 26
    //   9: new 91	java/lang/IllegalStateException
    //   12: dup
    //   13: ldc 93
    //   15: invokespecial 96	java/lang/IllegalStateException:<init>	(Ljava/lang/String;)V
    //   18: athrow
    //   19: astore 5
    //   21: aload_0
    //   22: monitorexit
    //   23: aload 5
    //   25: athrow
    //   26: aload_0
    //   27: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   30: astore 6
    //   32: aconst_null
    //   33: astore 7
    //   35: aconst_null
    //   36: astore 8
    //   38: aload 6
    //   40: ifnull +72 -> 112
    //   43: aload_0
    //   44: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   47: invokevirtual 102	javax/mail/URLName:getProtocol	()Ljava/lang/String;
    //   50: astore 7
    //   52: aload_1
    //   53: ifnonnull +11 -> 64
    //   56: aload_0
    //   57: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   60: invokevirtual 105	javax/mail/URLName:getHost	()Ljava/lang/String;
    //   63: astore_1
    //   64: iload_2
    //   65: iconst_m1
    //   66: if_icmpne +11 -> 77
    //   69: aload_0
    //   70: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   73: invokevirtual 109	javax/mail/URLName:getPort	()I
    //   76: istore_2
    //   77: aload_3
    //   78: ifnonnull +324 -> 402
    //   81: aload_0
    //   82: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   85: invokevirtual 112	javax/mail/URLName:getUsername	()Ljava/lang/String;
    //   88: astore_3
    //   89: aload 4
    //   91: ifnonnull +12 -> 103
    //   94: aload_0
    //   95: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   98: invokevirtual 115	javax/mail/URLName:getPassword	()Ljava/lang/String;
    //   101: astore 4
    //   103: aload_0
    //   104: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   107: invokevirtual 118	javax/mail/URLName:getFile	()Ljava/lang/String;
    //   110: astore 8
    //   112: aload 7
    //   114: ifnull +71 -> 185
    //   117: aload_1
    //   118: ifnonnull +33 -> 151
    //   121: aload_0
    //   122: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   125: new 120	java/lang/StringBuilder
    //   128: dup
    //   129: ldc 122
    //   131: invokespecial 123	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   134: aload 7
    //   136: invokevirtual 127	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   139: ldc 129
    //   141: invokevirtual 127	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   144: invokevirtual 132	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   147: invokevirtual 136	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   150: astore_1
    //   151: aload_3
    //   152: ifnonnull +33 -> 185
    //   155: aload_0
    //   156: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   159: new 120	java/lang/StringBuilder
    //   162: dup
    //   163: ldc 122
    //   165: invokespecial 123	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   168: aload 7
    //   170: invokevirtual 127	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   173: ldc 138
    //   175: invokevirtual 127	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   178: invokevirtual 132	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   181: invokevirtual 136	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   184: astore_3
    //   185: aload_1
    //   186: ifnonnull +13 -> 199
    //   189: aload_0
    //   190: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   193: ldc 140
    //   195: invokevirtual 136	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   198: astore_1
    //   199: aload_3
    //   200: ifnonnull +17 -> 217
    //   203: aload_0
    //   204: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   207: ldc 142
    //   209: invokevirtual 136	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   212: astore 9
    //   214: aload 9
    //   216: astore_3
    //   217: aload_3
    //   218: ifnonnull +13 -> 231
    //   221: ldc 144
    //   223: invokestatic 147	java/lang/System:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   226: astore 25
    //   228: aload 25
    //   230: astore_3
    //   231: iconst_0
    //   232: istore 10
    //   234: aload 4
    //   236: ifnonnull +75 -> 311
    //   239: aload_0
    //   240: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   243: astore 19
    //   245: iconst_0
    //   246: istore 10
    //   248: aload 19
    //   250: ifnull +61 -> 311
    //   253: aload_0
    //   254: new 98	javax/mail/URLName
    //   257: dup
    //   258: aload 7
    //   260: aload_1
    //   261: iload_2
    //   262: aload 8
    //   264: aload_3
    //   265: aconst_null
    //   266: invokespecial 150	javax/mail/URLName:<init>	(Ljava/lang/String;Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
    //   269: invokevirtual 154	javax/mail/Service:setURLName	(Ljavax/mail/URLName;)V
    //   272: aload_0
    //   273: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   276: aload_0
    //   277: invokevirtual 158	javax/mail/Service:getURLName	()Ljavax/mail/URLName;
    //   280: invokevirtual 162	javax/mail/Session:getPasswordAuthentication	(Ljavax/mail/URLName;)Ljavax/mail/PasswordAuthentication;
    //   283: astore 20
    //   285: aload 20
    //   287: ifnull +277 -> 564
    //   290: aload_3
    //   291: ifnonnull +170 -> 461
    //   294: aload 20
    //   296: invokevirtual 167	javax/mail/PasswordAuthentication:getUserName	()Ljava/lang/String;
    //   299: astore_3
    //   300: aload 20
    //   302: invokevirtual 168	javax/mail/PasswordAuthentication:getPassword	()Ljava/lang/String;
    //   305: astore 21
    //   307: aload 21
    //   309: astore 4
    //   311: aconst_null
    //   312: astore 11
    //   314: aload_0
    //   315: aload_1
    //   316: iload_2
    //   317: aload_3
    //   318: aload 4
    //   320: invokevirtual 172	javax/mail/Service:protocolConnect	(Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;)Z
    //   323: istore 18
    //   325: iload 18
    //   327: istore 13
    //   329: iload 13
    //   331: ifne +58 -> 389
    //   334: aload_1
    //   335: invokestatic 178	java/net/InetAddress:getByName	(Ljava/lang/String;)Ljava/net/InetAddress;
    //   338: astore 17
    //   340: aload 17
    //   342: astore 15
    //   344: aload_0
    //   345: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   348: aload 15
    //   350: iload_2
    //   351: aload 7
    //   353: aconst_null
    //   354: aload_3
    //   355: invokevirtual 182	javax/mail/Session:requestPasswordAuthentication	(Ljava/net/InetAddress;ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljavax/mail/PasswordAuthentication;
    //   358: astore 16
    //   360: aload 16
    //   362: ifnull +27 -> 389
    //   365: aload 16
    //   367: invokevirtual 167	javax/mail/PasswordAuthentication:getUserName	()Ljava/lang/String;
    //   370: astore_3
    //   371: aload 16
    //   373: invokevirtual 168	javax/mail/PasswordAuthentication:getPassword	()Ljava/lang/String;
    //   376: astore 4
    //   378: aload_0
    //   379: aload_1
    //   380: iload_2
    //   381: aload_3
    //   382: aload 4
    //   384: invokevirtual 172	javax/mail/Service:protocolConnect	(Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;)Z
    //   387: istore 13
    //   389: iload 13
    //   391: ifne +114 -> 505
    //   394: aload 11
    //   396: ifnull +101 -> 497
    //   399: aload 11
    //   401: athrow
    //   402: aload 4
    //   404: ifnonnull -301 -> 103
    //   407: aload_0
    //   408: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   411: invokevirtual 112	javax/mail/URLName:getUsername	()Ljava/lang/String;
    //   414: astore 26
    //   416: aload_3
    //   417: aload 26
    //   419: invokevirtual 188	java/lang/String:equals	(Ljava/lang/Object;)Z
    //   422: ifeq -319 -> 103
    //   425: aload_0
    //   426: getfield 24	javax/mail/Service:url	Ljavax/mail/URLName;
    //   429: invokevirtual 115	javax/mail/URLName:getPassword	()Ljava/lang/String;
    //   432: astore 4
    //   434: goto -331 -> 103
    //   437: astore 24
    //   439: aload_0
    //   440: getfield 26	javax/mail/Service:debug	Z
    //   443: ifeq -212 -> 231
    //   446: aload 24
    //   448: aload_0
    //   449: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   452: invokevirtual 192	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   455: invokevirtual 196	java/lang/SecurityException:printStackTrace	(Ljava/io/PrintStream;)V
    //   458: goto -227 -> 231
    //   461: aload 20
    //   463: invokevirtual 167	javax/mail/PasswordAuthentication:getUserName	()Ljava/lang/String;
    //   466: astore 22
    //   468: aload_3
    //   469: aload 22
    //   471: invokevirtual 188	java/lang/String:equals	(Ljava/lang/Object;)Z
    //   474: istore 23
    //   476: iconst_0
    //   477: istore 10
    //   479: iload 23
    //   481: ifeq -170 -> 311
    //   484: aload 20
    //   486: invokevirtual 168	javax/mail/PasswordAuthentication:getPassword	()Ljava/lang/String;
    //   489: astore 4
    //   491: iconst_0
    //   492: istore 10
    //   494: goto -183 -> 311
    //   497: new 84	javax/mail/AuthenticationFailedException
    //   500: dup
    //   501: invokespecial 197	javax/mail/AuthenticationFailedException:<init>	()V
    //   504: athrow
    //   505: aload_0
    //   506: new 98	javax/mail/URLName
    //   509: dup
    //   510: aload 7
    //   512: aload_1
    //   513: iload_2
    //   514: aload 8
    //   516: aload_3
    //   517: aload 4
    //   519: invokespecial 150	javax/mail/URLName:<init>	(Ljava/lang/String;Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
    //   522: invokevirtual 154	javax/mail/Service:setURLName	(Ljavax/mail/URLName;)V
    //   525: iload 10
    //   527: ifeq +24 -> 551
    //   530: aload_0
    //   531: getfield 34	javax/mail/Service:session	Ljavax/mail/Session;
    //   534: aload_0
    //   535: invokevirtual 158	javax/mail/Service:getURLName	()Ljavax/mail/URLName;
    //   538: new 164	javax/mail/PasswordAuthentication
    //   541: dup
    //   542: aload_3
    //   543: aload 4
    //   545: invokespecial 200	javax/mail/PasswordAuthentication:<init>	(Ljava/lang/String;Ljava/lang/String;)V
    //   548: invokevirtual 204	javax/mail/Session:setPasswordAuthentication	(Ljavax/mail/URLName;Ljavax/mail/PasswordAuthentication;)V
    //   551: aload_0
    //   552: iconst_1
    //   553: invokevirtual 72	javax/mail/Service:setConnected	(Z)V
    //   556: aload_0
    //   557: iconst_1
    //   558: invokevirtual 75	javax/mail/Service:notifyConnectionListeners	(I)V
    //   561: aload_0
    //   562: monitorexit
    //   563: return
    //   564: iconst_1
    //   565: istore 10
    //   567: goto -256 -> 311
    //   570: astore 12
    //   572: aload 12
    //   574: astore 11
    //   576: iconst_0
    //   577: istore 13
    //   579: goto -250 -> 329
    //   582: astore 14
    //   584: aconst_null
    //   585: astore 15
    //   587: goto -243 -> 344
    //
    // Exception table:
    //   from	to	target	type
    //   2	19	19	finally
    //   26	32	19	finally
    //   43	52	19	finally
    //   56	64	19	finally
    //   69	77	19	finally
    //   81	89	19	finally
    //   94	103	19	finally
    //   103	112	19	finally
    //   121	151	19	finally
    //   155	185	19	finally
    //   189	199	19	finally
    //   203	214	19	finally
    //   221	228	19	finally
    //   239	245	19	finally
    //   253	285	19	finally
    //   294	307	19	finally
    //   314	325	19	finally
    //   334	340	19	finally
    //   344	360	19	finally
    //   365	389	19	finally
    //   399	402	19	finally
    //   407	434	19	finally
    //   439	458	19	finally
    //   461	476	19	finally
    //   484	491	19	finally
    //   497	505	19	finally
    //   505	525	19	finally
    //   530	551	19	finally
    //   551	561	19	finally
    //   221	228	437	java/lang/SecurityException
    //   314	325	570	javax/mail/AuthenticationFailedException
    //   334	340	582	java/net/UnknownHostException
  }

  public void connect(String paramString1, String paramString2)
    throws MessagingException
  {
    connect(null, paramString1, paramString2);
  }

  public void connect(String paramString1, String paramString2, String paramString3)
    throws MessagingException
  {
    connect(paramString1, -1, paramString2, paramString3);
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    terminateQueue();
  }

  public URLName getURLName()
  {
    try
    {
      if ((this.url != null) && ((this.url.getPassword() != null) || (this.url.getFile() != null)));
      for (URLName localURLName = new URLName(this.url.getProtocol(), this.url.getHost(), this.url.getPort(), null, this.url.getUsername(), null); ; localURLName = this.url)
        return localURLName;
    }
    finally
    {
    }
  }

  public boolean isConnected()
  {
    try
    {
      boolean bool = this.connected;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void notifyConnectionListeners(int paramInt)
  {
    try
    {
      if (this.connectionListeners != null)
        queueEvent(new ConnectionEvent(this, paramInt), this.connectionListeners);
      if (paramInt == 3)
        terminateQueue();
      return;
    }
    finally
    {
    }
  }

  protected boolean protocolConnect(String paramString1, int paramInt, String paramString2, String paramString3)
    throws MessagingException
  {
    return false;
  }

  protected void queueEvent(MailEvent paramMailEvent, Vector paramVector)
  {
    synchronized (this.qLock)
    {
      if (this.q == null)
        this.q = new EventQueue();
      Vector localVector = (Vector)paramVector.clone();
      this.q.enqueue(paramMailEvent, localVector);
      return;
    }
  }

  public void removeConnectionListener(ConnectionListener paramConnectionListener)
  {
    try
    {
      if (this.connectionListeners != null)
        this.connectionListeners.removeElement(paramConnectionListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void setConnected(boolean paramBoolean)
  {
    try
    {
      this.connected = paramBoolean;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void setURLName(URLName paramURLName)
  {
    try
    {
      this.url = paramURLName;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public String toString()
  {
    URLName localURLName = getURLName();
    if (localURLName != null)
      return localURLName.toString();
    return super.toString();
  }

  static class TerminatorEvent extends MailEvent
  {
    private static final long serialVersionUID = 5542172141759168416L;

    TerminatorEvent()
    {
      super();
    }

    public void dispatch(Object paramObject)
    {
      Thread.currentThread().interrupt();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Service
 * JD-Core Version:    0.6.2
 */