package javax.activation;

import com.sun.activation.registries.LogSupport;
import com.sun.activation.registries.MailcapFile;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class MailcapCommandMap extends CommandMap
{
  private static final int PROG;
  private static MailcapFile defDB = null;
  private MailcapFile[] DB;

  public MailcapCommandMap()
  {
    ArrayList localArrayList = new ArrayList(5);
    localArrayList.add(null);
    LogSupport.log("MailcapCommandMap: load HOME");
    try
    {
      String str = System.getProperty("user.home");
      if (str != null)
      {
        MailcapFile localMailcapFile2 = loadFile(str + File.separator + ".mailcap");
        if (localMailcapFile2 != null)
          localArrayList.add(localMailcapFile2);
      }
      label84: LogSupport.log("MailcapCommandMap: load SYS");
      try
      {
        MailcapFile localMailcapFile1 = loadFile(System.getProperty("java.home") + File.separator + "lib" + File.separator + "mailcap");
        if (localMailcapFile1 != null)
          localArrayList.add(localMailcapFile1);
        label149: LogSupport.log("MailcapCommandMap: load JAR");
        loadAllResources(localArrayList, "mailcap");
        LogSupport.log("MailcapCommandMap: load DEF");
        try
        {
          if (defDB == null)
            defDB = loadResource("mailcap.default");
          if (defDB != null)
            localArrayList.add(defDB);
          this.DB = new MailcapFile[localArrayList.size()];
          this.DB = ((MailcapFile[])localArrayList.toArray(this.DB));
          return;
        }
        finally
        {
        }
      }
      catch (SecurityException localSecurityException2)
      {
        break label149;
      }
    }
    catch (SecurityException localSecurityException1)
    {
      break label84;
    }
  }

  public MailcapCommandMap(InputStream paramInputStream)
  {
    this();
    LogSupport.log("MailcapCommandMap: load PROG");
    if (this.DB[0] == null);
    try
    {
      this.DB[0] = new MailcapFile(paramInputStream);
      return;
    }
    catch (IOException localIOException)
    {
    }
  }

  public MailcapCommandMap(String paramString)
    throws IOException
  {
    this();
    if (LogSupport.isLoggable())
      LogSupport.log("MailcapCommandMap: load PROG from " + paramString);
    if (this.DB[0] == null)
      this.DB[0] = new MailcapFile(paramString);
  }

  private void appendCmdsToList(Map paramMap, List paramList)
  {
    Iterator localIterator1 = paramMap.keySet().iterator();
    while (true)
    {
      if (!localIterator1.hasNext())
        return;
      String str = (String)localIterator1.next();
      Iterator localIterator2 = ((List)paramMap.get(str)).iterator();
      while (localIterator2.hasNext())
        paramList.add(new CommandInfo(str, (String)localIterator2.next()));
    }
  }

  private void appendPrefCmdsToList(Map paramMap, List paramList)
  {
    Iterator localIterator = paramMap.keySet().iterator();
    while (true)
    {
      if (!localIterator.hasNext())
        return;
      String str = (String)localIterator.next();
      if (!checkForVerb(paramList, str))
        paramList.add(new CommandInfo(str, (String)((List)paramMap.get(str)).get(0)));
    }
  }

  private boolean checkForVerb(List paramList, String paramString)
  {
    Iterator localIterator = paramList.iterator();
    do
      if (!localIterator.hasNext())
        return false;
    while (!((CommandInfo)localIterator.next()).getCommandName().equals(paramString));
    return true;
  }

  private DataContentHandler getDataContentHandler(String paramString)
  {
    if (LogSupport.isLoggable())
      LogSupport.log("    got content-handler");
    if (LogSupport.isLoggable())
      LogSupport.log("      class " + paramString);
    try
    {
      Object localObject1 = SecuritySupport.getContextClassLoader();
      if (localObject1 == null)
      {
        ClassLoader localClassLoader = getClass().getClassLoader();
        localObject1 = localClassLoader;
      }
      try
      {
        Class localClass2 = ((ClassLoader)localObject1).loadClass(paramString);
        localObject2 = localClass2;
        if (localObject2 != null)
          return (DataContentHandler)((Class)localObject2).newInstance();
      }
      catch (Exception localException)
      {
        while (true)
        {
          Class localClass1 = Class.forName(paramString);
          Object localObject2 = localClass1;
        }
      }
    }
    catch (IllegalAccessException localIllegalAccessException)
    {
      if (LogSupport.isLoggable())
        LogSupport.log("Can't load DCH " + paramString, localIllegalAccessException);
      return null;
    }
    catch (ClassNotFoundException localClassNotFoundException)
    {
      while (true)
        if (LogSupport.isLoggable())
          LogSupport.log("Can't load DCH " + paramString, localClassNotFoundException);
    }
    catch (InstantiationException localInstantiationException)
    {
      while (true)
        if (LogSupport.isLoggable())
          LogSupport.log("Can't load DCH " + paramString, localInstantiationException);
    }
  }

  // ERROR //
  private void loadAllResources(List paramList, String paramString)
  {
    // Byte code:
    //   0: iconst_0
    //   1: istore_3
    //   2: invokestatic 192	javax/activation/SecuritySupport:getContextClassLoader	()Ljava/lang/ClassLoader;
    //   5: astore 7
    //   7: iconst_0
    //   8: istore_3
    //   9: aload 7
    //   11: ifnonnull +12 -> 23
    //   14: aload_0
    //   15: invokevirtual 198	java/lang/Object:getClass	()Ljava/lang/Class;
    //   18: invokevirtual 203	java/lang/Class:getClassLoader	()Ljava/lang/ClassLoader;
    //   21: astore 7
    //   23: iconst_0
    //   24: istore_3
    //   25: aload 7
    //   27: ifnull +96 -> 123
    //   30: aload 7
    //   32: aload_2
    //   33: invokestatic 226	javax/activation/SecuritySupport:getResources	(Ljava/lang/ClassLoader;Ljava/lang/String;)[Ljava/net/URL;
    //   36: astore 8
    //   38: iconst_0
    //   39: istore_3
    //   40: aload 8
    //   42: ifnull +29 -> 71
    //   45: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   48: ifeq +377 -> 425
    //   51: ldc 228
    //   53: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   56: goto +369 -> 425
    //   59: aload 8
    //   61: arraylength
    //   62: istore 10
    //   64: iload 9
    //   66: iload 10
    //   68: if_icmplt +64 -> 132
    //   71: iload_3
    //   72: ifne +50 -> 122
    //   75: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   78: ifeq +8 -> 86
    //   81: ldc 230
    //   83: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   86: aload_0
    //   87: new 48	java/lang/StringBuilder
    //   90: dup
    //   91: ldc 232
    //   93: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   96: aload_2
    //   97: invokevirtual 66	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   100: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   103: invokespecial 97	javax/activation/MailcapCommandMap:loadResource	(Ljava/lang/String;)Lcom/sun/activation/registries/MailcapFile;
    //   106: astore 5
    //   108: aload 5
    //   110: ifnull +12 -> 122
    //   113: aload_1
    //   114: aload 5
    //   116: invokeinterface 30 2 0
    //   121: pop
    //   122: return
    //   123: aload_2
    //   124: invokestatic 236	javax/activation/SecuritySupport:getSystemResources	(Ljava/lang/String;)[Ljava/net/URL;
    //   127: astore 8
    //   129: goto -91 -> 38
    //   132: aload 8
    //   134: iload 9
    //   136: aaload
    //   137: astore 11
    //   139: aconst_null
    //   140: astore 12
    //   142: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   145: ifeq +23 -> 168
    //   148: new 48	java/lang/StringBuilder
    //   151: dup
    //   152: ldc 238
    //   154: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   157: aload 11
    //   159: invokevirtual 241	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   162: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   165: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   168: aload 11
    //   170: invokestatic 245	javax/activation/SecuritySupport:openStream	(Ljava/net/URL;)Ljava/io/InputStream;
    //   173: astore 12
    //   175: aload 12
    //   177: ifnull +63 -> 240
    //   180: aload_1
    //   181: new 103	com/sun/activation/registries/MailcapFile
    //   184: dup
    //   185: aload 12
    //   187: invokespecial 118	com/sun/activation/registries/MailcapFile:<init>	(Ljava/io/InputStream;)V
    //   190: invokeinterface 30 2 0
    //   195: pop
    //   196: iconst_1
    //   197: istore_3
    //   198: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   201: ifeq +23 -> 224
    //   204: new 48	java/lang/StringBuilder
    //   207: dup
    //   208: ldc 247
    //   210: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   213: aload 11
    //   215: invokevirtual 241	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   218: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   221: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   224: aload 12
    //   226: ifnull +8 -> 234
    //   229: aload 12
    //   231: invokevirtual 252	java/io/InputStream:close	()V
    //   234: iinc 9 1
    //   237: goto -178 -> 59
    //   240: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   243: ifeq -19 -> 224
    //   246: new 48	java/lang/StringBuilder
    //   249: dup
    //   250: ldc 254
    //   252: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   255: aload 11
    //   257: invokevirtual 241	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   260: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   263: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   266: goto -42 -> 224
    //   269: astore 17
    //   271: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   274: ifeq +26 -> 300
    //   277: new 48	java/lang/StringBuilder
    //   280: dup
    //   281: ldc_w 256
    //   284: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   287: aload 11
    //   289: invokevirtual 241	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   292: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   295: aload 17
    //   297: invokestatic 222	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   300: aload 12
    //   302: ifnull -68 -> 234
    //   305: aload 12
    //   307: invokevirtual 252	java/io/InputStream:close	()V
    //   310: goto -76 -> 234
    //   313: astore 18
    //   315: goto -81 -> 234
    //   318: astore 15
    //   320: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   323: ifeq +26 -> 349
    //   326: new 48	java/lang/StringBuilder
    //   329: dup
    //   330: ldc_w 256
    //   333: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   336: aload 11
    //   338: invokevirtual 241	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   341: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   344: aload 15
    //   346: invokestatic 222	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   349: aload 12
    //   351: ifnull -117 -> 234
    //   354: aload 12
    //   356: invokevirtual 252	java/io/InputStream:close	()V
    //   359: goto -125 -> 234
    //   362: astore 16
    //   364: goto -130 -> 234
    //   367: astore 13
    //   369: aload 12
    //   371: ifnull +8 -> 379
    //   374: aload 12
    //   376: invokevirtual 252	java/io/InputStream:close	()V
    //   379: aload 13
    //   381: athrow
    //   382: astore 4
    //   384: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   387: ifeq -316 -> 71
    //   390: new 48	java/lang/StringBuilder
    //   393: dup
    //   394: ldc_w 256
    //   397: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   400: aload_2
    //   401: invokevirtual 66	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   404: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   407: aload 4
    //   409: invokestatic 222	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   412: goto -341 -> 71
    //   415: astore 14
    //   417: goto -38 -> 379
    //   420: astore 20
    //   422: goto -188 -> 234
    //   425: iconst_0
    //   426: istore_3
    //   427: iconst_0
    //   428: istore 9
    //   430: goto -371 -> 59
    //
    // Exception table:
    //   from	to	target	type
    //   168	175	269	java/io/IOException
    //   180	196	269	java/io/IOException
    //   198	224	269	java/io/IOException
    //   240	266	269	java/io/IOException
    //   305	310	313	java/io/IOException
    //   168	175	318	java/lang/SecurityException
    //   180	196	318	java/lang/SecurityException
    //   198	224	318	java/lang/SecurityException
    //   240	266	318	java/lang/SecurityException
    //   354	359	362	java/io/IOException
    //   168	175	367	finally
    //   180	196	367	finally
    //   198	224	367	finally
    //   240	266	367	finally
    //   271	300	367	finally
    //   320	349	367	finally
    //   2	7	382	java/lang/Exception
    //   14	23	382	java/lang/Exception
    //   30	38	382	java/lang/Exception
    //   45	56	382	java/lang/Exception
    //   59	64	382	java/lang/Exception
    //   123	129	382	java/lang/Exception
    //   132	139	382	java/lang/Exception
    //   142	168	382	java/lang/Exception
    //   229	234	382	java/lang/Exception
    //   305	310	382	java/lang/Exception
    //   354	359	382	java/lang/Exception
    //   374	379	382	java/lang/Exception
    //   379	382	382	java/lang/Exception
    //   374	379	415	java/io/IOException
    //   229	234	420	java/io/IOException
  }

  private MailcapFile loadFile(String paramString)
  {
    try
    {
      MailcapFile localMailcapFile = new MailcapFile(paramString);
      return localMailcapFile;
    }
    catch (IOException localIOException)
    {
    }
    return null;
  }

  // ERROR //
  private MailcapFile loadResource(String paramString)
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_2
    //   2: aload_0
    //   3: invokevirtual 198	java/lang/Object:getClass	()Ljava/lang/Class;
    //   6: aload_1
    //   7: invokestatic 260	javax/activation/SecuritySupport:getResourceAsStream	(Ljava/lang/Class;Ljava/lang/String;)Ljava/io/InputStream;
    //   10: astore_2
    //   11: aload_2
    //   12: ifnull +50 -> 62
    //   15: new 103	com/sun/activation/registries/MailcapFile
    //   18: dup
    //   19: aload_2
    //   20: invokespecial 118	com/sun/activation/registries/MailcapFile:<init>	(Ljava/io/InputStream;)V
    //   23: astore 9
    //   25: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   28: ifeq +23 -> 51
    //   31: new 48	java/lang/StringBuilder
    //   34: dup
    //   35: ldc_w 262
    //   38: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   41: aload_1
    //   42: invokevirtual 66	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   45: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   48: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   51: aload_2
    //   52: ifnull +7 -> 59
    //   55: aload_2
    //   56: invokevirtual 252	java/io/InputStream:close	()V
    //   59: aload 9
    //   61: areturn
    //   62: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   65: ifeq +23 -> 88
    //   68: new 48	java/lang/StringBuilder
    //   71: dup
    //   72: ldc_w 264
    //   75: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   78: aload_1
    //   79: invokevirtual 66	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   82: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   85: invokestatic 38	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   88: aload_2
    //   89: ifnull +7 -> 96
    //   92: aload_2
    //   93: invokevirtual 252	java/io/InputStream:close	()V
    //   96: aconst_null
    //   97: areturn
    //   98: astore 7
    //   100: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   103: ifeq +25 -> 128
    //   106: new 48	java/lang/StringBuilder
    //   109: dup
    //   110: ldc_w 256
    //   113: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   116: aload_1
    //   117: invokevirtual 66	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   120: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   123: aload 7
    //   125: invokestatic 222	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   128: aload_2
    //   129: ifnull -33 -> 96
    //   132: aload_2
    //   133: invokevirtual 252	java/io/InputStream:close	()V
    //   136: goto -40 -> 96
    //   139: astore 8
    //   141: goto -45 -> 96
    //   144: astore 5
    //   146: invokestatic 122	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   149: ifeq +25 -> 174
    //   152: new 48	java/lang/StringBuilder
    //   155: dup
    //   156: ldc_w 256
    //   159: invokespecial 56	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   162: aload_1
    //   163: invokevirtual 66	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   166: invokevirtual 72	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   169: aload 5
    //   171: invokestatic 222	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   174: aload_2
    //   175: ifnull -79 -> 96
    //   178: aload_2
    //   179: invokevirtual 252	java/io/InputStream:close	()V
    //   182: goto -86 -> 96
    //   185: astore 6
    //   187: goto -91 -> 96
    //   190: astore_3
    //   191: aload_2
    //   192: ifnull +7 -> 199
    //   195: aload_2
    //   196: invokevirtual 252	java/io/InputStream:close	()V
    //   199: aload_3
    //   200: athrow
    //   201: astore 10
    //   203: aload 9
    //   205: areturn
    //   206: astore 4
    //   208: goto -9 -> 199
    //   211: astore 11
    //   213: goto -117 -> 96
    //
    // Exception table:
    //   from	to	target	type
    //   2	11	98	java/io/IOException
    //   15	51	98	java/io/IOException
    //   62	88	98	java/io/IOException
    //   132	136	139	java/io/IOException
    //   2	11	144	java/lang/SecurityException
    //   15	51	144	java/lang/SecurityException
    //   62	88	144	java/lang/SecurityException
    //   178	182	185	java/io/IOException
    //   2	11	190	finally
    //   15	51	190	finally
    //   62	88	190	finally
    //   100	128	190	finally
    //   146	174	190	finally
    //   55	59	201	java/io/IOException
    //   195	199	206	java/io/IOException
    //   92	96	211	java/io/IOException
  }

  public void addMailcap(String paramString)
  {
    try
    {
      LogSupport.log("MailcapCommandMap: add to PROG");
      if (this.DB[0] == null)
        this.DB[0] = new MailcapFile();
      this.DB[0].appendToMailcap(paramString);
      return;
    }
    finally
    {
    }
  }

  public DataContentHandler createDataContentHandler(String paramString)
  {
    while (true)
    {
      int j;
      try
      {
        if (LogSupport.isLoggable())
          LogSupport.log("MailcapCommandMap: createDataContentHandler for " + paramString);
        if (paramString != null)
        {
          paramString = paramString.toLowerCase(Locale.ENGLISH);
          break label289;
          if (i >= this.DB.length)
          {
            j = 0;
            int k = this.DB.length;
            if (j >= k)
            {
              localObject2 = null;
              return localObject2;
            }
          }
          else
          {
            if (this.DB[i] == null)
              break label294;
            if (LogSupport.isLoggable())
              LogSupport.log("  search DB #" + i);
            Map localMap2 = this.DB[i].getMailcapList(paramString);
            if (localMap2 == null)
              break label294;
            List localList2 = (List)localMap2.get("content-handler");
            if (localList2 == null)
              break label294;
            localObject2 = getDataContentHandler((String)localList2.get(0));
            if (localObject2 == null)
              break label294;
            continue;
          }
          if (this.DB[j] == null)
            break label300;
          if (LogSupport.isLoggable())
            LogSupport.log("  search fallback DB #" + j);
          Map localMap1 = this.DB[j].getMailcapFallbackList(paramString);
          if (localMap1 == null)
            break label300;
          List localList1 = (List)localMap1.get("content-handler");
          if (localList1 == null)
            break label300;
          DataContentHandler localDataContentHandler = getDataContentHandler((String)localList1.get(0));
          Object localObject2 = localDataContentHandler;
          if (localObject2 == null)
            break label300;
          continue;
        }
      }
      finally
      {
      }
      label289: int i = 0;
      continue;
      label294: i++;
      continue;
      label300: j++;
    }
  }

  public CommandInfo[] getAllCommands(String paramString)
  {
    while (true)
    {
      ArrayList localArrayList;
      int i;
      int j;
      try
      {
        localArrayList = new ArrayList();
        if (paramString == null)
          break label160;
        paramString = paramString.toLowerCase(Locale.ENGLISH);
        break label160;
        if (i >= this.DB.length)
        {
          j = 0;
          if (j >= this.DB.length)
          {
            CommandInfo[] arrayOfCommandInfo = (CommandInfo[])localArrayList.toArray(new CommandInfo[localArrayList.size()]);
            return arrayOfCommandInfo;
          }
        }
        else
        {
          if (this.DB[i] == null)
            break label166;
          Map localMap2 = this.DB[i].getMailcapList(paramString);
          if (localMap2 == null)
            break label166;
          appendCmdsToList(localMap2, localArrayList);
        }
      }
      finally
      {
      }
      if (this.DB[j] != null)
      {
        Map localMap1 = this.DB[j].getMailcapFallbackList(paramString);
        if (localMap1 != null)
        {
          appendCmdsToList(localMap1, localArrayList);
          break label172;
          label160: i = 0;
          continue;
          label166: i++;
        }
      }
      else
      {
        label172: j++;
      }
    }
  }

  public CommandInfo getCommand(String paramString1, String paramString2)
  {
    if (paramString1 != null);
    while (true)
    {
      int i;
      int j;
      CommandInfo localCommandInfo;
      try
      {
        paramString1 = paramString1.toLowerCase(Locale.ENGLISH);
        break label220;
        if (i >= this.DB.length)
        {
          j = 0;
          int k = this.DB.length;
          if (j >= k)
          {
            localCommandInfo = null;
            return localCommandInfo;
          }
        }
        else
        {
          if (this.DB[i] == null)
            break label225;
          Map localMap2 = this.DB[i].getMailcapList(paramString1);
          if (localMap2 == null)
            break label225;
          List localList2 = (List)localMap2.get(paramString2);
          if (localList2 == null)
            break label225;
          String str2 = (String)localList2.get(0);
          if (str2 == null)
            break label225;
          localCommandInfo = new CommandInfo(paramString2, str2);
          continue;
        }
      }
      finally
      {
      }
      if (this.DB[j] != null)
      {
        Map localMap1 = this.DB[j].getMailcapFallbackList(paramString1);
        if (localMap1 != null)
        {
          List localList1 = (List)localMap1.get(paramString2);
          if (localList1 != null)
          {
            String str1 = (String)localList1.get(0);
            if (str1 != null)
            {
              localCommandInfo = new CommandInfo(paramString2, str1);
              continue;
              label220: i = 0;
              continue;
              label225: i++;
            }
          }
        }
      }
      else
      {
        j++;
      }
    }
  }

  public String[] getMimeTypes()
  {
    while (true)
    {
      try
      {
        ArrayList localArrayList = new ArrayList();
        int i = 0;
        if (i >= this.DB.length)
        {
          String[] arrayOfString2 = (String[])localArrayList.toArray(new String[localArrayList.size()]);
          return arrayOfString2;
        }
        if (this.DB[i] != null)
        {
          String[] arrayOfString1 = this.DB[i].getMimeTypes();
          if (arrayOfString1 != null)
          {
            int j = 0;
            if (j < arrayOfString1.length)
            {
              if (!localArrayList.contains(arrayOfString1[j]))
                localArrayList.add(arrayOfString1[j]);
              j++;
              continue;
            }
          }
        }
      }
      finally
      {
      }
      i++;
    }
  }

  public String[] getNativeCommands(String paramString)
  {
    while (true)
    {
      try
      {
        ArrayList localArrayList = new ArrayList();
        if (paramString != null)
        {
          paramString = paramString.toLowerCase(Locale.ENGLISH);
          break label139;
          if (i >= this.DB.length)
          {
            String[] arrayOfString2 = (String[])localArrayList.toArray(new String[localArrayList.size()]);
            return arrayOfString2;
          }
          if (this.DB[i] == null)
            break label145;
          String[] arrayOfString1 = this.DB[i].getNativeCommands(paramString);
          if (arrayOfString1 == null)
            break label145;
          int j = 0;
          if (j >= arrayOfString1.length)
            break label145;
          if (!localArrayList.contains(arrayOfString1[j]))
            localArrayList.add(arrayOfString1[j]);
          j++;
          continue;
        }
      }
      finally
      {
      }
      label139: int i = 0;
      continue;
      label145: i++;
    }
  }

  public CommandInfo[] getPreferredCommands(String paramString)
  {
    while (true)
    {
      ArrayList localArrayList;
      int i;
      int j;
      try
      {
        localArrayList = new ArrayList();
        if (paramString == null)
          break label160;
        paramString = paramString.toLowerCase(Locale.ENGLISH);
        break label160;
        if (i >= this.DB.length)
        {
          j = 0;
          if (j >= this.DB.length)
          {
            CommandInfo[] arrayOfCommandInfo = (CommandInfo[])localArrayList.toArray(new CommandInfo[localArrayList.size()]);
            return arrayOfCommandInfo;
          }
        }
        else
        {
          if (this.DB[i] == null)
            break label166;
          Map localMap2 = this.DB[i].getMailcapList(paramString);
          if (localMap2 == null)
            break label166;
          appendPrefCmdsToList(localMap2, localArrayList);
        }
      }
      finally
      {
      }
      if (this.DB[j] != null)
      {
        Map localMap1 = this.DB[j].getMailcapFallbackList(paramString);
        if (localMap1 != null)
        {
          appendPrefCmdsToList(localMap1, localArrayList);
          break label172;
          label160: i = 0;
          continue;
          label166: i++;
        }
      }
      else
      {
        label172: j++;
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.MailcapCommandMap
 * JD-Core Version:    0.6.2
 */