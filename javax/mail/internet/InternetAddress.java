package javax.mail.internet;

import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.StringTokenizer;
import java.util.Vector;
import javax.mail.Address;
import javax.mail.Session;

public class InternetAddress extends Address
  implements Cloneable
{
  private static final String rfc822phrase = "()<>@,;:\\\"\t .[]".replace(' ', '\000').replace('\t', '\000');
  private static final long serialVersionUID = -7507595530758302903L;
  private static final String specialsNoDot = "()<>,;:\\\"[]@";
  private static final String specialsNoDotNoAt = "()<>,;:\\\"[]";
  protected String address;
  protected String encodedPersonal;
  protected String personal;

  public InternetAddress()
  {
  }

  public InternetAddress(String paramString)
    throws AddressException
  {
    InternetAddress[] arrayOfInternetAddress = parse(paramString, true);
    if (arrayOfInternetAddress.length != 1)
      throw new AddressException("Illegal address", paramString);
    this.address = arrayOfInternetAddress[0].address;
    this.personal = arrayOfInternetAddress[0].personal;
    this.encodedPersonal = arrayOfInternetAddress[0].encodedPersonal;
  }

  public InternetAddress(String paramString1, String paramString2)
    throws UnsupportedEncodingException
  {
    this(paramString1, paramString2, null);
  }

  public InternetAddress(String paramString1, String paramString2, String paramString3)
    throws UnsupportedEncodingException
  {
    this.address = paramString1;
    setPersonal(paramString2, paramString3);
  }

  public InternetAddress(String paramString, boolean paramBoolean)
    throws AddressException
  {
    this(paramString);
    if (paramBoolean)
      checkAddress(this.address, true, true);
  }

  private static void checkAddress(String paramString, boolean paramBoolean1, boolean paramBoolean2)
    throws AddressException
  {
    if (paramString.indexOf('"') >= 0);
    label111: String str2;
    label172: 
    do
    {
      return;
      int i = 0;
      if (paramBoolean1);
      int k;
      int j;
      for (i = 0; ; i = k + 1)
      {
        k = indexOfAny(paramString, ",:", i);
        if (k < 0);
        while (true)
        {
          j = paramString.indexOf('@', i);
          if (j < 0)
            break label172;
          if (j != i)
            break label111;
          throw new AddressException("Missing local name", paramString);
          if (paramString.charAt(i) != '@')
            throw new AddressException("Illegal route-addr", paramString);
          if (paramString.charAt(k) != ':')
            break;
          i = k + 1;
        }
      }
      if (j == -1 + paramString.length())
        throw new AddressException("Missing domain", paramString);
      String str1 = paramString.substring(i, j);
      for (str2 = paramString.substring(j + 1); indexOfAny(paramString, " \t\n\r") >= 0; str2 = null)
      {
        throw new AddressException("Illegal whitespace in address", paramString);
        if (paramBoolean2)
          throw new AddressException("Missing final '@domain'", paramString);
        str1 = paramString;
      }
      if (indexOfAny(str1, "()<>,;:\\\"[]@") >= 0)
        throw new AddressException("Illegal character in local name", paramString);
    }
    while ((str2 == null) || (str2.indexOf('[') >= 0) || (indexOfAny(str2, "()<>,;:\\\"[]@") < 0));
    throw new AddressException("Illegal character in domain", paramString);
  }

  public static InternetAddress getLocalAddress(Session paramSession)
  {
    String str1 = null;
    if (paramSession == null);
    try
    {
      String str2 = System.getProperty("user.name");
      Object localObject = InetAddress.getLocalHost().getHostName();
      while (true)
      {
        if ((str1 == null) && (str2 != null) && (str2.length() != 0) && (localObject != null) && (((String)localObject).length() != 0))
          str1 = str2 + "@" + (String)localObject;
        if (str1 == null)
          break;
        return new InternetAddress(str1);
        str1 = paramSession.getProperty("mail.from");
        localObject = null;
        str2 = null;
        if (str1 == null)
        {
          str2 = paramSession.getProperty("mail.user");
          if ((str2 == null) || (str2.length() == 0))
            str2 = paramSession.getProperty("user.name");
          if ((str2 == null) || (str2.length() == 0))
            str2 = System.getProperty("user.name");
          localObject = paramSession.getProperty("mail.host");
          if ((localObject == null) || (((String)localObject).length() == 0))
          {
            InetAddress localInetAddress = InetAddress.getLocalHost();
            if (localInetAddress != null)
            {
              String str3 = localInetAddress.getHostName();
              localObject = str3;
            }
          }
        }
      }
    }
    catch (UnknownHostException localUnknownHostException)
    {
      return null;
    }
    catch (AddressException localAddressException)
    {
      break label203;
    }
    catch (SecurityException localSecurityException)
    {
      label203: break label203;
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

  private boolean isSimple()
  {
    return (this.address == null) || (indexOfAny(this.address, "()<>,;:\\\"[]") < 0);
  }

  private static int lengthOfFirstSegment(String paramString)
  {
    int i = paramString.indexOf("\r\n");
    if (i != -1)
      return i;
    return paramString.length();
  }

  private static int lengthOfLastSegment(String paramString, int paramInt)
  {
    int i = paramString.lastIndexOf("\r\n");
    if (i != -1)
      return -2 + (paramString.length() - i);
    return paramInt + paramString.length();
  }

  public static InternetAddress[] parse(String paramString)
    throws AddressException
  {
    return parse(paramString, true);
  }

  public static InternetAddress[] parse(String paramString, boolean paramBoolean)
    throws AddressException
  {
    return parse(paramString, paramBoolean, false);
  }

  private static InternetAddress[] parse(String paramString, boolean paramBoolean1, boolean paramBoolean2)
    throws AddressException
  {
    int i = -1;
    int j = -1;
    int k = paramString.length();
    int m = 0;
    boolean bool = false;
    int n = 0;
    Vector localVector = new Vector();
    int i1 = -1;
    int i2 = i1;
    int i3 = 0;
    String str3;
    if (i3 >= k)
      if (i2 >= 0)
      {
        if (i1 == -1)
          i1 = i3;
        str3 = paramString.substring(i2, i1).trim();
        if ((n == 0) && (!paramBoolean1) && (!paramBoolean2))
          break label1200;
        if ((paramBoolean1) || (!paramBoolean2))
          checkAddress(str3, bool, false);
        InternetAddress localInternetAddress4 = new InternetAddress();
        localInternetAddress4.setAddress(str3);
        if (i >= 0)
          localInternetAddress4.encodedPersonal = unquote(paramString.substring(i, j).trim());
        localVector.addElement(localInternetAddress4);
      }
    while (true)
    {
      InternetAddress[] arrayOfInternetAddress = new InternetAddress[localVector.size()];
      localVector.copyInto(arrayOfInternetAddress);
      return arrayOfInternetAddress;
      switch (paramString.charAt(i3))
      {
      default:
        if (i2 == -1)
          i2 = i3;
        break;
      case '\t':
      case '\n':
      case '\r':
      case ' ':
      case '(':
      case ')':
      case '<':
      case '>':
      case '"':
      case '[':
      case ',':
      case ':':
      case ';':
      }
      while (true)
      {
        i3++;
        break;
        n = 1;
        if ((i2 >= 0) && (i1 == -1))
          i1 = i3;
        if (i == -1)
          i = i3 + 1;
        int i6 = i3 + 1;
        int i7 = 1;
        if ((i6 >= k) || (i7 <= 0))
        {
          if (i7 > 0)
          {
            AddressException localAddressException10 = new AddressException("Missing ')'", paramString, i6);
            throw localAddressException10;
          }
        }
        else
        {
          switch (paramString.charAt(i6))
          {
          default:
          case '\\':
          case '(':
          case ')':
          }
          while (true)
          {
            i6++;
            break;
            i6++;
            continue;
            i7++;
            continue;
            i7--;
          }
        }
        i3 = i6 - 1;
        if (j == -1)
        {
          j = i3;
          continue;
          AddressException localAddressException9 = new AddressException("Missing '('", paramString, i3);
          throw localAddressException9;
          n = 1;
          if (bool)
          {
            AddressException localAddressException6 = new AddressException("Extra route-addr", paramString, i3);
            throw localAddressException6;
          }
          if (m == 0)
          {
            i = i2;
            if (i >= 0)
              j = i3;
            i2 = i3 + 1;
          }
          int i5 = 0;
          i3++;
          if (i3 >= k)
          {
            label536: if (i3 < k)
              break label658;
            if (i5 != 0)
            {
              AddressException localAddressException7 = new AddressException("Missing '\"'", paramString, i3);
              throw localAddressException7;
            }
          }
          else
          {
            switch (paramString.charAt(i3))
            {
            default:
            case '\\':
            case '"':
            case '>':
            }
            while (true)
            {
              i3++;
              break;
              i3++;
              continue;
              if (i5 != 0);
              for (i5 = 0; ; i5 = 1)
                break;
              if (i5 == 0)
                break label536;
            }
          }
          AddressException localAddressException8 = new AddressException("Missing '>'", paramString, i3);
          throw localAddressException8;
          label658: bool = true;
          i1 = i3;
          continue;
          AddressException localAddressException5 = new AddressException("Missing '<'", paramString, i3);
          throw localAddressException5;
          n = 1;
          if (i2 == -1)
            i2 = i3;
          i3++;
          if (i3 >= k)
          {
            if (i3 >= k)
            {
              AddressException localAddressException4 = new AddressException("Missing '\"'", paramString, i3);
              throw localAddressException4;
            }
          }
          else
          {
            switch (paramString.charAt(i3))
            {
            case '"':
            default:
            case '\\':
            }
            while (true)
            {
              i3++;
              break;
              i3++;
            }
            n = 1;
            i3++;
            if (i3 >= k)
            {
              if (i3 >= k)
              {
                AddressException localAddressException3 = new AddressException("Missing ']'", paramString, i3);
                throw localAddressException3;
              }
            }
            else
            {
              switch (paramString.charAt(i3))
              {
              case ']':
              default:
              case '\\':
              }
              while (true)
              {
                i3++;
                break;
                i3++;
              }
              if (i2 == -1)
              {
                i1 = -1;
                i2 = i1;
                n = 0;
                bool = false;
              }
              else if (m != 0)
              {
                bool = false;
              }
              else
              {
                if (i1 == -1)
                  i1 = i3;
                String str1 = paramString.substring(i2, i1).trim();
                if ((n != 0) || (paramBoolean1) || (paramBoolean2))
                {
                  if ((paramBoolean1) || (!paramBoolean2))
                    checkAddress(str1, bool, false);
                  InternetAddress localInternetAddress2 = new InternetAddress();
                  localInternetAddress2.setAddress(str1);
                  if (i >= 0)
                  {
                    localInternetAddress2.encodedPersonal = unquote(paramString.substring(i, j).trim());
                    j = -1;
                    i = j;
                  }
                  localVector.addElement(localInternetAddress2);
                }
                while (true)
                {
                  i1 = -1;
                  i2 = i1;
                  n = 0;
                  bool = false;
                  break;
                  StringTokenizer localStringTokenizer1 = new StringTokenizer(str1);
                  while (localStringTokenizer1.hasMoreTokens())
                  {
                    String str2 = localStringTokenizer1.nextToken();
                    checkAddress(str2, false, false);
                    InternetAddress localInternetAddress3 = new InternetAddress();
                    localInternetAddress3.setAddress(str2);
                    localVector.addElement(localInternetAddress3);
                  }
                }
                n = 1;
                if (m != 0)
                {
                  AddressException localAddressException2 = new AddressException("Nested group", paramString, i3);
                  throw localAddressException2;
                }
                m = 1;
                if (i2 == -1)
                {
                  i2 = i3;
                  continue;
                  if (i2 == -1)
                    i2 = i3;
                  if (m == 0)
                  {
                    AddressException localAddressException1 = new AddressException("Illegal semicolon, not in group", paramString, i3);
                    throw localAddressException1;
                  }
                  if (i2 == -1)
                    i2 = i3;
                  InternetAddress localInternetAddress1 = new InternetAddress();
                  int i4 = i3 + 1;
                  localInternetAddress1.setAddress(paramString.substring(i2, i4).trim());
                  localVector.addElement(localInternetAddress1);
                  i1 = -1;
                  i2 = i1;
                  m = 0;
                  bool = false;
                }
              }
            }
          }
        }
      }
      label1200: StringTokenizer localStringTokenizer2 = new StringTokenizer(str3);
      while (localStringTokenizer2.hasMoreTokens())
      {
        String str4 = localStringTokenizer2.nextToken();
        checkAddress(str4, false, false);
        InternetAddress localInternetAddress5 = new InternetAddress();
        localInternetAddress5.setAddress(str4);
        localVector.addElement(localInternetAddress5);
      }
    }
  }

  public static InternetAddress[] parseHeader(String paramString, boolean paramBoolean)
    throws AddressException
  {
    return parse(paramString, paramBoolean, true);
  }

  private static String quotePhrase(String paramString)
  {
    int i = paramString.length();
    int j = 0;
    for (int k = 0; ; k++)
    {
      if (k >= i)
      {
        if (j != 0)
        {
          StringBuffer localStringBuffer2 = new StringBuffer(i + 2);
          localStringBuffer2.append('"').append(paramString).append('"');
          paramString = localStringBuffer2.toString();
        }
        return paramString;
      }
      int m = paramString.charAt(k);
      if ((m == 34) || (m == 92))
      {
        StringBuffer localStringBuffer1 = new StringBuffer(i + 3);
        localStringBuffer1.append('"');
        for (int n = 0; ; n++)
        {
          if (n >= i)
          {
            localStringBuffer1.append('"');
            return localStringBuffer1.toString();
          }
          char c = paramString.charAt(n);
          if ((c == '"') || (c == '\\'))
            localStringBuffer1.append('\\');
          localStringBuffer1.append(c);
        }
      }
      if (((m < 32) && (m != 13) && (m != 10) && (m != 9)) || (m >= 127) || (rfc822phrase.indexOf(m) >= 0))
        j = 1;
    }
  }

  public static String toString(Address[] paramArrayOfAddress)
  {
    return toString(paramArrayOfAddress, 0);
  }

  public static String toString(Address[] paramArrayOfAddress, int paramInt)
  {
    if ((paramArrayOfAddress == null) || (paramArrayOfAddress.length == 0))
      return null;
    StringBuffer localStringBuffer = new StringBuffer();
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfAddress.length)
        return localStringBuffer.toString();
      if (i != 0)
      {
        localStringBuffer.append(", ");
        paramInt += 2;
      }
      String str = paramArrayOfAddress[i].toString();
      if (paramInt + lengthOfFirstSegment(str) > 76)
      {
        localStringBuffer.append("\r\n\t");
        paramInt = 8;
      }
      localStringBuffer.append(str);
      paramInt = lengthOfLastSegment(str, paramInt);
    }
  }

  private static String unquote(String paramString)
  {
    StringBuffer localStringBuffer;
    if ((paramString.startsWith("\"")) && (paramString.endsWith("\"")))
    {
      paramString = paramString.substring(1, -1 + paramString.length());
      if (paramString.indexOf('\\') >= 0)
        localStringBuffer = new StringBuffer(paramString.length());
    }
    for (int i = 0; ; i++)
    {
      if (i >= paramString.length())
      {
        paramString = localStringBuffer.toString();
        return paramString;
      }
      char c = paramString.charAt(i);
      if ((c == '\\') && (i < -1 + paramString.length()))
      {
        i++;
        c = paramString.charAt(i);
      }
      localStringBuffer.append(c);
    }
  }

  public Object clone()
  {
    try
    {
      InternetAddress localInternetAddress = (InternetAddress)super.clone();
      return localInternetAddress;
    }
    catch (CloneNotSupportedException localCloneNotSupportedException)
    {
    }
    return null;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof InternetAddress));
    String str;
    do
    {
      return false;
      str = ((InternetAddress)paramObject).getAddress();
      if (str == this.address)
        return true;
    }
    while ((this.address == null) || (!this.address.equalsIgnoreCase(str)));
    return true;
  }

  public String getAddress()
  {
    return this.address;
  }

  public InternetAddress[] getGroup(boolean paramBoolean)
    throws AddressException
  {
    String str = getAddress();
    if (!str.endsWith(";"));
    int i;
    do
    {
      return null;
      i = str.indexOf(':');
    }
    while (i < 0);
    return parseHeader(str.substring(i + 1, -1 + str.length()), paramBoolean);
  }

  public String getPersonal()
  {
    if (this.personal != null)
      return this.personal;
    if (this.encodedPersonal != null)
      try
      {
        this.personal = MimeUtility.decodeText(this.encodedPersonal);
        String str = this.personal;
        return str;
      }
      catch (Exception localException)
      {
        return this.encodedPersonal;
      }
    return null;
  }

  public String getType()
  {
    return "rfc822";
  }

  public int hashCode()
  {
    if (this.address == null)
      return 0;
    return this.address.toLowerCase(Locale.ENGLISH).hashCode();
  }

  public boolean isGroup()
  {
    return (this.address != null) && (this.address.endsWith(";")) && (this.address.indexOf(':') > 0);
  }

  public void setAddress(String paramString)
  {
    this.address = paramString;
  }

  public void setPersonal(String paramString)
    throws UnsupportedEncodingException
  {
    this.personal = paramString;
    if (paramString != null)
    {
      this.encodedPersonal = MimeUtility.encodeWord(paramString);
      return;
    }
    this.encodedPersonal = null;
  }

  public void setPersonal(String paramString1, String paramString2)
    throws UnsupportedEncodingException
  {
    this.personal = paramString1;
    if (paramString1 != null)
    {
      this.encodedPersonal = MimeUtility.encodeWord(paramString1, paramString2, null);
      return;
    }
    this.encodedPersonal = null;
  }

  public String toString()
  {
    if ((this.encodedPersonal == null) && (this.personal != null));
    try
    {
      this.encodedPersonal = MimeUtility.encodeWord(this.personal);
      label25: if (this.encodedPersonal != null)
        return quotePhrase(this.encodedPersonal) + " <" + this.address + ">";
      if ((isGroup()) || (isSimple()))
        return this.address;
      return "<" + this.address + ">";
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      break label25;
    }
  }

  public String toUnicodeString()
  {
    String str = getPersonal();
    if (str != null)
      return quotePhrase(str) + " <" + this.address + ">";
    if ((isGroup()) || (isSimple()))
      return this.address;
    return "<" + this.address + ">";
  }

  public void validate()
    throws AddressException
  {
    checkAddress(getAddress(), true, true);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.InternetAddress
 * JD-Core Version:    0.6.2
 */