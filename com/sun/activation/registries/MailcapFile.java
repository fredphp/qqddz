package com.sun.activation.registries;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class MailcapFile
{
  private static boolean addReverse = false;
  private Map fallback_hash = new HashMap();
  private Map native_commands = new HashMap();
  private Map type_hash = new HashMap();

  static
  {
    try
    {
      addReverse = Boolean.getBoolean("javax.activation.addreverse");
      return;
    }
    catch (Throwable localThrowable)
    {
    }
  }

  public MailcapFile()
  {
    if (LogSupport.isLoggable())
      LogSupport.log("new MailcapFile: default");
  }

  public MailcapFile(InputStream paramInputStream)
    throws IOException
  {
    if (LogSupport.isLoggable())
      LogSupport.log("new MailcapFile: InputStream");
    parse(new BufferedReader(new InputStreamReader(paramInputStream, "iso-8859-1")));
  }

  // ERROR //
  public MailcapFile(String paramString)
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: invokespecial 27	java/lang/Object:<init>	()V
    //   4: aload_0
    //   5: new 29	java/util/HashMap
    //   8: dup
    //   9: invokespecial 30	java/util/HashMap:<init>	()V
    //   12: putfield 32	com/sun/activation/registries/MailcapFile:type_hash	Ljava/util/Map;
    //   15: aload_0
    //   16: new 29	java/util/HashMap
    //   19: dup
    //   20: invokespecial 30	java/util/HashMap:<init>	()V
    //   23: putfield 34	com/sun/activation/registries/MailcapFile:fallback_hash	Ljava/util/Map;
    //   26: aload_0
    //   27: new 29	java/util/HashMap
    //   30: dup
    //   31: invokespecial 30	java/util/HashMap:<init>	()V
    //   34: putfield 36	com/sun/activation/registries/MailcapFile:native_commands	Ljava/util/Map;
    //   37: invokestatic 42	com/sun/activation/registries/LogSupport:isLoggable	()Z
    //   40: ifeq +22 -> 62
    //   43: new 70	java/lang/StringBuilder
    //   46: dup
    //   47: ldc 72
    //   49: invokespecial 74	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   52: aload_1
    //   53: invokevirtual 78	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   56: invokevirtual 82	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   59: invokestatic 48	com/sun/activation/registries/LogSupport:log	(Ljava/lang/String;)V
    //   62: aconst_null
    //   63: astore_2
    //   64: new 84	java/io/FileReader
    //   67: dup
    //   68: aload_1
    //   69: invokespecial 85	java/io/FileReader:<init>	(Ljava/lang/String;)V
    //   72: astore_3
    //   73: aload_0
    //   74: new 55	java/io/BufferedReader
    //   77: dup
    //   78: aload_3
    //   79: invokespecial 65	java/io/BufferedReader:<init>	(Ljava/io/Reader;)V
    //   82: invokespecial 68	com/sun/activation/registries/MailcapFile:parse	(Ljava/io/Reader;)V
    //   85: aload_3
    //   86: ifnull +7 -> 93
    //   89: aload_3
    //   90: invokevirtual 88	java/io/FileReader:close	()V
    //   93: return
    //   94: astore 4
    //   96: aload_2
    //   97: ifnull +7 -> 104
    //   100: aload_2
    //   101: invokevirtual 88	java/io/FileReader:close	()V
    //   104: aload 4
    //   106: athrow
    //   107: astore 5
    //   109: goto -5 -> 104
    //   112: astore 6
    //   114: return
    //   115: astore 4
    //   117: aload_3
    //   118: astore_2
    //   119: goto -23 -> 96
    //
    // Exception table:
    //   from	to	target	type
    //   64	73	94	finally
    //   100	104	107	java/io/IOException
    //   89	93	112	java/io/IOException
    //   73	85	115	finally
  }

  private Map mergeResults(Map paramMap1, Map paramMap2)
  {
    Iterator localIterator = paramMap2.keySet().iterator();
    HashMap localHashMap = new HashMap(paramMap1);
    while (true)
    {
      if (!localIterator.hasNext())
        return localHashMap;
      String str = (String)localIterator.next();
      List localList1 = (List)localHashMap.get(str);
      if (localList1 == null)
      {
        localHashMap.put(str, paramMap2.get(str));
      }
      else
      {
        List localList2 = (List)paramMap2.get(str);
        ArrayList localArrayList = new ArrayList(localList1);
        localArrayList.addAll(localList2);
        localHashMap.put(str, localArrayList);
      }
    }
  }

  private void parse(Reader paramReader)
    throws IOException
  {
    BufferedReader localBufferedReader = new BufferedReader(paramReader);
    Object localObject = null;
    while (true)
    {
      String str1 = localBufferedReader.readLine();
      if (str1 == null)
        return;
      String str2 = str1.trim();
      try
      {
        if (str2.charAt(0) != '#')
          if (str2.charAt(-1 + str2.length()) == '\\')
          {
            if (localObject != null)
              localObject = localObject + str2.substring(0, -1 + str2.length());
            else
              localObject = str2.substring(0, -1 + str2.length());
          }
          else
          {
            if (localObject != null)
            {
              String str3 = localObject + str2;
              localObject = str3;
            }
            try
            {
              parseLine((String)localObject);
              label146: localObject = null;
              continue;
              try
              {
                parseLine(str2);
              }
              catch (MailcapParseException localMailcapParseException2)
              {
              }
            }
            catch (MailcapParseException localMailcapParseException1)
            {
              break label146;
            }
          }
      }
      catch (StringIndexOutOfBoundsException localStringIndexOutOfBoundsException)
      {
      }
    }
  }

  protected static void reportParseError(int paramInt1, int paramInt2, int paramInt3, int paramInt4, String paramString)
    throws MailcapParseException
  {
    if (LogSupport.isLoggable())
      LogSupport.log("PARSE ERROR: Encountered a " + MailcapTokenizer.nameForToken(paramInt4) + " token (" + paramString + ") while expecting a " + MailcapTokenizer.nameForToken(paramInt1) + ", a " + MailcapTokenizer.nameForToken(paramInt2) + ", or a " + MailcapTokenizer.nameForToken(paramInt3) + " token.");
    throw new MailcapParseException("Encountered a " + MailcapTokenizer.nameForToken(paramInt4) + " token (" + paramString + ") while expecting a " + MailcapTokenizer.nameForToken(paramInt1) + ", a " + MailcapTokenizer.nameForToken(paramInt2) + ", or a " + MailcapTokenizer.nameForToken(paramInt3) + " token.");
  }

  protected static void reportParseError(int paramInt1, int paramInt2, int paramInt3, String paramString)
    throws MailcapParseException
  {
    throw new MailcapParseException("Encountered a " + MailcapTokenizer.nameForToken(paramInt3) + " token (" + paramString + ") while expecting a " + MailcapTokenizer.nameForToken(paramInt1) + " or a " + MailcapTokenizer.nameForToken(paramInt2) + " token.");
  }

  protected static void reportParseError(int paramInt1, int paramInt2, String paramString)
    throws MailcapParseException
  {
    throw new MailcapParseException("Encountered a " + MailcapTokenizer.nameForToken(paramInt2) + " token (" + paramString + ") while expecting a " + MailcapTokenizer.nameForToken(paramInt1) + " token.");
  }

  public void appendToMailcap(String paramString)
  {
    if (LogSupport.isLoggable())
      LogSupport.log("appendToMailcap: " + paramString);
    try
    {
      parse(new StringReader(paramString));
      return;
    }
    catch (IOException localIOException)
    {
    }
  }

  public Map getMailcapFallbackList(String paramString)
  {
    Map localMap1 = (Map)this.fallback_hash.get(paramString);
    int i = paramString.indexOf('/');
    Map localMap2;
    if (!paramString.substring(i + 1).equals("*"))
    {
      String str = paramString.substring(0, i + 1) + "*";
      localMap2 = (Map)this.fallback_hash.get(str);
      if (localMap2 != null)
      {
        if (localMap1 == null)
          break label99;
        localMap1 = mergeResults(localMap1, localMap2);
      }
    }
    return localMap1;
    label99: return localMap2;
  }

  public Map getMailcapList(String paramString)
  {
    Map localMap1 = (Map)this.type_hash.get(paramString);
    int i = paramString.indexOf('/');
    Map localMap2;
    if (!paramString.substring(i + 1).equals("*"))
    {
      String str = paramString.substring(0, i + 1) + "*";
      localMap2 = (Map)this.type_hash.get(str);
      if (localMap2 != null)
      {
        if (localMap1 == null)
          break label99;
        localMap1 = mergeResults(localMap1, localMap2);
      }
    }
    return localMap1;
    label99: return localMap2;
  }

  public String[] getMimeTypes()
  {
    HashSet localHashSet = new HashSet(this.type_hash.keySet());
    localHashSet.addAll(this.fallback_hash.keySet());
    localHashSet.addAll(this.native_commands.keySet());
    return (String[])localHashSet.toArray(new String[localHashSet.size()]);
  }

  public String[] getNativeCommands(String paramString)
  {
    String[] arrayOfString = (String[])null;
    List localList = (List)this.native_commands.get(paramString.toLowerCase(Locale.ENGLISH));
    if (localList != null)
      arrayOfString = (String[])localList.toArray(new String[localList.size()]);
    return arrayOfString;
  }

  protected void parseLine(String paramString)
    throws MailcapParseException, IOException
  {
    MailcapTokenizer localMailcapTokenizer = new MailcapTokenizer(paramString);
    localMailcapTokenizer.setIsAutoquoting(false);
    if (LogSupport.isLoggable())
      LogSupport.log("parse: " + paramString);
    int i = localMailcapTokenizer.nextToken();
    if (i != 2)
      reportParseError(2, i, localMailcapTokenizer.getCurrentTokenValue());
    String str1 = localMailcapTokenizer.getCurrentTokenValue().toLowerCase(Locale.ENGLISH);
    String str2 = "*";
    int j = localMailcapTokenizer.nextToken();
    if ((j != 47) && (j != 59))
      reportParseError(47, 59, j, localMailcapTokenizer.getCurrentTokenValue());
    if (j == 47)
    {
      int i3 = localMailcapTokenizer.nextToken();
      if (i3 != 2)
        reportParseError(2, i3, localMailcapTokenizer.getCurrentTokenValue());
      str2 = localMailcapTokenizer.getCurrentTokenValue().toLowerCase(Locale.ENGLISH);
      j = localMailcapTokenizer.nextToken();
    }
    String str3 = str1 + "/" + str2;
    if (LogSupport.isLoggable())
      LogSupport.log("  Type: " + str3);
    LinkedHashMap localLinkedHashMap = new LinkedHashMap();
    if (j != 59)
      reportParseError(59, j, localMailcapTokenizer.getCurrentTokenValue());
    localMailcapTokenizer.setIsAutoquoting(true);
    int k = localMailcapTokenizer.nextToken();
    localMailcapTokenizer.setIsAutoquoting(false);
    if ((k != 2) && (k != 59))
      reportParseError(2, 59, k, localMailcapTokenizer.getCurrentTokenValue());
    List localList3;
    if (k == 2)
    {
      localList3 = (List)this.native_commands.get(str3);
      if (localList3 == null)
      {
        ArrayList localArrayList = new ArrayList();
        localArrayList.add(paramString);
        this.native_commands.put(str3, localArrayList);
      }
    }
    else
    {
      if (k != 59)
        k = localMailcapTokenizer.nextToken();
      if (k != 59)
        break label954;
      m = 0;
      do
      {
        n = localMailcapTokenizer.nextToken();
        if (n != 2)
          reportParseError(2, n, localMailcapTokenizer.getCurrentTokenValue());
        str4 = localMailcapTokenizer.getCurrentTokenValue().toLowerCase(Locale.ENGLISH);
        i1 = localMailcapTokenizer.nextToken();
        if ((i1 != 61) && (i1 != 59) && (i1 != 5))
          reportParseError(61, 59, 5, i1, localMailcapTokenizer.getCurrentTokenValue());
        if (i1 == 61)
        {
          localMailcapTokenizer.setIsAutoquoting(true);
          i2 = localMailcapTokenizer.nextToken();
          localMailcapTokenizer.setIsAutoquoting(false);
          if (i2 != 2)
            reportParseError(2, i2, localMailcapTokenizer.getCurrentTokenValue());
          str8 = localMailcapTokenizer.getCurrentTokenValue();
          if (str4.startsWith("x-java-"))
          {
            str9 = str4.substring(7);
            if ((!str9.equals("fallback-entry")) || (!str8.equalsIgnoreCase("true")))
              break;
            m = 1;
          }
          i1 = localMailcapTokenizer.nextToken();
        }
      }
      while (i1 == 59);
      if (m == 0)
        break label701;
      localMap1 = this.fallback_hash;
      localMap2 = (Map)localMap1.get(str3);
      if (localMap2 != null)
        break label710;
      localMap1.put(str3, localLinkedHashMap);
    }
    label701: label710: 
    while (k == 5)
    {
      Map localMap2;
      while (true)
      {
        int m;
        int n;
        String str4;
        int i1;
        int i2;
        String str8;
        String str9;
        Map localMap1;
        return;
        localList3.add(paramString);
        break;
        if (LogSupport.isLoggable())
          LogSupport.log("    Command: " + str9 + ", Class: " + str8);
        Object localObject = (List)localLinkedHashMap.get(str9);
        if (localObject == null)
        {
          localObject = new ArrayList();
          localLinkedHashMap.put(str9, localObject);
        }
        if (addReverse)
        {
          ((List)localObject).add(0, str8);
        }
        else
        {
          ((List)localObject).add(str8);
          continue;
          localMap1 = this.type_hash;
        }
      }
      if (LogSupport.isLoggable())
        LogSupport.log("Merging commands for type " + str3);
      Iterator localIterator1 = localMap2.keySet().iterator();
      while (true)
      {
        if (!localIterator1.hasNext())
        {
          Iterator localIterator3 = localLinkedHashMap.keySet().iterator();
          while (localIterator3.hasNext())
          {
            String str7 = (String)localIterator3.next();
            if (!localMap2.containsKey(str7))
              localMap2.put(str7, (List)localLinkedHashMap.get(str7));
          }
          break;
        }
        String str5 = (String)localIterator1.next();
        List localList1 = (List)localMap2.get(str5);
        List localList2 = (List)localLinkedHashMap.get(str5);
        if (localList2 != null)
        {
          Iterator localIterator2 = localList2.iterator();
          while (localIterator2.hasNext())
          {
            String str6 = (String)localIterator2.next();
            if (!localList1.contains(str6))
              if (addReverse)
                localList1.add(0, str6);
              else
                localList1.add(str6);
          }
        }
      }
    }
    label954: reportParseError(5, 59, k, localMailcapTokenizer.getCurrentTokenValue());
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.activation.registries.MailcapFile
 * JD-Core Version:    0.6.2
 */