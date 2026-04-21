package com.sun.activation.registries;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.util.Hashtable;
import java.util.StringTokenizer;

public class MimeTypeFile
{
  private String fname = null;
  private Hashtable type_hash = new Hashtable();

  public MimeTypeFile()
  {
  }

  public MimeTypeFile(InputStream paramInputStream)
    throws IOException
  {
    parse(new BufferedReader(new InputStreamReader(paramInputStream, "iso-8859-1")));
  }

  public MimeTypeFile(String paramString)
    throws IOException
  {
    this.fname = paramString;
    FileReader localFileReader = new FileReader(new File(this.fname));
    try
    {
      parse(new BufferedReader(localFileReader));
    }
    finally
    {
      try
      {
        localFileReader.close();
        return;
        localObject = finally;
        try
        {
          localFileReader.close();
          label66: throw localObject;
        }
        catch (IOException localIOException1)
        {
          break label66;
        }
      }
      catch (IOException localIOException2)
      {
      }
    }
  }

  private void parse(BufferedReader paramBufferedReader)
    throws IOException
  {
    String str1 = null;
    while (true)
    {
      String str2 = paramBufferedReader.readLine();
      if (str2 == null)
      {
        if (str1 != null)
          parseEntry(str1);
        return;
      }
      if (str1 == null);
      for (String str3 = str2; ; str3 = str1 + str2)
      {
        int i = str3.length();
        if ((str3.length() <= 0) || (str3.charAt(i - 1) != '\\'))
          break label94;
        str1 = str3.substring(0, i - 1);
        break;
      }
      label94: parseEntry(str3);
      str1 = null;
    }
  }

  private void parseEntry(String paramString)
  {
    Object localObject = null;
    String str1 = paramString.trim();
    if (str1.length() == 0)
    {
      return;
      break label14;
      break label44;
    }
    while (true)
      label14: if (str1.charAt(0) != '#')
      {
        if (str1.indexOf('=') > 0)
        {
          LineTokenizer localLineTokenizer = new LineTokenizer(str1);
          while (true)
          {
            label44: String str2;
            String str3;
            if (localLineTokenizer.hasMoreTokens())
            {
              str2 = localLineTokenizer.nextToken();
              boolean bool1 = localLineTokenizer.hasMoreTokens();
              str3 = null;
              if (bool1)
              {
                boolean bool2 = localLineTokenizer.nextToken().equals("=");
                str3 = null;
                if (bool2)
                {
                  boolean bool3 = localLineTokenizer.hasMoreTokens();
                  str3 = null;
                  if (bool3)
                    str3 = localLineTokenizer.nextToken();
                }
              }
              if (str3 == null)
              {
                if (!LogSupport.isLoggable())
                  break;
                LogSupport.log("Bad .mime.types entry: " + str1);
                return;
              }
              if (!str2.equals("type"))
                break label163;
              localObject = str3;
              continue;
            }
            break label14;
            label163: if (!str2.equals("exts"))
              break;
            StringTokenizer localStringTokenizer1 = new StringTokenizer(str3, ",");
            while (localStringTokenizer1.hasMoreTokens())
            {
              String str4 = localStringTokenizer1.nextToken();
              MimeTypeEntry localMimeTypeEntry1 = new MimeTypeEntry(localObject, str4);
              this.type_hash.put(str4, localMimeTypeEntry1);
              if (LogSupport.isLoggable())
                LogSupport.log("Added: " + localMimeTypeEntry1.toString());
            }
          }
        }
        StringTokenizer localStringTokenizer2 = new StringTokenizer(str1);
        if (localStringTokenizer2.countTokens() == 0)
          break;
        String str5 = localStringTokenizer2.nextToken();
        while (localStringTokenizer2.hasMoreTokens())
        {
          String str6 = localStringTokenizer2.nextToken();
          MimeTypeEntry localMimeTypeEntry2 = new MimeTypeEntry(str5, str6);
          this.type_hash.put(str6, localMimeTypeEntry2);
          if (LogSupport.isLoggable())
            LogSupport.log("Added: " + localMimeTypeEntry2.toString());
        }
      }
  }

  public void appendToRegistry(String paramString)
  {
    try
    {
      parse(new BufferedReader(new StringReader(paramString)));
      return;
    }
    catch (IOException localIOException)
    {
    }
  }

  public String getMIMETypeString(String paramString)
  {
    MimeTypeEntry localMimeTypeEntry = getMimeTypeEntry(paramString);
    if (localMimeTypeEntry != null)
      return localMimeTypeEntry.getMIMEType();
    return null;
  }

  public MimeTypeEntry getMimeTypeEntry(String paramString)
  {
    return (MimeTypeEntry)this.type_hash.get(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.activation.registries.MimeTypeFile
 * JD-Core Version:    0.6.2
 */