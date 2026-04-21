package javax.mail;

import com.sun.mail.util.LineInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.net.InetAddress;
import java.net.URL;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.Vector;

public final class Session
{
  private static Session defaultSession = null;
  private final Properties addressMap = new Properties();
  private final Hashtable authTable = new Hashtable();
  private final Authenticator authenticator;
  private boolean debug = false;
  private PrintStream out;
  private final Properties props;
  private final Vector providers = new Vector();
  private final Hashtable providersByClassName = new Hashtable();
  private final Hashtable providersByProtocol = new Hashtable();

  private Session(Properties paramProperties, Authenticator paramAuthenticator)
  {
    this.props = paramProperties;
    this.authenticator = paramAuthenticator;
    if (Boolean.valueOf(paramProperties.getProperty("mail.debug")).booleanValue())
      this.debug = true;
    if (this.debug)
      pr("DEBUG: JavaMail version 1.4.1");
    if (paramAuthenticator != null);
    for (Class localClass = paramAuthenticator.getClass(); ; localClass = getClass())
    {
      loadProviders(localClass);
      loadAddressMap(localClass);
      return;
    }
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

  public static Session getDefaultInstance(Properties paramProperties)
  {
    return getDefaultInstance(paramProperties, null);
  }

  public static Session getDefaultInstance(Properties paramProperties, Authenticator paramAuthenticator)
  {
    try
    {
      if (defaultSession == null)
        defaultSession = new Session(paramProperties, paramAuthenticator);
      while ((defaultSession.authenticator == paramAuthenticator) || ((defaultSession.authenticator != null) && (paramAuthenticator != null) && (defaultSession.authenticator.getClass().getClassLoader() == paramAuthenticator.getClass().getClassLoader())))
      {
        Session localSession = defaultSession;
        return localSession;
      }
      throw new SecurityException("Access to default session denied");
    }
    finally
    {
    }
  }

  public static Session getInstance(Properties paramProperties)
  {
    return new Session(paramProperties, null);
  }

  public static Session getInstance(Properties paramProperties, Authenticator paramAuthenticator)
  {
    return new Session(paramProperties, paramAuthenticator);
  }

  private static InputStream getResourceAsStream(Class paramClass, final String paramString)
    throws IOException
  {
    try
    {
      InputStream localInputStream = (InputStream)AccessController.doPrivileged(new PrivilegedExceptionAction()
      {
        public Object run()
          throws IOException
        {
          return Session.this.getResourceAsStream(paramString);
        }
      });
      return localInputStream;
    }
    catch (PrivilegedActionException localPrivilegedActionException)
    {
      throw ((IOException)localPrivilegedActionException.getException());
    }
  }

  private static URL[] getResources(ClassLoader paramClassLoader, final String paramString)
  {
    return (URL[])AccessController.doPrivileged(new PrivilegedAction()
    {
      public Object run()
      {
        URL[] arrayOfURL = (URL[])null;
        try
        {
          Vector localVector = new Vector();
          Enumeration localEnumeration = Session.this.getResources(paramString);
          while (true)
          {
            if ((localEnumeration == null) || (!localEnumeration.hasMoreElements()))
            {
              if (localVector.size() <= 0)
                break;
              arrayOfURL = new URL[localVector.size()];
              localVector.copyInto(arrayOfURL);
              return arrayOfURL;
            }
            URL localURL = (URL)localEnumeration.nextElement();
            if (localURL != null)
              localVector.addElement(localURL);
          }
        }
        catch (IOException localIOException)
        {
          return arrayOfURL;
        }
        catch (SecurityException localSecurityException)
        {
        }
        return arrayOfURL;
      }
    });
  }

  // ERROR //
  private Object getService(Provider paramProvider, URLName paramURLName)
    throws NoSuchProviderException
  {
    // Byte code:
    //   0: aload_1
    //   1: ifnonnull +13 -> 14
    //   4: new 160	javax/mail/NoSuchProviderException
    //   7: dup
    //   8: ldc 166
    //   10: invokespecial 167	javax/mail/NoSuchProviderException:<init>	(Ljava/lang/String;)V
    //   13: athrow
    //   14: aload_2
    //   15: ifnonnull +24 -> 39
    //   18: aload_1
    //   19: invokevirtual 173	javax/mail/Provider:getProtocol	()Ljava/lang/String;
    //   22: astore 15
    //   24: new 175	javax/mail/URLName
    //   27: dup
    //   28: aload 15
    //   30: aconst_null
    //   31: iconst_m1
    //   32: aconst_null
    //   33: aconst_null
    //   34: aconst_null
    //   35: invokespecial 178	javax/mail/URLName:<init>	(Ljava/lang/String;Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
    //   38: astore_2
    //   39: aload_0
    //   40: getfield 54	javax/mail/Session:authenticator	Ljavax/mail/Authenticator;
    //   43: ifnull +104 -> 147
    //   46: aload_0
    //   47: getfield 54	javax/mail/Session:authenticator	Ljavax/mail/Authenticator;
    //   50: invokevirtual 80	java/lang/Object:getClass	()Ljava/lang/Class;
    //   53: invokevirtual 122	java/lang/Class:getClassLoader	()Ljava/lang/ClassLoader;
    //   56: astore_3
    //   57: invokestatic 180	javax/mail/Session:getContextClassLoader	()Ljava/lang/ClassLoader;
    //   60: astore 11
    //   62: aconst_null
    //   63: astore 7
    //   65: aload 11
    //   67: ifnull +18 -> 85
    //   70: aload 11
    //   72: aload_1
    //   73: invokevirtual 183	javax/mail/Provider:getClassName	()Ljava/lang/String;
    //   76: invokevirtual 187	java/lang/ClassLoader:loadClass	(Ljava/lang/String;)Ljava/lang/Class;
    //   79: astore 14
    //   81: aload 14
    //   83: astore 7
    //   85: aload 7
    //   87: ifnonnull +17 -> 104
    //   90: aload_3
    //   91: aload_1
    //   92: invokevirtual 183	javax/mail/Provider:getClassName	()Ljava/lang/String;
    //   95: invokevirtual 187	java/lang/ClassLoader:loadClass	(Ljava/lang/String;)Ljava/lang/Class;
    //   98: astore 12
    //   100: aload 12
    //   102: astore 7
    //   104: iconst_2
    //   105: anewarray 119	java/lang/Class
    //   108: dup
    //   109: iconst_0
    //   110: ldc 2
    //   112: aastore
    //   113: dup
    //   114: iconst_1
    //   115: ldc 175
    //   117: aastore
    //   118: astore 8
    //   120: aload 7
    //   122: aload 8
    //   124: invokevirtual 191	java/lang/Class:getConstructor	([Ljava/lang/Class;)Ljava/lang/reflect/Constructor;
    //   127: iconst_2
    //   128: anewarray 4	java/lang/Object
    //   131: dup
    //   132: iconst_0
    //   133: aload_0
    //   134: aastore
    //   135: dup
    //   136: iconst_1
    //   137: aload_2
    //   138: aastore
    //   139: invokevirtual 197	java/lang/reflect/Constructor:newInstance	([Ljava/lang/Object;)Ljava/lang/Object;
    //   142: astore 10
    //   144: aload 10
    //   146: areturn
    //   147: aload_0
    //   148: invokevirtual 80	java/lang/Object:getClass	()Ljava/lang/Class;
    //   151: invokevirtual 122	java/lang/Class:getClassLoader	()Ljava/lang/ClassLoader;
    //   154: astore_3
    //   155: goto -98 -> 57
    //   158: astore 4
    //   160: aload_1
    //   161: invokevirtual 183	javax/mail/Provider:getClassName	()Ljava/lang/String;
    //   164: invokestatic 200	java/lang/Class:forName	(Ljava/lang/String;)Ljava/lang/Class;
    //   167: astore 6
    //   169: aload 6
    //   171: astore 7
    //   173: goto -69 -> 104
    //   176: astore 5
    //   178: aload_0
    //   179: getfield 36	javax/mail/Session:debug	Z
    //   182: ifeq +12 -> 194
    //   185: aload 5
    //   187: aload_0
    //   188: invokevirtual 204	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   191: invokevirtual 208	java/lang/Exception:printStackTrace	(Ljava/io/PrintStream;)V
    //   194: new 160	javax/mail/NoSuchProviderException
    //   197: dup
    //   198: aload_1
    //   199: invokevirtual 173	javax/mail/Provider:getProtocol	()Ljava/lang/String;
    //   202: invokespecial 167	javax/mail/NoSuchProviderException:<init>	(Ljava/lang/String;)V
    //   205: athrow
    //   206: astore 9
    //   208: aload_0
    //   209: getfield 36	javax/mail/Session:debug	Z
    //   212: ifeq +12 -> 224
    //   215: aload 9
    //   217: aload_0
    //   218: invokevirtual 204	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   221: invokevirtual 208	java/lang/Exception:printStackTrace	(Ljava/io/PrintStream;)V
    //   224: new 160	javax/mail/NoSuchProviderException
    //   227: dup
    //   228: aload_1
    //   229: invokevirtual 173	javax/mail/Provider:getProtocol	()Ljava/lang/String;
    //   232: invokespecial 167	javax/mail/NoSuchProviderException:<init>	(Ljava/lang/String;)V
    //   235: athrow
    //   236: astore 13
    //   238: aconst_null
    //   239: astore 7
    //   241: goto -156 -> 85
    //
    // Exception table:
    //   from	to	target	type
    //   57	62	158	java/lang/Exception
    //   70	81	158	java/lang/Exception
    //   90	100	158	java/lang/Exception
    //   160	169	176	java/lang/Exception
    //   104	144	206	java/lang/Exception
    //   70	81	236	java/lang/ClassNotFoundException
  }

  private Store getStore(Provider paramProvider, URLName paramURLName)
    throws NoSuchProviderException
  {
    if ((paramProvider == null) || (paramProvider.getType() != Provider.Type.STORE))
      throw new NoSuchProviderException("invalid provider");
    try
    {
      Store localStore = (Store)getService(paramProvider, paramURLName);
      return localStore;
    }
    catch (ClassCastException localClassCastException)
    {
    }
    throw new NoSuchProviderException("incorrect class");
  }

  private static URL[] getSystemResources(String paramString)
  {
    return (URL[])AccessController.doPrivileged(new PrivilegedAction()
    {
      public Object run()
      {
        URL[] arrayOfURL = (URL[])null;
        try
        {
          Vector localVector = new Vector();
          Enumeration localEnumeration = ClassLoader.getSystemResources(Session.this);
          while (true)
          {
            if ((localEnumeration == null) || (!localEnumeration.hasMoreElements()))
            {
              if (localVector.size() <= 0)
                break;
              arrayOfURL = new URL[localVector.size()];
              localVector.copyInto(arrayOfURL);
              return arrayOfURL;
            }
            URL localURL = (URL)localEnumeration.nextElement();
            if (localURL != null)
              localVector.addElement(localURL);
          }
        }
        catch (IOException localIOException)
        {
          return arrayOfURL;
        }
        catch (SecurityException localSecurityException)
        {
        }
        return arrayOfURL;
      }
    });
  }

  private Transport getTransport(Provider paramProvider, URLName paramURLName)
    throws NoSuchProviderException
  {
    if ((paramProvider == null) || (paramProvider.getType() != Provider.Type.TRANSPORT))
      throw new NoSuchProviderException("invalid provider");
    try
    {
      Transport localTransport = (Transport)getService(paramProvider, paramURLName);
      return localTransport;
    }
    catch (ClassCastException localClassCastException)
    {
    }
    throw new NoSuchProviderException("incorrect class");
  }

  private void loadAddressMap(Class paramClass)
  {
    StreamLoader local2 = new StreamLoader()
    {
      public void load(InputStream paramAnonymousInputStream)
        throws IOException
      {
        Session.this.addressMap.load(paramAnonymousInputStream);
      }
    };
    loadResource("/META-INF/javamail.default.address.map", paramClass, local2);
    loadAllResources("META-INF/javamail.address.map", paramClass, local2);
    try
    {
      loadFile(System.getProperty("java.home") + File.separator + "lib" + File.separator + "javamail.address.map", local2);
      if (this.addressMap.isEmpty())
      {
        if (this.debug)
          pr("DEBUG: failed to load address map, using defaults");
        this.addressMap.put("rfc822", "smtp");
      }
      return;
    }
    catch (SecurityException localSecurityException)
    {
      while (true)
        if (this.debug)
          pr("DEBUG: can't get java.home: " + localSecurityException);
    }
  }

  // ERROR //
  private void loadAllResources(String paramString, Class paramClass, StreamLoader paramStreamLoader)
  {
    // Byte code:
    //   0: iconst_0
    //   1: istore 4
    //   3: invokestatic 180	javax/mail/Session:getContextClassLoader	()Ljava/lang/ClassLoader;
    //   6: astore 6
    //   8: iconst_0
    //   9: istore 4
    //   11: aload 6
    //   13: ifnonnull +9 -> 22
    //   16: aload_2
    //   17: invokevirtual 122	java/lang/Class:getClassLoader	()Ljava/lang/ClassLoader;
    //   20: astore 6
    //   22: iconst_0
    //   23: istore 4
    //   25: aload 6
    //   27: ifnull +69 -> 96
    //   30: aload 6
    //   32: aload_1
    //   33: invokestatic 312	javax/mail/Session:getResources	(Ljava/lang/ClassLoader;Ljava/lang/String;)[Ljava/net/URL;
    //   36: astore 7
    //   38: goto +363 -> 401
    //   41: aload 7
    //   43: arraylength
    //   44: istore 9
    //   46: iload 8
    //   48: iload 9
    //   50: if_icmplt +55 -> 105
    //   53: iload 4
    //   55: ifne +40 -> 95
    //   58: aload_0
    //   59: getfield 36	javax/mail/Session:debug	Z
    //   62: ifeq +10 -> 72
    //   65: aload_0
    //   66: ldc_w 314
    //   69: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   72: aload_0
    //   73: new 260	java/lang/StringBuilder
    //   76: dup
    //   77: ldc_w 316
    //   80: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   83: aload_1
    //   84: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   87: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   90: aload_2
    //   91: aload_3
    //   92: invokespecial 253	javax/mail/Session:loadResource	(Ljava/lang/String;Ljava/lang/Class;Ljavax/mail/StreamLoader;)V
    //   95: return
    //   96: aload_1
    //   97: invokestatic 318	javax/mail/Session:getSystemResources	(Ljava/lang/String;)[Ljava/net/URL;
    //   100: astore 7
    //   102: goto +299 -> 401
    //   105: aload 7
    //   107: iload 8
    //   109: aaload
    //   110: astore 10
    //   112: aconst_null
    //   113: astore 11
    //   115: aload_0
    //   116: getfield 36	javax/mail/Session:debug	Z
    //   119: ifeq +25 -> 144
    //   122: aload_0
    //   123: new 260	java/lang/StringBuilder
    //   126: dup
    //   127: ldc_w 320
    //   130: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   133: aload 10
    //   135: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   138: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   141: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   144: aload 10
    //   146: invokestatic 324	javax/mail/Session:openStream	(Ljava/net/URL;)Ljava/io/InputStream;
    //   149: astore 11
    //   151: aload 11
    //   153: ifnull +59 -> 212
    //   156: aload_3
    //   157: aload 11
    //   159: invokeinterface 329 2 0
    //   164: iconst_1
    //   165: istore 4
    //   167: aload_0
    //   168: getfield 36	javax/mail/Session:debug	Z
    //   171: ifeq +25 -> 196
    //   174: aload_0
    //   175: new 260	java/lang/StringBuilder
    //   178: dup
    //   179: ldc_w 331
    //   182: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   185: aload 10
    //   187: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   190: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   193: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   196: aload 11
    //   198: ifnull +8 -> 206
    //   201: aload 11
    //   203: invokevirtual 334	java/io/InputStream:close	()V
    //   206: iinc 8 1
    //   209: goto -168 -> 41
    //   212: aload_0
    //   213: getfield 36	javax/mail/Session:debug	Z
    //   216: ifeq -20 -> 196
    //   219: aload_0
    //   220: new 260	java/lang/StringBuilder
    //   223: dup
    //   224: ldc_w 336
    //   227: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   230: aload 10
    //   232: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   235: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   238: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   241: goto -45 -> 196
    //   244: astore 16
    //   246: aload_0
    //   247: getfield 36	javax/mail/Session:debug	Z
    //   250: ifeq +25 -> 275
    //   253: aload_0
    //   254: new 260	java/lang/StringBuilder
    //   257: dup
    //   258: ldc_w 338
    //   261: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   264: aload 16
    //   266: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   269: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   272: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   275: aload 11
    //   277: ifnull -71 -> 206
    //   280: aload 11
    //   282: invokevirtual 334	java/io/InputStream:close	()V
    //   285: goto -79 -> 206
    //   288: astore 17
    //   290: goto -84 -> 206
    //   293: astore 14
    //   295: aload_0
    //   296: getfield 36	javax/mail/Session:debug	Z
    //   299: ifeq +25 -> 324
    //   302: aload_0
    //   303: new 260	java/lang/StringBuilder
    //   306: dup
    //   307: ldc_w 338
    //   310: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   313: aload 14
    //   315: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   318: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   321: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   324: aload 11
    //   326: ifnull -120 -> 206
    //   329: aload 11
    //   331: invokevirtual 334	java/io/InputStream:close	()V
    //   334: goto -128 -> 206
    //   337: astore 15
    //   339: goto -133 -> 206
    //   342: astore 12
    //   344: aload 11
    //   346: ifnull +8 -> 354
    //   349: aload 11
    //   351: invokevirtual 334	java/io/InputStream:close	()V
    //   354: aload 12
    //   356: athrow
    //   357: astore 5
    //   359: aload_0
    //   360: getfield 36	javax/mail/Session:debug	Z
    //   363: ifeq -310 -> 53
    //   366: aload_0
    //   367: new 260	java/lang/StringBuilder
    //   370: dup
    //   371: ldc_w 338
    //   374: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   377: aload 5
    //   379: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   382: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   385: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   388: goto -335 -> 53
    //   391: astore 13
    //   393: goto -39 -> 354
    //   396: astore 18
    //   398: goto -192 -> 206
    //   401: iconst_0
    //   402: istore 4
    //   404: aload 7
    //   406: ifnull -353 -> 53
    //   409: iconst_0
    //   410: istore 4
    //   412: iconst_0
    //   413: istore 8
    //   415: goto -374 -> 41
    //
    // Exception table:
    //   from	to	target	type
    //   144	151	244	java/io/IOException
    //   156	164	244	java/io/IOException
    //   167	196	244	java/io/IOException
    //   212	241	244	java/io/IOException
    //   280	285	288	java/io/IOException
    //   144	151	293	java/lang/SecurityException
    //   156	164	293	java/lang/SecurityException
    //   167	196	293	java/lang/SecurityException
    //   212	241	293	java/lang/SecurityException
    //   329	334	337	java/io/IOException
    //   144	151	342	finally
    //   156	164	342	finally
    //   167	196	342	finally
    //   212	241	342	finally
    //   246	275	342	finally
    //   295	324	342	finally
    //   3	8	357	java/lang/Exception
    //   16	22	357	java/lang/Exception
    //   30	38	357	java/lang/Exception
    //   41	46	357	java/lang/Exception
    //   96	102	357	java/lang/Exception
    //   105	112	357	java/lang/Exception
    //   115	144	357	java/lang/Exception
    //   201	206	357	java/lang/Exception
    //   280	285	357	java/lang/Exception
    //   329	334	357	java/lang/Exception
    //   349	354	357	java/lang/Exception
    //   354	357	357	java/lang/Exception
    //   349	354	391	java/io/IOException
    //   201	206	396	java/io/IOException
  }

  // ERROR //
  private void loadFile(String paramString, StreamLoader paramStreamLoader)
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_3
    //   2: new 340	java/io/BufferedInputStream
    //   5: dup
    //   6: new 342	java/io/FileInputStream
    //   9: dup
    //   10: aload_1
    //   11: invokespecial 343	java/io/FileInputStream:<init>	(Ljava/lang/String;)V
    //   14: invokespecial 345	java/io/BufferedInputStream:<init>	(Ljava/io/InputStream;)V
    //   17: astore 4
    //   19: aload_2
    //   20: aload 4
    //   22: invokeinterface 329 2 0
    //   27: aload_0
    //   28: getfield 36	javax/mail/Session:debug	Z
    //   31: ifeq +24 -> 55
    //   34: aload_0
    //   35: new 260	java/lang/StringBuilder
    //   38: dup
    //   39: ldc_w 347
    //   42: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   45: aload_1
    //   46: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   49: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   52: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   55: aload 4
    //   57: ifnull +182 -> 239
    //   60: aload 4
    //   62: invokevirtual 334	java/io/InputStream:close	()V
    //   65: return
    //   66: astore 5
    //   68: aload_0
    //   69: getfield 36	javax/mail/Session:debug	Z
    //   72: ifeq +46 -> 118
    //   75: aload_0
    //   76: new 260	java/lang/StringBuilder
    //   79: dup
    //   80: ldc_w 349
    //   83: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   86: aload_1
    //   87: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   90: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   93: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   96: aload_0
    //   97: new 260	java/lang/StringBuilder
    //   100: dup
    //   101: ldc_w 338
    //   104: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   107: aload 5
    //   109: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   112: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   115: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   118: aload_3
    //   119: ifnull -54 -> 65
    //   122: aload_3
    //   123: invokevirtual 334	java/io/InputStream:close	()V
    //   126: return
    //   127: astore 8
    //   129: return
    //   130: astore 9
    //   132: aload_0
    //   133: getfield 36	javax/mail/Session:debug	Z
    //   136: ifeq +46 -> 182
    //   139: aload_0
    //   140: new 260	java/lang/StringBuilder
    //   143: dup
    //   144: ldc_w 349
    //   147: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   150: aload_1
    //   151: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   154: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   157: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   160: aload_0
    //   161: new 260	java/lang/StringBuilder
    //   164: dup
    //   165: ldc_w 338
    //   168: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   171: aload 9
    //   173: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   176: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   179: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   182: aload_3
    //   183: ifnull -118 -> 65
    //   186: aload_3
    //   187: invokevirtual 334	java/io/InputStream:close	()V
    //   190: return
    //   191: astore 10
    //   193: return
    //   194: astore 6
    //   196: aload_3
    //   197: ifnull +7 -> 204
    //   200: aload_3
    //   201: invokevirtual 334	java/io/InputStream:close	()V
    //   204: aload 6
    //   206: athrow
    //   207: astore 11
    //   209: return
    //   210: astore 7
    //   212: goto -8 -> 204
    //   215: astore 6
    //   217: aload 4
    //   219: astore_3
    //   220: goto -24 -> 196
    //   223: astore 9
    //   225: aload 4
    //   227: astore_3
    //   228: goto -96 -> 132
    //   231: astore 5
    //   233: aload 4
    //   235: astore_3
    //   236: goto -168 -> 68
    //   239: return
    //
    // Exception table:
    //   from	to	target	type
    //   2	19	66	java/io/IOException
    //   122	126	127	java/io/IOException
    //   2	19	130	java/lang/SecurityException
    //   186	190	191	java/io/IOException
    //   2	19	194	finally
    //   68	118	194	finally
    //   132	182	194	finally
    //   60	65	207	java/io/IOException
    //   200	204	210	java/io/IOException
    //   19	55	215	finally
    //   19	55	223	java/lang/SecurityException
    //   19	55	231	java/io/IOException
  }

  private void loadProviders(Class paramClass)
  {
    StreamLoader local1 = new StreamLoader()
    {
      public void load(InputStream paramAnonymousInputStream)
        throws IOException
      {
        Session.this.loadProvidersFromStream(paramAnonymousInputStream);
      }
    };
    try
    {
      loadFile(System.getProperty("java.home") + File.separator + "lib" + File.separator + "javamail.providers", local1);
      loadAllResources("META-INF/javamail.providers", paramClass, local1);
      loadResource("/META-INF/javamail.default.providers", paramClass, local1);
      if (this.providers.size() == 0)
      {
        if (this.debug)
          pr("DEBUG: failed to load any providers, using defaults");
        addProvider(new Provider(Provider.Type.STORE, "imap", "com.sun.mail.imap.IMAPStore", "Sun Microsystems, Inc.", "1.4.1"));
        addProvider(new Provider(Provider.Type.STORE, "imaps", "com.sun.mail.imap.IMAPSSLStore", "Sun Microsystems, Inc.", "1.4.1"));
        addProvider(new Provider(Provider.Type.STORE, "pop3", "com.sun.mail.pop3.POP3Store", "Sun Microsystems, Inc.", "1.4.1"));
        addProvider(new Provider(Provider.Type.STORE, "pop3s", "com.sun.mail.pop3.POP3SSLStore", "Sun Microsystems, Inc.", "1.4.1"));
        addProvider(new Provider(Provider.Type.TRANSPORT, "smtp", "com.sun.mail.smtp.SMTPTransport", "Sun Microsystems, Inc.", "1.4.1"));
        addProvider(new Provider(Provider.Type.TRANSPORT, "smtps", "com.sun.mail.smtp.SMTPSSLTransport", "Sun Microsystems, Inc.", "1.4.1"));
      }
      if (this.debug)
      {
        pr("DEBUG: Tables of loaded providers");
        pr("DEBUG: Providers Listed By Class Name: " + this.providersByClassName.toString());
        pr("DEBUG: Providers Listed By Protocol: " + this.providersByProtocol.toString());
      }
      return;
    }
    catch (SecurityException localSecurityException)
    {
      while (true)
        if (this.debug)
          pr("DEBUG: can't get java.home: " + localSecurityException);
    }
  }

  private void loadProvidersFromStream(InputStream paramInputStream)
    throws IOException
  {
    LineInputStream localLineInputStream;
    if (paramInputStream != null)
      localLineInputStream = new LineInputStream(paramInputStream);
    while (true)
    {
      String str1 = localLineInputStream.readLine();
      if (str1 == null)
        return;
      if (!str1.startsWith("#"))
      {
        Provider.Type localType = null;
        String str2 = null;
        String str3 = null;
        String str4 = null;
        String str5 = null;
        StringTokenizer localStringTokenizer = new StringTokenizer(str1, ";");
        while (true)
        {
          if (!localStringTokenizer.hasMoreTokens())
          {
            if ((localType != null) && (str2 != null) && (str3 != null) && (str2.length() > 0) && (str3.length() > 0))
              break label311;
            if (!this.debug)
              break;
            pr("DEBUG: Bad provider entry: " + str1);
            break;
          }
          String str6 = localStringTokenizer.nextToken().trim();
          int i = str6.indexOf("=");
          if (str6.startsWith("protocol="))
          {
            str2 = str6.substring(i + 1);
          }
          else if (str6.startsWith("type="))
          {
            String str7 = str6.substring(i + 1);
            if (str7.equalsIgnoreCase("store"))
              localType = Provider.Type.STORE;
            else if (str7.equalsIgnoreCase("transport"))
              localType = Provider.Type.TRANSPORT;
          }
          else if (str6.startsWith("class="))
          {
            str3 = str6.substring(i + 1);
          }
          else if (str6.startsWith("vendor="))
          {
            str4 = str6.substring(i + 1);
          }
          else if (str6.startsWith("version="))
          {
            str5 = str6.substring(i + 1);
          }
        }
        label311: addProvider(new Provider(localType, str2, str3, str4, str5));
      }
    }
  }

  // ERROR //
  private void loadResource(String paramString, Class paramClass, StreamLoader paramStreamLoader)
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore 4
    //   3: aload_2
    //   4: aload_1
    //   5: invokestatic 466	javax/mail/Session:getResourceAsStream	(Ljava/lang/Class;Ljava/lang/String;)Ljava/io/InputStream;
    //   8: astore 4
    //   10: aload 4
    //   12: ifnull +50 -> 62
    //   15: aload_3
    //   16: aload 4
    //   18: invokeinterface 329 2 0
    //   23: aload_0
    //   24: getfield 36	javax/mail/Session:debug	Z
    //   27: ifeq +24 -> 51
    //   30: aload_0
    //   31: new 260	java/lang/StringBuilder
    //   34: dup
    //   35: ldc_w 331
    //   38: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   41: aload_1
    //   42: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   45: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   48: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   51: aload 4
    //   53: ifnull +8 -> 61
    //   56: aload 4
    //   58: invokevirtual 334	java/io/InputStream:close	()V
    //   61: return
    //   62: aload_0
    //   63: getfield 36	javax/mail/Session:debug	Z
    //   66: ifeq -15 -> 51
    //   69: aload_0
    //   70: new 260	java/lang/StringBuilder
    //   73: dup
    //   74: ldc_w 336
    //   77: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   80: aload_1
    //   81: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   84: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   87: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   90: goto -39 -> 51
    //   93: astore 9
    //   95: aload_0
    //   96: getfield 36	javax/mail/Session:debug	Z
    //   99: ifeq +25 -> 124
    //   102: aload_0
    //   103: new 260	java/lang/StringBuilder
    //   106: dup
    //   107: ldc_w 338
    //   110: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   113: aload 9
    //   115: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   118: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   121: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   124: aload 4
    //   126: ifnull -65 -> 61
    //   129: aload 4
    //   131: invokevirtual 334	java/io/InputStream:close	()V
    //   134: return
    //   135: astore 10
    //   137: return
    //   138: astore 7
    //   140: aload_0
    //   141: getfield 36	javax/mail/Session:debug	Z
    //   144: ifeq +25 -> 169
    //   147: aload_0
    //   148: new 260	java/lang/StringBuilder
    //   151: dup
    //   152: ldc_w 338
    //   155: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   158: aload 7
    //   160: invokevirtual 310	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   163: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   166: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   169: aload 4
    //   171: ifnull -110 -> 61
    //   174: aload 4
    //   176: invokevirtual 334	java/io/InputStream:close	()V
    //   179: return
    //   180: astore 8
    //   182: return
    //   183: astore 5
    //   185: aload 4
    //   187: ifnull +8 -> 195
    //   190: aload 4
    //   192: invokevirtual 334	java/io/InputStream:close	()V
    //   195: aload 5
    //   197: athrow
    //   198: astore 6
    //   200: goto -5 -> 195
    //   203: astore 11
    //   205: return
    //
    // Exception table:
    //   from	to	target	type
    //   3	10	93	java/io/IOException
    //   15	51	93	java/io/IOException
    //   62	90	93	java/io/IOException
    //   129	134	135	java/io/IOException
    //   3	10	138	java/lang/SecurityException
    //   15	51	138	java/lang/SecurityException
    //   62	90	138	java/lang/SecurityException
    //   174	179	180	java/io/IOException
    //   3	10	183	finally
    //   15	51	183	finally
    //   62	90	183	finally
    //   95	124	183	finally
    //   140	169	183	finally
    //   190	195	198	java/io/IOException
    //   56	61	203	java/io/IOException
  }

  private static InputStream openStream(URL paramURL)
    throws IOException
  {
    try
    {
      InputStream localInputStream = (InputStream)AccessController.doPrivileged(new PrivilegedExceptionAction()
      {
        public Object run()
          throws IOException
        {
          return Session.this.openStream();
        }
      });
      return localInputStream;
    }
    catch (PrivilegedActionException localPrivilegedActionException)
    {
      throw ((IOException)localPrivilegedActionException.getException());
    }
  }

  private void pr(String paramString)
  {
    getDebugOut().println(paramString);
  }

  public void addProvider(Provider paramProvider)
  {
    try
    {
      this.providers.addElement(paramProvider);
      this.providersByClassName.put(paramProvider.getClassName(), paramProvider);
      if (!this.providersByProtocol.containsKey(paramProvider.getProtocol()))
        this.providersByProtocol.put(paramProvider.getProtocol(), paramProvider);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public boolean getDebug()
  {
    try
    {
      boolean bool = this.debug;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public PrintStream getDebugOut()
  {
    try
    {
      if (this.out == null);
      for (PrintStream localPrintStream = System.out; ; localPrintStream = this.out)
        return localPrintStream;
    }
    finally
    {
    }
  }

  public Folder getFolder(URLName paramURLName)
    throws MessagingException
  {
    Store localStore = getStore(paramURLName);
    localStore.connect();
    return localStore.getFolder(paramURLName);
  }

  public PasswordAuthentication getPasswordAuthentication(URLName paramURLName)
  {
    return (PasswordAuthentication)this.authTable.get(paramURLName);
  }

  public Properties getProperties()
  {
    return this.props;
  }

  public String getProperty(String paramString)
  {
    return this.props.getProperty(paramString);
  }

  // ERROR //
  public Provider getProvider(String paramString)
    throws NoSuchProviderException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_1
    //   3: ifnull +10 -> 13
    //   6: aload_1
    //   7: invokevirtual 429	java/lang/String:length	()I
    //   10: ifgt +19 -> 29
    //   13: new 160	javax/mail/NoSuchProviderException
    //   16: dup
    //   17: ldc_w 515
    //   20: invokespecial 167	javax/mail/NoSuchProviderException:<init>	(Ljava/lang/String;)V
    //   23: athrow
    //   24: astore_2
    //   25: aload_0
    //   26: monitorexit
    //   27: aload_2
    //   28: athrow
    //   29: aload_0
    //   30: getfield 52	javax/mail/Session:props	Ljava/util/Properties;
    //   33: new 260	java/lang/StringBuilder
    //   36: dup
    //   37: ldc_w 517
    //   40: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   43: aload_1
    //   44: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   47: ldc_w 519
    //   50: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   53: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   56: invokevirtual 60	java/util/Properties:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   59: astore_3
    //   60: aconst_null
    //   61: astore 4
    //   63: aload_3
    //   64: ifnull +54 -> 118
    //   67: aload_0
    //   68: getfield 36	javax/mail/Session:debug	Z
    //   71: ifeq +34 -> 105
    //   74: aload_0
    //   75: new 260	java/lang/StringBuilder
    //   78: dup
    //   79: ldc_w 521
    //   82: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   85: aload_1
    //   86: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   89: ldc_w 523
    //   92: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   95: aload_3
    //   96: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   99: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   102: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   105: aload_0
    //   106: getfield 45	javax/mail/Session:providersByClassName	Ljava/util/Hashtable;
    //   109: aload_3
    //   110: invokevirtual 507	java/util/Hashtable:get	(Ljava/lang/Object;)Ljava/lang/Object;
    //   113: checkcast 169	javax/mail/Provider
    //   116: astore 4
    //   118: aload 4
    //   120: ifnull +12 -> 132
    //   123: aload 4
    //   125: astore 6
    //   127: aload_0
    //   128: monitorexit
    //   129: aload 6
    //   131: areturn
    //   132: aload_0
    //   133: getfield 43	javax/mail/Session:providersByProtocol	Ljava/util/Hashtable;
    //   136: aload_1
    //   137: invokevirtual 507	java/util/Hashtable:get	(Ljava/lang/Object;)Ljava/lang/Object;
    //   140: checkcast 169	javax/mail/Provider
    //   143: astore 5
    //   145: aload 5
    //   147: ifnonnull +28 -> 175
    //   150: new 160	javax/mail/NoSuchProviderException
    //   153: dup
    //   154: new 260	java/lang/StringBuilder
    //   157: dup
    //   158: ldc_w 525
    //   161: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   164: aload_1
    //   165: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   168: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   171: invokespecial 167	javax/mail/NoSuchProviderException:<init>	(Ljava/lang/String;)V
    //   174: athrow
    //   175: aload_0
    //   176: getfield 36	javax/mail/Session:debug	Z
    //   179: ifeq +28 -> 207
    //   182: aload_0
    //   183: new 260	java/lang/StringBuilder
    //   186: dup
    //   187: ldc_w 527
    //   190: invokespecial 271	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   193: aload 5
    //   195: invokevirtual 528	javax/mail/Provider:toString	()Ljava/lang/String;
    //   198: invokevirtual 281	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   201: invokevirtual 288	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   204: invokespecial 76	javax/mail/Session:pr	(Ljava/lang/String;)V
    //   207: aload 5
    //   209: astore 6
    //   211: goto -84 -> 127
    //
    // Exception table:
    //   from	to	target	type
    //   6	13	24	finally
    //   13	24	24	finally
    //   29	60	24	finally
    //   67	105	24	finally
    //   105	118	24	finally
    //   132	145	24	finally
    //   150	175	24	finally
    //   175	207	24	finally
  }

  public Provider[] getProviders()
  {
    try
    {
      Provider[] arrayOfProvider = new Provider[this.providers.size()];
      this.providers.copyInto(arrayOfProvider);
      return arrayOfProvider;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public Store getStore()
    throws NoSuchProviderException
  {
    return getStore(getProperty("mail.store.protocol"));
  }

  public Store getStore(String paramString)
    throws NoSuchProviderException
  {
    return getStore(new URLName(paramString, null, -1, null, null, null));
  }

  public Store getStore(Provider paramProvider)
    throws NoSuchProviderException
  {
    return getStore(paramProvider, null);
  }

  public Store getStore(URLName paramURLName)
    throws NoSuchProviderException
  {
    return getStore(getProvider(paramURLName.getProtocol()), paramURLName);
  }

  public Transport getTransport()
    throws NoSuchProviderException
  {
    return getTransport(getProperty("mail.transport.protocol"));
  }

  public Transport getTransport(String paramString)
    throws NoSuchProviderException
  {
    return getTransport(new URLName(paramString, null, -1, null, null, null));
  }

  public Transport getTransport(Address paramAddress)
    throws NoSuchProviderException
  {
    String str = (String)this.addressMap.get(paramAddress.getType());
    if (str == null)
      throw new NoSuchProviderException("No provider for Address type: " + paramAddress.getType());
    return getTransport(str);
  }

  public Transport getTransport(Provider paramProvider)
    throws NoSuchProviderException
  {
    return getTransport(paramProvider, null);
  }

  public Transport getTransport(URLName paramURLName)
    throws NoSuchProviderException
  {
    return getTransport(getProvider(paramURLName.getProtocol()), paramURLName);
  }

  public PasswordAuthentication requestPasswordAuthentication(InetAddress paramInetAddress, int paramInt, String paramString1, String paramString2, String paramString3)
  {
    if (this.authenticator != null)
      return this.authenticator.requestPasswordAuthentication(paramInetAddress, paramInt, paramString1, paramString2, paramString3);
    return null;
  }

  public void setDebug(boolean paramBoolean)
  {
    try
    {
      this.debug = paramBoolean;
      if (paramBoolean)
        pr("DEBUG: setDebug: JavaMail version 1.4.1");
      return;
    }
    finally
    {
    }
  }

  public void setDebugOut(PrintStream paramPrintStream)
  {
    try
    {
      this.out = paramPrintStream;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setPasswordAuthentication(URLName paramURLName, PasswordAuthentication paramPasswordAuthentication)
  {
    if (paramPasswordAuthentication == null)
    {
      this.authTable.remove(paramURLName);
      return;
    }
    this.authTable.put(paramURLName, paramPasswordAuthentication);
  }

  public void setProtocolForAddress(String paramString1, String paramString2)
  {
    if (paramString2 == null);
    try
    {
      this.addressMap.remove(paramString1);
      while (true)
      {
        return;
        this.addressMap.put(paramString1, paramString2);
      }
    }
    finally
    {
    }
  }

  public void setProvider(Provider paramProvider)
    throws NoSuchProviderException
  {
    if (paramProvider == null)
      try
      {
        throw new NoSuchProviderException("Can't set null provider");
      }
      finally
      {
      }
    this.providersByProtocol.put(paramProvider.getProtocol(), paramProvider);
    this.props.put("mail." + paramProvider.getProtocol() + ".class", paramProvider.getClassName());
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Session
 * JD-Core Version:    0.6.2
 */