package javax.mail.internet;

import java.util.Locale;
import java.util.StringTokenizer;
import java.util.Vector;
import javax.mail.Address;

public class NewsAddress extends Address
{
  private static final long serialVersionUID = -4203797299824684143L;
  protected String host;
  protected String newsgroup;

  public NewsAddress()
  {
  }

  public NewsAddress(String paramString)
  {
    this(paramString, null);
  }

  public NewsAddress(String paramString1, String paramString2)
  {
    this.newsgroup = paramString1;
    this.host = paramString2;
  }

  public static NewsAddress[] parse(String paramString)
    throws AddressException
  {
    StringTokenizer localStringTokenizer = new StringTokenizer(paramString, ",");
    Vector localVector = new Vector();
    while (true)
    {
      if (!localStringTokenizer.hasMoreTokens())
      {
        int i = localVector.size();
        NewsAddress[] arrayOfNewsAddress = new NewsAddress[i];
        if (i > 0)
          localVector.copyInto(arrayOfNewsAddress);
        return arrayOfNewsAddress;
      }
      localVector.addElement(new NewsAddress(localStringTokenizer.nextToken()));
    }
  }

  public static String toString(Address[] paramArrayOfAddress)
  {
    if ((paramArrayOfAddress == null) || (paramArrayOfAddress.length == 0))
      return null;
    StringBuffer localStringBuffer = new StringBuffer(((NewsAddress)paramArrayOfAddress[0]).toString());
    for (int i = 1; ; i++)
    {
      if (i >= paramArrayOfAddress.length)
        return localStringBuffer.toString();
      localStringBuffer.append(",").append(((NewsAddress)paramArrayOfAddress[i]).toString());
    }
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof NewsAddress));
    NewsAddress localNewsAddress;
    do
    {
      return false;
      localNewsAddress = (NewsAddress)paramObject;
    }
    while ((!this.newsgroup.equals(localNewsAddress.newsgroup)) || (((this.host != null) || (localNewsAddress.host != null)) && ((this.host == null) || (localNewsAddress.host == null) || (!this.host.equalsIgnoreCase(localNewsAddress.host)))));
    return true;
  }

  public String getHost()
  {
    return this.host;
  }

  public String getNewsgroup()
  {
    return this.newsgroup;
  }

  public String getType()
  {
    return "news";
  }

  public int hashCode()
  {
    String str = this.newsgroup;
    int i = 0;
    if (str != null)
      i = 0 + this.newsgroup.hashCode();
    if (this.host != null)
      i += this.host.toLowerCase(Locale.ENGLISH).hashCode();
    return i;
  }

  public void setHost(String paramString)
  {
    this.host = paramString;
  }

  public void setNewsgroup(String paramString)
  {
    this.newsgroup = paramString;
  }

  public String toString()
  {
    return this.newsgroup;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.NewsAddress
 * JD-Core Version:    0.6.2
 */