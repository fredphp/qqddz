package javax.mail;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.BitSet;
import java.util.Locale;

public class URLName
{
  static final int caseDiff = 32;
  private static boolean doEncode = bool;
  static BitSet dontNeedEncoding;
  private String file;
  protected String fullURL;
  private int hashCode = 0;
  private String host;
  private InetAddress hostAddress;
  private boolean hostAddressKnown = false;
  private String password;
  private int port = -1;
  private String protocol;
  private String ref;
  private String username;

  static
  {
    boolean bool = true;
    try
    {
      if (Boolean.getBoolean("mail.URLName.dontencode"))
        bool = false;
      doEncode = bool;
      label20: dontNeedEncoding = new BitSet(256);
      int i = 97;
      int j;
      if (i > 122)
      {
        j = 65;
        label45: if (j <= 90)
          break label116;
      }
      for (int k = 48; ; k++)
      {
        if (k > 57)
        {
          dontNeedEncoding.set(32);
          dontNeedEncoding.set(45);
          dontNeedEncoding.set(95);
          dontNeedEncoding.set(46);
          dontNeedEncoding.set(42);
          return;
          dontNeedEncoding.set(i);
          i++;
          break;
          label116: dontNeedEncoding.set(j);
          j++;
          break label45;
        }
        dontNeedEncoding.set(k);
      }
    }
    catch (Exception localException)
    {
      break label20;
    }
  }

  public URLName(String paramString)
  {
    parseString(paramString);
  }

  public URLName(String paramString1, String paramString2, int paramInt, String paramString3, String paramString4, String paramString5)
  {
    this.protocol = paramString1;
    this.host = paramString2;
    this.port = paramInt;
    int i;
    if (paramString3 != null)
    {
      i = paramString3.indexOf('#');
      if (i != -1)
        this.file = paramString3.substring(0, i);
    }
    for (this.ref = paramString3.substring(i + 1); ; this.ref = null)
    {
      if (doEncode)
        paramString4 = encode(paramString4);
      this.username = paramString4;
      if (doEncode)
        paramString5 = encode(paramString5);
      this.password = paramString5;
      return;
      this.file = paramString3;
    }
  }

  public URLName(URL paramURL)
  {
    this(paramURL.toString());
  }

  private static String _encode(String paramString)
  {
    StringBuffer localStringBuffer = new StringBuffer(paramString.length());
    ByteArrayOutputStream localByteArrayOutputStream = new ByteArrayOutputStream(10);
    OutputStreamWriter localOutputStreamWriter = new OutputStreamWriter(localByteArrayOutputStream);
    char c1;
    for (int i = 0; ; i++)
    {
      if (i >= paramString.length())
        return localStringBuffer.toString();
      c1 = paramString.charAt(i);
      if (!dontNeedEncoding.get(c1))
        break;
      if (c1 == ' ')
        c1 = '+';
      localStringBuffer.append(c1);
    }
    while (true)
    {
      byte[] arrayOfByte;
      int j;
      try
      {
        localOutputStreamWriter.write(c1);
        localOutputStreamWriter.flush();
        arrayOfByte = localByteArrayOutputStream.toByteArray();
        j = 0;
        if (j < arrayOfByte.length)
          break label134;
        localByteArrayOutputStream.reset();
      }
      catch (IOException localIOException)
      {
        localByteArrayOutputStream.reset();
      }
      break;
      label134: localStringBuffer.append('%');
      char c2 = Character.forDigit(0xF & arrayOfByte[j] >> 4, 16);
      if (Character.isLetter(c2))
        c2 = (char)(c2 - ' ');
      localStringBuffer.append(c2);
      char c3 = Character.forDigit(0xF & arrayOfByte[j], 16);
      if (Character.isLetter(c3))
        c3 = (char)(c3 - ' ');
      localStringBuffer.append(c3);
      j++;
    }
  }

  static String decode(String paramString)
  {
    if (paramString == null)
      paramString = null;
    while (indexOfAny(paramString, "+%") == -1)
      return paramString;
    StringBuffer localStringBuffer = new StringBuffer();
    int i = 0;
    while (true)
    {
      Object localObject;
      if (i >= paramString.length())
        localObject = localStringBuffer.toString();
      try
      {
        String str = new String(((String)localObject).getBytes("8859_1"));
        localObject = str;
        label62: return localObject;
        char c = paramString.charAt(i);
        switch (c)
        {
        default:
          localStringBuffer.append(c);
        case '+':
        case '%':
        }
        while (true)
        {
          i++;
          break;
          localStringBuffer.append(' ');
          continue;
          int j = i + 1;
          int k = i + 3;
          try
          {
            localStringBuffer.append((char)Integer.parseInt(paramString.substring(j, k), 16));
            i += 2;
          }
          catch (NumberFormatException localNumberFormatException)
          {
            throw new IllegalArgumentException();
          }
        }
      }
      catch (UnsupportedEncodingException localUnsupportedEncodingException)
      {
        break label62;
      }
    }
  }

  static String encode(String paramString)
  {
    if (paramString == null)
      paramString = null;
    while (true)
    {
      return paramString;
      for (int i = 0; i < paramString.length(); i++)
      {
        int j = paramString.charAt(i);
        if ((j == 32) || (!dontNeedEncoding.get(j)))
          return _encode(paramString);
      }
    }
  }

  private InetAddress getHostAddress()
  {
    try
    {
      InetAddress localInetAddress;
      if (this.hostAddressKnown)
        localInetAddress = this.hostAddress;
      while (true)
      {
        return localInetAddress;
        String str = this.host;
        localInetAddress = null;
        if (str == null)
          continue;
        try
        {
          this.hostAddress = InetAddress.getByName(this.host);
          this.hostAddressKnown = true;
          localInetAddress = this.hostAddress;
        }
        catch (UnknownHostException localUnknownHostException)
        {
          while (true)
            this.hostAddress = null;
        }
      }
    }
    finally
    {
    }
  }

  private static int indexOfAny(String paramString1, String paramString2)
  {
    return indexOfAny(paramString1, paramString2, 0);
  }

  private static int indexOfAny(String paramString1, String paramString2, int paramInt)
  {
    int j;
    while (true)
    {
      int i;
      try
      {
        i = paramString1.length();
        j = paramInt;
        break label38;
        int k = paramString2.indexOf(paramString1.charAt(j));
        if (k >= 0)
          break;
        j++;
      }
      catch (StringIndexOutOfBoundsException localStringIndexOutOfBoundsException)
      {
        return -1;
      }
      label38: if (j >= i)
        j = -1;
    }
    return j;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof URLName))
      break label64;
    label64: label193: label200: 
    while (true)
    {
      return false;
      URLName localURLName = (URLName)paramObject;
      if ((localURLName.protocol != null) && (localURLName.protocol.equals(this.protocol)))
      {
        InetAddress localInetAddress1 = getHostAddress();
        InetAddress localInetAddress2 = localURLName.getHostAddress();
        String str1;
        if ((localInetAddress1 != null) && (localInetAddress2 != null))
        {
          if (localInetAddress1.equals(localInetAddress2))
            if ((this.username == localURLName.username) || ((this.username != null) && (this.username.equals(localURLName.username))))
              if (this.file == null)
              {
                str1 = "";
                label107: if (localURLName.file != null)
                  break label193;
              }
        }
        else
          for (String str2 = ""; ; str2 = localURLName.file)
          {
            if ((!str1.equals(str2)) || (this.port != localURLName.port))
              break label200;
            return true;
            if ((this.host != null) && (localURLName.host != null))
            {
              if (this.host.equalsIgnoreCase(localURLName.host))
                break;
              return false;
            }
            if (this.host == localURLName.host)
              break;
            return false;
            str1 = this.file;
            break label107;
          }
      }
    }
  }

  public String getFile()
  {
    return this.file;
  }

  public String getHost()
  {
    return this.host;
  }

  public String getPassword()
  {
    if (doEncode)
      return decode(this.password);
    return this.password;
  }

  public int getPort()
  {
    return this.port;
  }

  public String getProtocol()
  {
    return this.protocol;
  }

  public String getRef()
  {
    return this.ref;
  }

  public URL getURL()
    throws MalformedURLException
  {
    return new URL(getProtocol(), getHost(), getPort(), getFile());
  }

  public String getUsername()
  {
    if (doEncode)
      return decode(this.username);
    return this.username;
  }

  public int hashCode()
  {
    if (this.hashCode != 0)
      return this.hashCode;
    if (this.protocol != null)
      this.hashCode += this.protocol.hashCode();
    InetAddress localInetAddress = getHostAddress();
    if (localInetAddress != null)
      this.hashCode += localInetAddress.hashCode();
    while (true)
    {
      if (this.username != null)
        this.hashCode += this.username.hashCode();
      if (this.file != null)
        this.hashCode += this.file.hashCode();
      this.hashCode += this.port;
      return this.hashCode;
      if (this.host != null)
        this.hashCode += this.host.toLowerCase(Locale.ENGLISH).hashCode();
    }
  }

  protected void parseString(String paramString)
  {
    this.password = null;
    this.username = null;
    this.host = null;
    this.ref = null;
    this.file = null;
    this.protocol = null;
    this.port = -1;
    int i = paramString.length();
    int j = paramString.indexOf(':');
    if (j != -1)
      this.protocol = paramString.substring(0, j);
    String str1;
    String str3;
    label200: int i1;
    String str2;
    if (paramString.regionMatches(j + 1, "//", 0, 2))
    {
      int m = paramString.indexOf('/', j + 3);
      if (m != -1)
      {
        str1 = paramString.substring(j + 3, m);
        if (m + 1 < i)
        {
          this.file = paramString.substring(m + 1);
          int n = str1.indexOf('@');
          if (n != -1)
          {
            str3 = str1.substring(0, n);
            str1 = str1.substring(n + 1);
            int i2 = str3.indexOf(':');
            if (i2 == -1)
              break label356;
            this.username = str3.substring(0, i2);
            this.password = str3.substring(i2 + 1);
          }
          if ((str1.length() <= 0) || (str1.charAt(0) != '['))
            break label365;
          i1 = str1.indexOf(':', str1.indexOf(93));
          if (i1 == -1)
            break label387;
          str2 = str1.substring(i1 + 1);
          if (str2.length() <= 0);
        }
      }
    }
    while (true)
    {
      try
      {
        this.port = Integer.parseInt(str2);
        this.host = str1.substring(0, i1);
        if (this.file != null)
        {
          int k = this.file.indexOf('#');
          if (k != -1)
          {
            this.ref = this.file.substring(k + 1);
            this.file = this.file.substring(0, k);
          }
        }
        return;
        this.file = "";
        break;
        str1 = paramString.substring(j + 3);
        break;
        label356: this.username = str3;
        break label200;
        label365: i1 = str1.indexOf(':');
      }
      catch (NumberFormatException localNumberFormatException)
      {
        this.port = -1;
        continue;
      }
      label387: this.host = str1;
      continue;
      if (j + 1 < i)
        this.file = paramString.substring(j + 1);
    }
  }

  public String toString()
  {
    if (this.fullURL == null)
    {
      StringBuffer localStringBuffer = new StringBuffer();
      if (this.protocol != null)
      {
        localStringBuffer.append(this.protocol);
        localStringBuffer.append(":");
      }
      if ((this.username != null) || (this.host != null))
      {
        localStringBuffer.append("//");
        if (this.username != null)
        {
          localStringBuffer.append(this.username);
          if (this.password != null)
          {
            localStringBuffer.append(":");
            localStringBuffer.append(this.password);
          }
          localStringBuffer.append("@");
        }
        if (this.host != null)
          localStringBuffer.append(this.host);
        if (this.port != -1)
        {
          localStringBuffer.append(":");
          localStringBuffer.append(Integer.toString(this.port));
        }
        if (this.file != null)
          localStringBuffer.append("/");
      }
      if (this.file != null)
        localStringBuffer.append(this.file);
      if (this.ref != null)
      {
        localStringBuffer.append("#");
        localStringBuffer.append(this.ref);
      }
      this.fullURL = localStringBuffer.toString();
    }
    return this.fullURL;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.URLName
 * JD-Core Version:    0.6.2
 */