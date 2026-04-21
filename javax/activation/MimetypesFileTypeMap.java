package javax.activation;

import com.sun.activation.registries.LogSupport;
import com.sun.activation.registries.MimeTypeFile;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Vector;

public class MimetypesFileTypeMap extends FileTypeMap
{
  private static final int PROG;
  private static MimeTypeFile defDB = null;
  private static String defaultType = "application/octet-stream";
  private MimeTypeFile[] DB;

  public MimetypesFileTypeMap()
  {
    Vector localVector = new Vector(5);
    localVector.addElement(null);
    LogSupport.log("MimetypesFileTypeMap: load HOME");
    try
    {
      String str = System.getProperty("user.home");
      if (str != null)
      {
        MimeTypeFile localMimeTypeFile2 = loadFile(str + File.separator + ".mime.types");
        if (localMimeTypeFile2 != null)
          localVector.addElement(localMimeTypeFile2);
      }
      label78: LogSupport.log("MimetypesFileTypeMap: load SYS");
      try
      {
        MimeTypeFile localMimeTypeFile1 = loadFile(System.getProperty("java.home") + File.separator + "lib" + File.separator + "mime.types");
        if (localMimeTypeFile1 != null)
          localVector.addElement(localMimeTypeFile1);
        label140: LogSupport.log("MimetypesFileTypeMap: load JAR");
        loadAllResources(localVector, "mime.types");
        LogSupport.log("MimetypesFileTypeMap: load DEF");
        try
        {
          if (defDB == null)
            defDB = loadResource("/mimetypes.default");
          if (defDB != null)
            localVector.addElement(defDB);
          this.DB = new MimeTypeFile[localVector.size()];
          localVector.copyInto(this.DB);
          return;
        }
        finally
        {
        }
      }
      catch (SecurityException localSecurityException2)
      {
        break label140;
      }
    }
    catch (SecurityException localSecurityException1)
    {
      break label78;
    }
  }

  public MimetypesFileTypeMap(InputStream paramInputStream)
  {
    this();
    try
    {
      this.DB[0] = new MimeTypeFile(paramInputStream);
      return;
    }
    catch (IOException localIOException)
    {
    }
  }

  public MimetypesFileTypeMap(String paramString)
    throws IOException
  {
    this();
    this.DB[0] = new MimeTypeFile(paramString);
  }

  // ERROR //
  private void loadAllResources(Vector paramVector, String paramString)
  {
    // Byte code:
    //   0: iconst_0
    //   1: istore_3
    //   2: invokestatic 127	javax/activation/SecuritySupport:getContextClassLoader	()Ljava/lang/ClassLoader;
    //   5: astore 6
    //   7: iconst_0
    //   8: istore_3
    //   9: aload 6
    //   11: ifnonnull +12 -> 23
    //   14: aload_0
    //   15: invokevirtual 133	java/lang/Object:getClass	()Ljava/lang/Class;
    //   18: invokevirtual 138	java/lang/Class:getClassLoader	()Ljava/lang/ClassLoader;
    //   21: astore 6
    //   23: iconst_0
    //   24: istore_3
    //   25: aload 6
    //   27: ifnull +87 -> 114
    //   30: aload 6
    //   32: aload_2
    //   33: invokestatic 142	javax/activation/SecuritySupport:getResources	(Ljava/lang/ClassLoader;Ljava/lang/String;)[Ljava/net/URL;
    //   36: astore 7
    //   38: iconst_0
    //   39: istore_3
    //   40: aload 7
    //   42: ifnull +29 -> 71
    //   45: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   48: ifeq +362 -> 410
    //   51: ldc 148
    //   53: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   56: goto +354 -> 410
    //   59: aload 7
    //   61: arraylength
    //   62: istore 9
    //   64: iload 8
    //   66: iload 9
    //   68: if_icmplt +55 -> 123
    //   71: iload_3
    //   72: ifne +41 -> 113
    //   75: ldc 150
    //   77: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   80: aload_0
    //   81: new 52	java/lang/StringBuilder
    //   84: dup
    //   85: ldc 152
    //   87: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   90: aload_2
    //   91: invokevirtual 69	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   94: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   97: invokespecial 100	javax/activation/MimetypesFileTypeMap:loadResource	(Ljava/lang/String;)Lcom/sun/activation/registries/MimeTypeFile;
    //   100: astore 5
    //   102: aload 5
    //   104: ifnull +9 -> 113
    //   107: aload_1
    //   108: aload 5
    //   110: invokevirtual 34	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   113: return
    //   114: aload_2
    //   115: invokestatic 156	javax/activation/SecuritySupport:getSystemResources	(Ljava/lang/String;)[Ljava/net/URL;
    //   118: astore 7
    //   120: goto -82 -> 38
    //   123: aload 7
    //   125: iload 8
    //   127: aaload
    //   128: astore 10
    //   130: aconst_null
    //   131: astore 11
    //   133: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   136: ifeq +23 -> 159
    //   139: new 52	java/lang/StringBuilder
    //   142: dup
    //   143: ldc 158
    //   145: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   148: aload 10
    //   150: invokevirtual 161	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   153: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   156: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   159: aload 10
    //   161: invokestatic 165	javax/activation/SecuritySupport:openStream	(Ljava/net/URL;)Ljava/io/InputStream;
    //   164: astore 11
    //   166: aload 11
    //   168: ifnull +60 -> 228
    //   171: aload_1
    //   172: new 106	com/sun/activation/registries/MimeTypeFile
    //   175: dup
    //   176: aload 11
    //   178: invokespecial 118	com/sun/activation/registries/MimeTypeFile:<init>	(Ljava/io/InputStream;)V
    //   181: invokevirtual 34	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   184: iconst_1
    //   185: istore_3
    //   186: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   189: ifeq +23 -> 212
    //   192: new 52	java/lang/StringBuilder
    //   195: dup
    //   196: ldc 167
    //   198: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   201: aload 10
    //   203: invokevirtual 161	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   206: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   209: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   212: aload 11
    //   214: ifnull +8 -> 222
    //   217: aload 11
    //   219: invokevirtual 172	java/io/InputStream:close	()V
    //   222: iinc 8 1
    //   225: goto -166 -> 59
    //   228: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   231: ifeq -19 -> 212
    //   234: new 52	java/lang/StringBuilder
    //   237: dup
    //   238: ldc 174
    //   240: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   243: aload 10
    //   245: invokevirtual 161	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   248: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   251: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   254: goto -42 -> 212
    //   257: astore 16
    //   259: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   262: ifeq +25 -> 287
    //   265: new 52	java/lang/StringBuilder
    //   268: dup
    //   269: ldc 176
    //   271: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   274: aload 10
    //   276: invokevirtual 161	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   279: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   282: aload 16
    //   284: invokestatic 179	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   287: aload 11
    //   289: ifnull -67 -> 222
    //   292: aload 11
    //   294: invokevirtual 172	java/io/InputStream:close	()V
    //   297: goto -75 -> 222
    //   300: astore 17
    //   302: goto -80 -> 222
    //   305: astore 14
    //   307: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   310: ifeq +25 -> 335
    //   313: new 52	java/lang/StringBuilder
    //   316: dup
    //   317: ldc 176
    //   319: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   322: aload 10
    //   324: invokevirtual 161	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   327: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   330: aload 14
    //   332: invokestatic 179	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   335: aload 11
    //   337: ifnull -115 -> 222
    //   340: aload 11
    //   342: invokevirtual 172	java/io/InputStream:close	()V
    //   345: goto -123 -> 222
    //   348: astore 15
    //   350: goto -128 -> 222
    //   353: astore 12
    //   355: aload 11
    //   357: ifnull +8 -> 365
    //   360: aload 11
    //   362: invokevirtual 172	java/io/InputStream:close	()V
    //   365: aload 12
    //   367: athrow
    //   368: astore 4
    //   370: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   373: ifeq -302 -> 71
    //   376: new 52	java/lang/StringBuilder
    //   379: dup
    //   380: ldc 176
    //   382: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   385: aload_2
    //   386: invokevirtual 69	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   389: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   392: aload 4
    //   394: invokestatic 179	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   397: goto -326 -> 71
    //   400: astore 13
    //   402: goto -37 -> 365
    //   405: astore 18
    //   407: goto -185 -> 222
    //   410: iconst_0
    //   411: istore_3
    //   412: iconst_0
    //   413: istore 8
    //   415: goto -356 -> 59
    //
    // Exception table:
    //   from	to	target	type
    //   159	166	257	java/io/IOException
    //   171	184	257	java/io/IOException
    //   186	212	257	java/io/IOException
    //   228	254	257	java/io/IOException
    //   292	297	300	java/io/IOException
    //   159	166	305	java/lang/SecurityException
    //   171	184	305	java/lang/SecurityException
    //   186	212	305	java/lang/SecurityException
    //   228	254	305	java/lang/SecurityException
    //   340	345	348	java/io/IOException
    //   159	166	353	finally
    //   171	184	353	finally
    //   186	212	353	finally
    //   228	254	353	finally
    //   259	287	353	finally
    //   307	335	353	finally
    //   2	7	368	java/lang/Exception
    //   14	23	368	java/lang/Exception
    //   30	38	368	java/lang/Exception
    //   45	56	368	java/lang/Exception
    //   59	64	368	java/lang/Exception
    //   114	120	368	java/lang/Exception
    //   123	130	368	java/lang/Exception
    //   133	159	368	java/lang/Exception
    //   217	222	368	java/lang/Exception
    //   292	297	368	java/lang/Exception
    //   340	345	368	java/lang/Exception
    //   360	365	368	java/lang/Exception
    //   365	368	368	java/lang/Exception
    //   360	365	400	java/io/IOException
    //   217	222	405	java/io/IOException
  }

  private MimeTypeFile loadFile(String paramString)
  {
    try
    {
      MimeTypeFile localMimeTypeFile = new MimeTypeFile(paramString);
      return localMimeTypeFile;
    }
    catch (IOException localIOException)
    {
    }
    return null;
  }

  // ERROR //
  private MimeTypeFile loadResource(String paramString)
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_2
    //   2: aload_0
    //   3: invokevirtual 133	java/lang/Object:getClass	()Ljava/lang/Class;
    //   6: aload_1
    //   7: invokestatic 183	javax/activation/SecuritySupport:getResourceAsStream	(Ljava/lang/Class;Ljava/lang/String;)Ljava/io/InputStream;
    //   10: astore_2
    //   11: aload_2
    //   12: ifnull +49 -> 61
    //   15: new 106	com/sun/activation/registries/MimeTypeFile
    //   18: dup
    //   19: aload_2
    //   20: invokespecial 118	com/sun/activation/registries/MimeTypeFile:<init>	(Ljava/io/InputStream;)V
    //   23: astore 9
    //   25: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   28: ifeq +22 -> 50
    //   31: new 52	java/lang/StringBuilder
    //   34: dup
    //   35: ldc 185
    //   37: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   40: aload_1
    //   41: invokevirtual 69	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   44: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   47: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   50: aload_2
    //   51: ifnull +7 -> 58
    //   54: aload_2
    //   55: invokevirtual 172	java/io/InputStream:close	()V
    //   58: aload 9
    //   60: areturn
    //   61: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   64: ifeq +22 -> 86
    //   67: new 52	java/lang/StringBuilder
    //   70: dup
    //   71: ldc 187
    //   73: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   76: aload_1
    //   77: invokevirtual 69	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   80: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   83: invokestatic 42	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   86: aload_2
    //   87: ifnull +7 -> 94
    //   90: aload_2
    //   91: invokevirtual 172	java/io/InputStream:close	()V
    //   94: aconst_null
    //   95: areturn
    //   96: astore 7
    //   98: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   101: ifeq +24 -> 125
    //   104: new 52	java/lang/StringBuilder
    //   107: dup
    //   108: ldc 176
    //   110: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   113: aload_1
    //   114: invokevirtual 69	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   117: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   120: aload 7
    //   122: invokestatic 179	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   125: aload_2
    //   126: ifnull -32 -> 94
    //   129: aload_2
    //   130: invokevirtual 172	java/io/InputStream:close	()V
    //   133: goto -39 -> 94
    //   136: astore 8
    //   138: goto -44 -> 94
    //   141: astore 5
    //   143: invokestatic 146	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   146: ifeq +24 -> 170
    //   149: new 52	java/lang/StringBuilder
    //   152: dup
    //   153: ldc 176
    //   155: invokespecial 60	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   158: aload_1
    //   159: invokevirtual 69	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   162: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   165: aload 5
    //   167: invokestatic 179	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;Ljava/lang/Throwable;)V
    //   170: aload_2
    //   171: ifnull -77 -> 94
    //   174: aload_2
    //   175: invokevirtual 172	java/io/InputStream:close	()V
    //   178: goto -84 -> 94
    //   181: astore 6
    //   183: goto -89 -> 94
    //   186: astore_3
    //   187: aload_2
    //   188: ifnull +7 -> 195
    //   191: aload_2
    //   192: invokevirtual 172	java/io/InputStream:close	()V
    //   195: aload_3
    //   196: athrow
    //   197: astore 10
    //   199: aload 9
    //   201: areturn
    //   202: astore 4
    //   204: goto -9 -> 195
    //   207: astore 11
    //   209: goto -115 -> 94
    //
    // Exception table:
    //   from	to	target	type
    //   2	11	96	java/io/IOException
    //   15	50	96	java/io/IOException
    //   61	86	96	java/io/IOException
    //   129	133	136	java/io/IOException
    //   2	11	141	java/lang/SecurityException
    //   15	50	141	java/lang/SecurityException
    //   61	86	141	java/lang/SecurityException
    //   174	178	181	java/io/IOException
    //   2	11	186	finally
    //   15	50	186	finally
    //   61	86	186	finally
    //   98	125	186	finally
    //   143	170	186	finally
    //   54	58	197	java/io/IOException
    //   191	195	202	java/io/IOException
    //   90	94	207	java/io/IOException
  }

  public void addMimeTypes(String paramString)
  {
    try
    {
      if (this.DB[0] == null)
        this.DB[0] = new MimeTypeFile();
      this.DB[0].appendToRegistry(paramString);
      return;
    }
    finally
    {
    }
  }

  public String getContentType(File paramFile)
  {
    return getContentType(paramFile.getName());
  }

  public String getContentType(String paramString)
  {
    while (true)
    {
      try
      {
        int i = paramString.lastIndexOf(".");
        Object localObject2;
        if (i < 0)
        {
          localObject2 = defaultType;
          return localObject2;
        }
        int j = i + 1;
        String str1 = paramString.substring(j);
        if (str1.length() == 0)
        {
          localObject2 = defaultType;
          continue;
          if (k >= this.DB.length)
          {
            localObject2 = defaultType;
            continue;
          }
          if (this.DB[k] == null)
            break label120;
          String str2 = this.DB[k].getMIMETypeString(str1);
          localObject2 = str2;
          if (localObject2 == null)
            break label120;
          continue;
        }
      }
      finally
      {
      }
      int k = 0;
      continue;
      label120: k++;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.MimetypesFileTypeMap
 * JD-Core Version:    0.6.2
 */