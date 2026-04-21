package com.sun.mail.pop3;

import java.io.PrintStream;
import java.lang.reflect.Constructor;
import javax.mail.Folder;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.URLName;

public class POP3Store extends Store
{
  private int defaultPort = 110;
  boolean disableTop = false;
  boolean forgetTopHeaders = false;
  private String host = null;
  private boolean isSSL = false;
  Constructor messageConstructor = null;
  private String name = "pop3";
  private String passwd = null;
  private Protocol port = null;
  private int portNum = -1;
  private POP3Folder portOwner = null;
  boolean rsetBeforeQuit = false;
  private String user = null;

  public POP3Store(Session paramSession, URLName paramURLName)
  {
    this(paramSession, paramURLName, "pop3", 110, false);
  }

  public POP3Store(Session paramSession, URLName paramURLName, String paramString, int paramInt, boolean paramBoolean)
  {
    super(paramSession, paramURLName);
    if (paramURLName != null)
      paramString = paramURLName.getProtocol();
    this.name = paramString;
    this.defaultPort = paramInt;
    this.isSSL = paramBoolean;
    String str1 = paramSession.getProperty("mail." + paramString + ".rsetbeforequit");
    if ((str1 != null) && (str1.equalsIgnoreCase("true")))
      this.rsetBeforeQuit = true;
    String str2 = paramSession.getProperty("mail." + paramString + ".disabletop");
    if ((str2 != null) && (str2.equalsIgnoreCase("true")))
      this.disableTop = true;
    String str3 = paramSession.getProperty("mail." + paramString + ".forgettopheaders");
    if ((str3 != null) && (str3.equalsIgnoreCase("true")))
      this.forgetTopHeaders = true;
    String str4 = paramSession.getProperty("mail." + paramString + ".message.class");
    if (str4 != null)
    {
      if (paramSession.getDebug())
        paramSession.getDebugOut().println("DEBUG: POP3 message class: " + str4);
      try
      {
        ClassLoader localClassLoader = getClass().getClassLoader();
        try
        {
          Class localClass2 = localClassLoader.loadClass(str4);
          localObject = localClass2;
          Class[] arrayOfClass = new Class[2];
          arrayOfClass[0] = Folder.class;
          arrayOfClass[1] = Integer.TYPE;
          this.messageConstructor = ((Class)localObject).getConstructor(arrayOfClass);
          return;
        }
        catch (ClassNotFoundException localClassNotFoundException)
        {
          while (true)
          {
            Class localClass1 = Class.forName(str4);
            Object localObject = localClass1;
          }
        }
      }
      catch (Exception localException)
      {
        if (paramSession.getDebug())
          paramSession.getDebugOut().println("DEBUG: failed to load POP3 message class: " + localException);
      }
    }
  }

  private void checkConnected()
    throws MessagingException
  {
    if (!super.isConnected())
      throw new MessagingException("Not connected");
  }

  // ERROR //
  public void close()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   6: ifnull +11 -> 17
    //   9: aload_0
    //   10: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   13: invokevirtual 175	com/sun/mail/pop3/Protocol:quit	()Z
    //   16: pop
    //   17: aload_0
    //   18: aconst_null
    //   19: putfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   22: aload_0
    //   23: invokespecial 177	javax/mail/Store:close	()V
    //   26: aload_0
    //   27: monitorexit
    //   28: return
    //   29: astore_3
    //   30: aload_0
    //   31: aconst_null
    //   32: putfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   35: aload_0
    //   36: invokespecial 177	javax/mail/Store:close	()V
    //   39: goto -13 -> 26
    //   42: astore_2
    //   43: aload_0
    //   44: monitorexit
    //   45: aload_2
    //   46: athrow
    //   47: astore_1
    //   48: aload_0
    //   49: aconst_null
    //   50: putfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   53: aload_0
    //   54: invokespecial 177	javax/mail/Store:close	()V
    //   57: aload_1
    //   58: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   2	17	29	java/io/IOException
    //   17	26	42	finally
    //   30	39	42	finally
    //   48	59	42	finally
    //   2	17	47	finally
  }

  void closePort(POP3Folder paramPOP3Folder)
  {
    try
    {
      if (this.portOwner == paramPOP3Folder)
      {
        this.port = null;
        this.portOwner = null;
      }
      return;
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
    if (this.port != null)
      close();
  }

  public Folder getDefaultFolder()
    throws MessagingException
  {
    checkConnected();
    return new DefaultFolder(this);
  }

  public Folder getFolder(String paramString)
    throws MessagingException
  {
    checkConnected();
    return new POP3Folder(this, paramString);
  }

  public Folder getFolder(URLName paramURLName)
    throws MessagingException
  {
    checkConnected();
    return new POP3Folder(this, paramURLName.getFile());
  }

  // ERROR //
  Protocol getPort(POP3Folder paramPOP3Folder)
    throws java.io.IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   6: ifnull +24 -> 30
    //   9: aload_0
    //   10: getfield 46	com/sun/mail/pop3/POP3Store:portOwner	Lcom/sun/mail/pop3/POP3Folder;
    //   13: ifnonnull +17 -> 30
    //   16: aload_0
    //   17: aload_1
    //   18: putfield 46	com/sun/mail/pop3/POP3Store:portOwner	Lcom/sun/mail/pop3/POP3Folder;
    //   21: aload_0
    //   22: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   25: astore_3
    //   26: aload_0
    //   27: monitorexit
    //   28: aload_3
    //   29: areturn
    //   30: new 172	com/sun/mail/pop3/Protocol
    //   33: dup
    //   34: aload_0
    //   35: getfield 48	com/sun/mail/pop3/POP3Store:host	Ljava/lang/String;
    //   38: aload_0
    //   39: getfield 50	com/sun/mail/pop3/POP3Store:portNum	I
    //   42: aload_0
    //   43: getfield 211	com/sun/mail/pop3/POP3Store:session	Ljavax/mail/Session;
    //   46: invokevirtual 108	javax/mail/Session:getDebug	()Z
    //   49: aload_0
    //   50: getfield 211	com/sun/mail/pop3/POP3Store:session	Ljavax/mail/Session;
    //   53: invokevirtual 112	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   56: aload_0
    //   57: getfield 211	com/sun/mail/pop3/POP3Store:session	Ljavax/mail/Session;
    //   60: invokevirtual 215	javax/mail/Session:getProperties	()Ljava/util/Properties;
    //   63: new 70	java/lang/StringBuilder
    //   66: dup
    //   67: ldc 72
    //   69: invokespecial 75	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   72: aload_0
    //   73: getfield 38	com/sun/mail/pop3/POP3Store:name	Ljava/lang/String;
    //   76: invokevirtual 79	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   79: invokevirtual 84	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   82: aload_0
    //   83: getfield 42	com/sun/mail/pop3/POP3Store:isSSL	Z
    //   86: invokespecial 218	com/sun/mail/pop3/Protocol:<init>	(Ljava/lang/String;IZLjava/io/PrintStream;Ljava/util/Properties;Ljava/lang/String;Z)V
    //   89: astore_3
    //   90: aload_3
    //   91: aload_0
    //   92: getfield 52	com/sun/mail/pop3/POP3Store:user	Ljava/lang/String;
    //   95: aload_0
    //   96: getfield 54	com/sun/mail/pop3/POP3Store:passwd	Ljava/lang/String;
    //   99: invokevirtual 222	com/sun/mail/pop3/Protocol:login	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   102: astore 4
    //   104: aload 4
    //   106: ifnull +23 -> 129
    //   109: aload_3
    //   110: invokevirtual 175	com/sun/mail/pop3/Protocol:quit	()Z
    //   113: pop
    //   114: new 224	java/io/EOFException
    //   117: dup
    //   118: aload 4
    //   120: invokespecial 225	java/io/EOFException:<init>	(Ljava/lang/String;)V
    //   123: athrow
    //   124: astore_2
    //   125: aload_0
    //   126: monitorexit
    //   127: aload_2
    //   128: athrow
    //   129: aload_0
    //   130: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   133: ifnonnull +17 -> 150
    //   136: aload_1
    //   137: ifnull +13 -> 150
    //   140: aload_0
    //   141: aload_3
    //   142: putfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   145: aload_0
    //   146: aload_1
    //   147: putfield 46	com/sun/mail/pop3/POP3Store:portOwner	Lcom/sun/mail/pop3/POP3Folder;
    //   150: aload_0
    //   151: getfield 46	com/sun/mail/pop3/POP3Store:portOwner	Lcom/sun/mail/pop3/POP3Folder;
    //   154: ifnonnull -128 -> 26
    //   157: aload_0
    //   158: aload_1
    //   159: putfield 46	com/sun/mail/pop3/POP3Store:portOwner	Lcom/sun/mail/pop3/POP3Folder;
    //   162: goto -136 -> 26
    //   165: astore 6
    //   167: goto -53 -> 114
    //   170: astore 5
    //   172: goto -58 -> 114
    //
    // Exception table:
    //   from	to	target	type
    //   2	26	124	finally
    //   30	104	124	finally
    //   114	124	124	finally
    //   129	136	124	finally
    //   140	150	124	finally
    //   150	162	124	finally
    //   109	114	165	java/io/IOException
    //   109	114	170	finally
  }

  // ERROR //
  public boolean isConnected()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 164	javax/mail/Store:isConnected	()Z
    //   6: istore_2
    //   7: iconst_0
    //   8: istore_3
    //   9: iload_2
    //   10: ifne +7 -> 17
    //   13: aload_0
    //   14: monitorexit
    //   15: iload_3
    //   16: ireturn
    //   17: aload_0
    //   18: monitorenter
    //   19: aload_0
    //   20: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   23: ifnonnull +19 -> 42
    //   26: aload_0
    //   27: aload_0
    //   28: aconst_null
    //   29: invokevirtual 227	com/sun/mail/pop3/POP3Store:getPort	(Lcom/sun/mail/pop3/POP3Folder;)Lcom/sun/mail/pop3/Protocol;
    //   32: putfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   35: aload_0
    //   36: monitorexit
    //   37: iconst_1
    //   38: istore_3
    //   39: goto -26 -> 13
    //   42: aload_0
    //   43: getfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   46: invokevirtual 230	com/sun/mail/pop3/Protocol:noop	()Z
    //   49: pop
    //   50: goto -15 -> 35
    //   53: astore 5
    //   55: aload_0
    //   56: invokespecial 177	javax/mail/Store:close	()V
    //   59: aload_0
    //   60: monitorexit
    //   61: iconst_0
    //   62: istore_3
    //   63: goto -50 -> 13
    //   66: astore 4
    //   68: aload_0
    //   69: monitorexit
    //   70: aload 4
    //   72: athrow
    //   73: astore_1
    //   74: aload_0
    //   75: monitorexit
    //   76: aload_1
    //   77: athrow
    //   78: astore 7
    //   80: goto -21 -> 59
    //   83: astore 6
    //   85: goto -26 -> 59
    //
    // Exception table:
    //   from	to	target	type
    //   19	35	53	java/io/IOException
    //   42	50	53	java/io/IOException
    //   19	35	66	finally
    //   35	37	66	finally
    //   42	50	66	finally
    //   59	61	66	finally
    //   68	70	66	finally
    //   2	7	73	finally
    //   17	19	73	finally
    //   70	73	73	finally
    //   55	59	78	javax/mail/MessagingException
    //   55	59	83	finally
  }

  // ERROR //
  protected boolean protocolConnect(String paramString1, int paramInt, String paramString2, String paramString3)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_1
    //   3: ifnull +12 -> 15
    //   6: aload 4
    //   8: ifnull +7 -> 15
    //   11: aload_3
    //   12: ifnonnull +11 -> 23
    //   15: iconst_0
    //   16: istore 5
    //   18: aload_0
    //   19: monitorexit
    //   20: iload 5
    //   22: ireturn
    //   23: iload_2
    //   24: iconst_m1
    //   25: if_icmpne +47 -> 72
    //   28: aload_0
    //   29: getfield 211	com/sun/mail/pop3/POP3Store:session	Ljavax/mail/Session;
    //   32: new 70	java/lang/StringBuilder
    //   35: dup
    //   36: ldc 72
    //   38: invokespecial 75	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   41: aload_0
    //   42: getfield 38	com/sun/mail/pop3/POP3Store:name	Ljava/lang/String;
    //   45: invokevirtual 79	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   48: ldc 234
    //   50: invokevirtual 79	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   53: invokevirtual 84	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   56: invokevirtual 90	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   59: astore 9
    //   61: aload 9
    //   63: ifnull +9 -> 72
    //   66: aload 9
    //   68: invokestatic 238	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   71: istore_2
    //   72: iload_2
    //   73: iconst_m1
    //   74: if_icmpne +8 -> 82
    //   77: aload_0
    //   78: getfield 40	com/sun/mail/pop3/POP3Store:defaultPort	I
    //   81: istore_2
    //   82: aload_0
    //   83: aload_1
    //   84: putfield 48	com/sun/mail/pop3/POP3Store:host	Ljava/lang/String;
    //   87: aload_0
    //   88: iload_2
    //   89: putfield 50	com/sun/mail/pop3/POP3Store:portNum	I
    //   92: aload_0
    //   93: aload_3
    //   94: putfield 52	com/sun/mail/pop3/POP3Store:user	Ljava/lang/String;
    //   97: aload_0
    //   98: aload 4
    //   100: putfield 54	com/sun/mail/pop3/POP3Store:passwd	Ljava/lang/String;
    //   103: aload_0
    //   104: aload_0
    //   105: aconst_null
    //   106: invokevirtual 227	com/sun/mail/pop3/POP3Store:getPort	(Lcom/sun/mail/pop3/POP3Folder;)Lcom/sun/mail/pop3/Protocol;
    //   109: putfield 44	com/sun/mail/pop3/POP3Store:port	Lcom/sun/mail/pop3/Protocol;
    //   112: iconst_1
    //   113: istore 5
    //   115: goto -97 -> 18
    //   118: astore 8
    //   120: new 240	javax/mail/AuthenticationFailedException
    //   123: dup
    //   124: aload 8
    //   126: invokevirtual 243	java/io/EOFException:getMessage	()Ljava/lang/String;
    //   129: invokespecial 244	javax/mail/AuthenticationFailedException:<init>	(Ljava/lang/String;)V
    //   132: athrow
    //   133: astore 6
    //   135: aload_0
    //   136: monitorexit
    //   137: aload 6
    //   139: athrow
    //   140: astore 7
    //   142: new 161	javax/mail/MessagingException
    //   145: dup
    //   146: ldc 246
    //   148: aload 7
    //   150: invokespecial 249	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   153: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   103	112	118	java/io/EOFException
    //   28	61	133	finally
    //   66	72	133	finally
    //   77	82	133	finally
    //   82	103	133	finally
    //   103	112	133	finally
    //   120	133	133	finally
    //   142	154	133	finally
    //   103	112	140	java/io/IOException
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.POP3Store
 * JD-Core Version:    0.6.2
 */